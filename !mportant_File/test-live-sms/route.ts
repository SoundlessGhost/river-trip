// app/api/test-live-sms/route.ts
// ⚠️ শুধু debugging এর জন্য - পরে মুছে ফেলবেন

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    // Environment check
    const config = {
      apikey: process.env.REVE_SMS_API_KEY || "",
      secretkey: process.env.REVE_SMS_SECRET_KEY || "",
      callerID: process.env.REVE_SMS_SENDER_ID || "",
    };

    console.log("🔍 ENV CHECK:", {
      hasApiKey: !!config.apikey,
      hasSecretKey: !!config.secretkey,
      hasSenderID: !!config.callerID,
      apiKeyLength: config.apikey.length,
      senderID: config.callerID,
    });

    if (!config.apikey || !config.secretkey || !config.callerID) {
      return NextResponse.json(
        {
          error: "SMS credentials not configured",
          details: {
            hasApiKey: !!config.apikey,
            hasSecretKey: !!config.secretkey,
            hasSenderID: !!config.callerID,
          },
        },
        { status: 500 }
      );
    }

    // Format phone
    let phone = phoneNumber.replace(/[\s\-+]/g, "");
    if (phone.startsWith("0")) phone = "88" + phone;
    if (!phone.startsWith("88")) phone = "88" + phone;

    const message = "Test SMS from live server - নদী যাত্রা ২০২৬";

    // Build URL
    const baseUrl = "https://smpp.revesms.com:7790/sendtext";
    const url = new URL(baseUrl);
    url.searchParams.append("apikey", config.apikey);
    url.searchParams.append("secretkey", config.secretkey);
    url.searchParams.append("callerID", config.callerID);
    url.searchParams.append("toUser", phone);
    url.searchParams.append("messageContent", message);

    console.log("📱 Sending SMS to:", phone);
    console.log("🔗 Request URL (without credentials):", baseUrl);

    // Send request
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const rawData = await response.text();
    console.log("📥 Raw Response:", rawData);
    console.log("📊 Response Status:", response.status);

    let apiResponse;
    try {
      apiResponse = JSON.parse(rawData);
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse response",
        rawResponse: rawData,
        responseStatus: response.status,
      });
    }

    return NextResponse.json({
      success: apiResponse.Status === "0",
      apiResponse,
      rawData,
      phoneNumber: phone,
      requestStatus: response.status,
      config: {
        senderID: config.callerID,
        hasApiKey: !!config.apikey,
        hasSecretKey: !!config.secretkey,
      },
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint with { phoneNumber: '01XXXXXXXXX' }",
  });
}
