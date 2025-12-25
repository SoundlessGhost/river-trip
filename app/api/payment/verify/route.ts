import { NextRequest, NextResponse } from "next/server";
import { shurjopay } from "@/lib/shurjopay";
import { Resend } from "resend";
import { generatePaymentEmail } from "@/lib/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "order_id is required" },
        { status: 400 }
      );
    }

    const response = await shurjopay.verifyPayment(order_id);

    // ✅ Only send email if payment is successful
    if (
      response.bank_status === "Success" ||
      response.sp_message === "Success"
    ) {
      try {
        await resend.emails.send({
          from: "Nadi Yatra <onboarding@resend.dev>",
          to: process.env.ADMIN_EMAIL!,
          subject: `✅ PAYMENT SUCCESSFUL - ${response.order_id}`,
          html: generatePaymentEmail(response),
        });

        console.log("✅ PAYMENT EMAIL SENT SUCCESSFULLY TO ADMIN");
      } catch (emailError) {
        console.error("❌ PAYMENT EMAIL ERROR:", emailError);
      }
    } else {
      console.log(
        "⚠️ Payment not successful, email not sent:",
        response.bank_status
      );
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      { status: 500 }
    );
  }
}
