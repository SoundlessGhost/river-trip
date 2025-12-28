// app/api/payment/ipn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

interface ShurjopayIPNPayload {
  order_id: string;
  sp_order_id: string;
  bank_status: string;
  sp_code: string;
  sp_message: string;
  amount: string;
  currency: string;
  bank_trx_id?: string;
  customer_order_id?: string;
  customer_phone?: string;
  customer_name?: string;
  payment_method?: string;
  date_time?: string;
}

// Helper function to extract data from both POST body and GET params
async function extractIPNData(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Try POST body first
  let data: Partial<ShurjopayIPNPayload> = {};
  try {
    const body = await request.json();
    data = { ...body };
  } catch {
    // If no body, use query params
  }

  // Merge with query params (query params take precedence if both exist)
  searchParams.forEach((value, key) => {
    data[key as keyof ShurjopayIPNPayload] = value;
  });

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await extractIPNData(request);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔔 SHURJOPAY IPN RECEIVED (POST)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(body, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const { order_id, sp_order_id, bank_status, sp_code } = body;

    // Validation
    if (!order_id) {
      console.error("❌ Missing order_id");
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 }
      );
    }

    // For testing, if sp_order_id is missing, use a dummy one
    const transactionId = sp_order_id || `TEST_${Date.now()}`;

    // Check if registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: order_id },
    });

    if (!registration) {
      console.error("❌ Registration not found:", order_id);
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    // Determine payment status
    let paymentStatus: PaymentStatus;

    if (bank_status?.toLowerCase() === "success" && sp_code === "1000") {
      paymentStatus = PaymentStatus.SUCCESS;
      console.log("✅ Payment SUCCESS");
    } else if (
      bank_status?.toLowerCase() === "failed" ||
      bank_status?.toLowerCase() === "cancelled"
    ) {
      paymentStatus = PaymentStatus.FAILED;
      console.log("❌ Payment FAILED/CANCELLED");
    } else {
      paymentStatus = PaymentStatus.PENDING;
      console.log("⏳ Payment PENDING");
    }

    // Update database
    const updated = await prisma.registration.update({
      where: { id: order_id },
      data: {
        paymentStatus,
        transactionId,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Database Updated:", {
      id: updated.id,
      paymentStatus: updated.paymentStatus,
      transactionId: updated.transactionId,
    });

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
  } catch (error: unknown) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ IPN PROCESSING ERROR");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(error);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔔 SHURJOPAY IPN (GET) RECEIVED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(params, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const order_id = searchParams.get("order_id");
    const sp_order_id = searchParams.get("sp_order_id");
    const bank_status = searchParams.get("bank_status");
    const sp_code = searchParams.get("sp_code");

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 }
      );
    }

    const transactionId = sp_order_id || `TEST_GET_${Date.now()}`;

    const registration = await prisma.registration.findUnique({
      where: { id: transactionId },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    let paymentStatus: PaymentStatus;

    if (bank_status?.toLowerCase() === "success" && sp_code === "1000") {
      paymentStatus = PaymentStatus.SUCCESS;
    } else if (
      bank_status?.toLowerCase() === "failed" ||
      bank_status?.toLowerCase() === "cancelled"
    ) {
      paymentStatus = PaymentStatus.FAILED;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }

    const updated = await prisma.registration.update({
      where: { id: order_id },
      data: {
        paymentStatus,
        transactionId,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Database Updated (GET):", updated.id);

    return NextResponse.json({
      success: true,
      message: "IPN processed successfully",
      data: {
        order_id: updated.id,
        payment_status: updated.paymentStatus,
      },
    });
  } catch (error: unknown) {
    console.error("❌ IPN GET Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// RZS694fe4510f95b
