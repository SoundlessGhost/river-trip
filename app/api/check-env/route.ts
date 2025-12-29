// app/api/check-env/route.ts
// ⚠️ TEMPORARY - শুধু debugging এর জন্য, পরে মুছে ফেলবেন

import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    REVE_SMS_API_KEY: process.env.REVE_SMS_API_KEY ? "✅ SET" : "❌ MISSING",
    REVE_SMS_SECRET_KEY: process.env.REVE_SMS_SECRET_KEY
      ? "✅ SET"
      : "❌ MISSING",
    REVE_SMS_SENDER_ID: process.env.REVE_SMS_SENDER_ID
      ? "✅ SET"
      : "❌ MISSING",

    // প্রথম ও শেষ 4 characters দেখান (security জন্য)
    API_KEY_PREVIEW: process.env.REVE_SMS_API_KEY
      ? `${process.env.REVE_SMS_API_KEY.substring(
          0,
          4
        )}...${process.env.REVE_SMS_API_KEY.slice(-4)}`
      : "NOT SET",
    SENDER_ID_VALUE: process.env.REVE_SMS_SENDER_ID || "NOT SET",
  };

  return NextResponse.json(envCheck);
}

// ⚠️ Deploy করার পরে এই route টি মুছে ফেলুন অথবা protect করুন!
