// app/api/payment/verify/route.ts

import { Resend } from "resend";
import { shurjopay } from "@/lib/shurjopay";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { generatePaymentEmail } from "@/lib/email-template";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ ShurjoPay verify response type (minimum needed fields)
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
    // ✅ read body once
    const body: { order_id?: string } = await request.json();
    order_id = body?.order_id ? String(body.order_id) : "";

    console.log("🔎 VERIFY received order_id:", order_id);

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "order_id is required" },
        { status: 400 }
      );
    }

    // ✅ verify payment from shurjopay
    const response = (await shurjopay.verifyPayment(
      order_id
    )) as unknown as ShurjoPayVerifyResponse;

    console.log("✅ SHURJOPAY VERIFY RESPONSE:", {
      bank_status: response?.bank_status,
      sp_message: response?.sp_message,
      order_id: response?.order_id,
      sp_order_id: response?.sp_order_id,
      transaction_id: response?.transaction_id,
    });

    const success = isPaymentSuccess(response);

    // ✅ helper: update by id first, then by transactionId (fallback)
    const updateRegistration = async (data: {
      paymentStatus: "SUCCESS" | "FAILED";
      transactionId?: string;
      updatedAt: Date;
    }) => {
      // 1) try match by Registration.id (your cuid)
      let updated = await prisma.registration.updateMany({
        where: { id: order_id },
        data,
      });

      // 2) fallback match by transactionId (stored sp_order_id)
      if (updated.count === 0) {
        updated = await prisma.registration.updateMany({
          where: { transactionId: order_id },
          data,
        });
      }

      return updated.count; // 0 হলে match হয়নি
    };

    if (success) {
      // ✅ SUCCESS update
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
          "❌ DB UPDATE FAILED: No matching registration for:",
          order_id
        );
      } else {
        console.log("✅ DATABASE UPDATED - PAYMENT MARKED AS SUCCESS");
      }

      // ✅ send email (only if success)
      try {
        if (process.env.ADMIN_EMAIL) {
          await resend.emails.send({
            from: "Nadi Yatra <onboarding@resend.dev>",
            to: process.env.ADMIN_EMAIL,
            subject: `✅ PAYMENT SUCCESSFUL - ${
              response?.order_id || order_id
            }`,
            html: generatePaymentEmail(response),
          });
          console.log("✅ PAYMENT EMAIL SENT SUCCESSFULLY TO ADMIN");
        } else {
          console.log("⚠️ ADMIN_EMAIL not set, email not sent.");
        }
      } catch (emailError) {
        console.error("❌ PAYMENT EMAIL ERROR:", emailError);
      }

      return NextResponse.json({
        success: true,
        data: response,
      });
    }

    // ✅ FAILED update
    const count = await updateRegistration({
      paymentStatus: "FAILED",
      updatedAt: new Date(),
    });

    if (count === 0) {
      console.log(
        "❌ DB UPDATE FAILED (FAILED CASE): No matching registration for:",
        order_id
      );
    } else {
      console.log("❌ DATABASE UPDATED - PAYMENT MARKED AS FAILED");
    }

    console.log(
      "⚠️ PAYMENT NOT SUCCESSFUL:",
      response?.bank_status,
      response?.sp_message
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);

    // ✅ try to mark failed (without re-reading request.json)
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
