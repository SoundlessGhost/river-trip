// app/api/payment/verify/route.ts

import { Resend } from "resend";
import { shurjopay } from "@/lib/shurjopay";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { sendSMS, generateRegistrationSMS } from "@/lib/sms-service";
import { generateAdminEmail, generateUserEmail } from "@/lib/email-template";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

interface ShurjoPayVerifyResponse {
  bank_status?: string;
  sp_message?: string;
  order_id?: string;
  sp_order_id?: string;
  transaction_id?: string;
  [key: string]: unknown;
}

function isPaymentSuccess(response: ShurjoPayVerifyResponse): boolean {
  const bank = String(response?.bank_status || "").toLowerCase();
  const msg = String(response?.sp_message || "").toLowerCase();
  return bank === "success" || msg === "success";
}

export async function POST(request: NextRequest) {
  let order_id = "";

  try {
    const body: { order_id?: string } = await request.json();
    order_id = body?.order_id ? String(body.order_id) : "";

    console.log("🔎 VERIFY RECEIVED ORDER_ID:", order_id);

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "order_id is required" },
        { status: 400 }
      );
    }

    // ✅ DATABASE থেকে REGISTRATION INFO FETCH
    let registration = await prisma.registration.findUnique({
      where: { id: order_id },
    });

    if (!registration) {
      registration = await prisma.registration.findFirst({
        where: { transactionId: order_id },
      });
    }

    if (!registration) {
      console.log("❌ REGISTRATION NOT FOUND FOR ORDER_ID:", order_id);
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    console.log("📋 REGISTRATION DATA:", {
      id: registration.id,
      name: registration.fullName,
      phone: registration.mobileNumber,
      currentStatus: registration.paymentStatus,
    });

    // 🚨 যদি আগে থেকেই SUCCESS হয়ে থাকে, duplicate SMS/Email পাঠাবেন না
    if (registration.paymentStatus === "SUCCESS") {
      console.log("⚠️ PAYMENT ALREADY VERIFIED - SKIPPING NOTIFICATIONS");
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        data: { status: "already_verified" },
      });
    }

    // ✅ SHURJOPAY থেকে PAYMENT VERIFY
    const response = (await shurjopay.verifyPayment(
      order_id
    )) as unknown as ShurjoPayVerifyResponse;

    console.log("✅ SHURJOPAY VERIFY RESPONSE:", response);

    const success = isPaymentSuccess(response);

    const updateRegistration = async (data: {
      paymentStatus: "SUCCESS" | "FAILED";
      transactionId?: string;
      updatedAt: Date;
    }) => {
      let updated = await prisma.registration.updateMany({
        where: { id: order_id },
        data,
      });

      if (updated.count === 0) {
        updated = await prisma.registration.updateMany({
          where: { transactionId: order_id },
          data,
        });
      }

      return updated.count;
    };

    // ✅ PAYMENT SUCCESS হলে
    if (success) {
      const txId = response?.sp_order_id
        ? String(response.sp_order_id)
        : response?.order_id
        ? String(response.order_id)
        : order_id;

      // DATABASE UPDATE
      const count = await updateRegistration({
        paymentStatus: "SUCCESS",
        transactionId: txId,
        updatedAt: new Date(),
      });

      if (count === 0) {
        console.log("❌ DB UPDATE FAILED FOR:", order_id);
      } else {
        console.log("✅ DATABASE UPDATED - PAYMENT SUCCESS");
      }

      // ✅ SMS + EMAIL পাঠান (parallel execution)
      const notificationPromises = [];

      // 1️⃣ SMS পাঠান
      const smsMessage = generateRegistrationSMS(
        registration.fullName,
        registration.amount,
        order_id
      );

      notificationPromises.push(
        sendSMS(registration.mobileNumber, smsMessage)
          .then((result) => {
            if (result.success) {
              console.log("✅ SMS SENT TO:", registration.mobileNumber);
            } else {
              console.error("❌ SMS FAILED:", result.error);
            }
          })
          .catch((error) => {
            console.error("❌ SMS ERROR:", error);
          })
      );

      // 2️⃣ ADMIN EMAIL
      if (process.env.ADMIN_EMAIL) {
        notificationPromises.push(
          resend.emails
            .send({
              from: "Nadi Yatra <noreply@send.dekhai.org>",
              to: process.env.ADMIN_EMAIL,
              subject: `✅ NEW REGISTRATION - ${registration.fullName}`,
              html: generateAdminEmail(response, registration),
            })
            .then(() => {
              console.log("✅ ADMIN EMAIL SENT");
            })
            .catch((error) => {
              console.error("❌ ADMIN EMAIL ERROR:", error);
            })
        );
      }

      // 3️⃣ USER EMAIL
      if (registration.email) {
        notificationPromises.push(
          resend.emails
            .send({
              from: "Nadi Yatra <noreply@send.dekhai.org>",
              to: registration.email,
              subject: `✅ নদী যাত্রা ২০২৬ - আপনার রেজিস্ট্রেশন সফল হয়েছে`,
              html: generateUserEmail(response, registration),
            })
            .then(() => {
              console.log("✅ USER EMAIL SENT TO:", registration.email);
            })
            .catch((error) => {
              console.error("❌ USER EMAIL ERROR:", error);
            })
        );
      }

      // সব notification একসাথে পাঠান (don't wait for completion)
      Promise.allSettled(notificationPromises).then(() => {
        console.log("📧 All notifications processed");
      });

      return NextResponse.json({
        success: true,
        data: response,
      });
    }

    // ❌ PAYMENT FAILED হলে
    const count = await updateRegistration({
      paymentStatus: "FAILED",
      updatedAt: new Date(),
    });

    if (count === 0) {
      console.log("❌ DB UPDATE FAILED (FAILED CASE):", order_id);
    } else {
      console.log("❌ DATABASE UPDATED - PAYMENT FAILED");
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("❌ PAYMENT VERIFICATION ERROR:", error);

    // Database update করার চেষ্টা করুন (FAILED হিসেবে)
    try {
      if (order_id) {
        const updated = await prisma.registration.updateMany({
          where: { id: order_id },
          data: { paymentStatus: "FAILED", updatedAt: new Date() },
        });

        if (updated.count === 0) {
          await prisma.registration.updateMany({
            where: { transactionId: order_id },
            data: { paymentStatus: "FAILED", updatedAt: new Date() },
          });
        }
      }
    } catch (dbError) {
      console.error("❌ DATABASE UPDATE ERROR:", dbError);
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "PAYMENT VERIFICATION FAILED",
      },
      { status: 500 }
    );
  }
}
