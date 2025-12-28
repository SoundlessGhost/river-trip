/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payment/ipn/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus, PrismaClient } from "@prisma/client";

interface ShurjopayIPNPayload {
  order_id?: string;
  transaction_id?: string;
  txn_id?: string;
  amount?: string | number;
  status?: string;
  payment_status?: string;
  bank_status?: string;
  // Shurjopay থেকে আরো fields আসতে পারে
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body: ShurjopayIPNPayload = await request.json();

    console.log("🔔 IPN Received (POST):", JSON.stringify(body, null, 2));

    // Extract data (Shurjopay different field names use করতে পারে)
    const orderId = body.order_id;
    const transactionId = body.transaction_id || body.txn_id;
    const amount = body.amount;
    const status = body.status || body.payment_status || body.bank_status;

    // Validation
    if (!orderId) {
      console.error("❌ Missing order_id");
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 }
      );
    }

    if (!transactionId) {
      console.error("❌ Missing transaction_id");
      return NextResponse.json(
        { success: false, error: "Missing transaction_id" },
        { status: 400 }
      );
    }

    // Check if registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: orderId },
    });

    if (!registration) {
      console.error("❌ Registration not found:", orderId);
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    // Determine payment status
    let paymentStatus: PaymentStatus;

    // Shurjopay যদি "success", "completed", "paid" এরকম কিছু পাঠায়
    if (
      status?.toLowerCase() === "success" ||
      status?.toLowerCase() === "completed" ||
      status?.toLowerCase() === "paid"
    ) {
      paymentStatus = PaymentStatus.SUCCESS;
    } else if (status?.toLowerCase() === "failed") {
      paymentStatus = PaymentStatus.FAILED;
    } else if (status?.toLowerCase() === "cancelled") {
      paymentStatus = PaymentStatus.CANCELLED;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }

    // Update database
    const updated = await prisma.registration.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        transactionId,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Payment updated successfully:", {
      id: updated.id,
      status: updated.paymentStatus,
      txnId: updated.transactionId,
    });

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: "IPN processed successfully",
        data: {
          order_id: updated.id,
          payment_status: updated.paymentStatus,
          transaction_id: updated.transactionId,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ IPN Error:", error);

    // Prisma unique constraint error
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET method support
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("order_id");
    const transactionId =
      searchParams.get("transaction_id") || searchParams.get("txn_id");
    const status =
      searchParams.get("status") || searchParams.get("payment_status");

    console.log("🔔 IPN Received (GET):", {
      orderId,
      transactionId,
      status,
      allParams: Object.fromEntries(searchParams),
    });

    if (!orderId || !transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check registration
    const registration = await prisma.registration.findUnique({
      where: { id: orderId },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    // Determine payment status
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;

    if (
      status?.toLowerCase() === "success" ||
      status?.toLowerCase() === "completed"
    ) {
      paymentStatus = PaymentStatus.SUCCESS;
    } else if (status?.toLowerCase() === "failed") {
      paymentStatus = PaymentStatus.FAILED;
    } else if (status?.toLowerCase() === "cancelled") {
      paymentStatus = PaymentStatus.CANCELLED;
    }

    // Update
    const updated = await prisma.registration.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        transactionId,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Payment updated (GET):", updated.id);

    return NextResponse.json({
      success: true,
      message: "IPN processed successfully",
      data: {
        order_id: updated.id,
        payment_status: updated.paymentStatus,
      },
    });
  } catch (error: any) {
    console.error("❌ IPN GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
