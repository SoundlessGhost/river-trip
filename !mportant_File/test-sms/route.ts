// app/api/test-sms/route.ts
// এই ফাইলটি শুধুমাত্র testing এর জন্য
// Production এ deploy করার আগে এটি মুছে ফেলবেন

import { NextRequest, NextResponse } from "next/server";
import { sendSMS, generateRegistrationSMS } from "@/lib/sms-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, name, amount, orderId } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate SMS message
    const message = generateRegistrationSMS(
      name || "Test User",
      amount || 1000,
      orderId || "TEST-ORDER-001"
    );

    console.log("🧪 Testing SMS send...");
    console.log("📱 Phone:", phoneNumber);
    console.log("📝 Message:", message);

    // Send SMS
    const result = await sendSMS(phoneNumber, message);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "SMS sent successfully",
        messageId: result.messageId,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send SMS",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ SMS TEST ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET request for simple testing
export async function GET() {
  return NextResponse.json({
    message: "SMS Test Endpoint",
    usage: "POST request with { phoneNumber, name, amount, orderId }",
    example: {
      phoneNumber: "01712345678",
      name: "Test User",
      amount: 1000,
      orderId: "TEST-001",
    },
  });
}
