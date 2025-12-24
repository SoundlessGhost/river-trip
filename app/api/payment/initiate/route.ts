import { NextRequest, NextResponse } from "next/server";
import { shurjopay } from "@/lib/shurjopay";
import type { PaymentRequest } from "@/lib/shurjopay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.amount ||
      !body.customer_name ||
      !body.customer_email ||
      !body.customer_phone ||
      !body.customer_address ||
      !body.customer_city
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
      customer_name: body.customer_name,
      customer_address: body.customer_address,
      customer_city: body.customer_city,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      customer_state: body.customer_state || "",
      customer_postcode: body.customer_postcode || "",
    };

    const response = await shurjopay.makePayment(paymentRequest);

    return NextResponse.json({
      success: true,
      data: response,
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
