import { shurjopay } from "@/lib/shurjopay";
import type { PaymentRequest } from "@/lib/shurjopay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
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
    } = body;

    // Validate required fields
    if (
      !amount ||
      !fullName ||
      !mobileNumber ||
      !participationType ||
      !totalParticipants ||
      !participantBreakdown ||
      !culturalInterest ||
      !sportsInterest ||
      !contributionAgreement ||
      !sponsorshipAgreement ||
      !volunteerInterest ||
      !comments
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const paymentRequest: PaymentRequest = {
      order_id: orderId,
      amount: parseFloat(body.amount),
      currency: "BDT",
      customer_name: fullName,
      customer_phone: mobileNumber,
      customer_address: "",
      customer_city: "",
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
