import { NextRequest, NextResponse } from "next/server";
import { shurjopay } from "@/lib/shurjopay";

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
