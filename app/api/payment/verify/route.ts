// app/api/payment/verify/route.ts

import { Resend } from "resend";
import { shurjopay } from "@/lib/shurjopay";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
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

    // ✅ DATABASE থেকে registration info fetch করুন
    let registration = await prisma.registration.findUnique({
      where: { id: order_id },
    });

    if (!registration) {
      registration = await prisma.registration.findFirst({
        where: { transactionId: order_id },
      });
    }

    console.log("📋 REGISTRATION DATA:", registration);

    // ✅ verify payment from shurjopay
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

    if (success) {
      const txId = response?.sp_order_id
        ? String(response.sp_order_id)
        : response?.order_id
        ? String(response.order_id)
        : order_id;

      const count = await updateRegistration({
        paymentStatus: "SUCCESS",
        transactionId: txId,
        updatedAt: new Date(),
      });

      if (count === 0) {
        console.log(
          "❌ DB UPDATE FAILED: NO MATCHING REGISTRATION FOR:",
          order_id
        );
      } else {
        console.log("✅ DATABASE UPDATED - PAYMENT MARKED AS SUCCESS");
      }

      // ✅ SEND 2 EMAILS - ADMIN এবং USER
      if (registration) {
        try {
          // 1️⃣ ADMIN EMAIL
          if (process.env.ADMIN_EMAIL) {
            await resend.emails.send({
              from: "Nadi Yatra <onboarding@resend.dev>",
              to: process.env.ADMIN_EMAIL,
              subject: `✅ NEW REGISTRATION - ${registration.fullName}`,
              html: generateAdminEmail(response, registration),
            });
            console.log("✅ ADMIN EMAIL SENT SUCCESSFULLY");
          }

          // 2️⃣ USER EMAIL
          if (registration.email) {
            await resend.emails.send({
              from: "Nadi Yatra <onboarding@resend.dev>",
              to: registration.email,
              subject: `✅ নদী যাত্রা ২০২৬ - আপনার রেজিস্ট্রেশন সফল হয়েছে`,
              html: generateUserEmail(response, registration),
            });
            console.log(
              "✅ USER EMAIL SENT SUCCESSFULLY TO:",
              registration.email
            );
          }
        } catch (emailError) {
          console.error("❌ EMAIL ERROR:", emailError);
        }
      } else {
        console.log("⚠️ REGISTRATION NOT FOUND, EMAILS NOT SENT");
      }

      return NextResponse.json({
        success: true,
        data: response,
      });
    }

    const count = await updateRegistration({
      paymentStatus: "FAILED",
      updatedAt: new Date(),
    });

    if (count === 0) {
      console.log("❌ DB UPDATE FAILED (FAILED CASE):", order_id);
    } else {
      console.log("❌ DATABASE UPDATED - PAYMENT MARKED AS FAILED");
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);

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
      console.error("DATABASE UPDATE ERROR:", dbError);
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
