// lib/sms-service.ts

import axios from "axios";

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const response = await axios.post("https://api.revesms.com/sendsms", {
      apikey: process.env.REVE_SMS_API_KEY,
      secretkey: process.env.REVE_SMS_SECRET_KEY,
      callerID: process.env.REVE_SMS_CALLER_ID || "NadiYatra",
      toUser: phoneNumber,
      messageContent: message,
    });

    console.log("✅ SMS SENT:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ SMS ERROR:", error);
    return { success: false, error };
  }
}

// SMS Template
export function generateRegistrationSMS(
  name: string,
  amount: number,
  orderId: string
) {
  return `নদী যাত্রা ২০২৬
নাম: ${name}
পেমেন্ট: ${amount} টাকা
Order ID: ${orderId}
তারিখ: ১৭ জানুয়ারি ২০২৬
ধন্যবাদ! - রংপুর জেলা সমিতি`;
}
