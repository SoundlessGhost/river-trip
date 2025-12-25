import { Resend } from "resend";
import { shurjopay } from "@/lib/shurjopay";
import type { PaymentRequest } from "@/lib/shurjopay";
import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationEmail } from "@/lib/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      fullName,
      mobileNumber,
      participationType,
      totalParticipants,
      participantBreakdown,
      culturalInterest,
      sportsInterest,
      contributionAgreement,
      sponsorshipAgreement,
      volunteerInterest,
      comments,
    } = body;

    // Validate required fields
    if (!amount || !fullName || !mobileNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // ✅ Admin কে email পাঠান
    try {
      await resend.emails.send({
        from: "Nadi Yatra <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL!,
        subject: `নতুন নিবন্ধন - ${fullName} - ${orderId}`,
        html: generateRegistrationEmail({
          orderId,
          fullName,
          mobileNumber,
          participationType,
          totalParticipants,
          participantBreakdown,
          culturalInterest,
          sportsInterest,
          contributionAgreement,
          sponsorshipAgreement,
          volunteerInterest,
          comments,
          amount,
        }),
      });

      console.log("✅ Email sent successfully to admin");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
    }

    const paymentRequest: PaymentRequest = {
      order_id: orderId,
      amount: parseFloat(body.amount),
      currency: "BDT",
      customer_name: fullName,
      customer_phone: mobileNumber,
      customer_address: "Rangpur",
      customer_city: "Rangpur",
      customer_email: "",
      customer_state: "",
      customer_postcode: "",
    };

    const response = await shurjopay.makePayment(paymentRequest);

    return NextResponse.json({
      success: true,
      data: response,
      orderId,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Payment initiation failed",
      },
      { status: 500 }
    );
  }
}
