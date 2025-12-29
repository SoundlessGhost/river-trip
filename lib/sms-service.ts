// lib/sms-service.ts

interface SMSConfig {
  apikey: string;
  secretkey: string;
  callerID: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: string;
  status?: string;
}

interface ReveAPIResponse {
  Status: string;
  Text: string;
  Message_ID?: string;
}

// Format phone number for Bangladesh
function formatBDPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-+]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "88" + cleaned;
  }

  if (!cleaned.startsWith("88")) {
    cleaned = "88" + cleaned;
  }

  return cleaned;
}

export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<SMSResponse> {
  try {
    const config: SMSConfig = {
      apikey: process.env.REVE_SMS_API_KEY || "",
      secretkey: process.env.REVE_SMS_SECRET_KEY || "",
      callerID: process.env.REVE_SMS_SENDER_ID || "",
    };

    if (!config.apikey || !config.secretkey || !config.callerID) {
      console.error("❌ SMS credentials missing in environment variables");
      throw new Error("SMS credentials not configured");
    }

    // https://smpp.revesms.com:7790/sendtext?apikey=API_KEY&secretkey=SECRET_KEY&callerID=SENDER_ID&toUser=MOBILE_NUMBER&messageContent=MESSAGE

    const formattedPhone = formatBDPhoneNumber(phoneNumber);
    const baseUrl = "https://smpp.revesms.com:7790/sendtext";

    const url = new URL(baseUrl);
    url.searchParams.append("apikey", config.apikey);
    url.searchParams.append("secretkey", config.secretkey);
    url.searchParams.append("callerID", config.callerID);
    url.searchParams.append("toUser", formattedPhone);
    url.searchParams.append("messageContent", message);

    console.log("📱 Sending SMS to:", formattedPhone);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const rawData = await response.text();
    console.log("📥 SMS API Response:", rawData);

    let apiResponse: ReveAPIResponse;
    try {
      apiResponse = JSON.parse(rawData);
    } catch (parseError) {
      console.error("❌ Failed to parse SMS API response", parseError);
      throw new Error(`Invalid API response: ${rawData}`);
    }

    if (apiResponse.Status === "0" && apiResponse.Text === "ACCEPTD") {
      console.log("✅ SMS SENT! Message ID:", apiResponse.Message_ID);
      return {
        success: true,
        messageId: apiResponse.Message_ID,
        data: rawData,
      };
    } else {
      let errorMessage = "Failed to send SMS";

      switch (apiResponse.Status) {
        case "109":
          errorMessage = "User not provided or deleted";
          break;
        case "108":
          errorMessage = "Wrong API credentials";
          break;
        case "114":
          errorMessage = "Content not provided";
          break;
        case "101":
          errorMessage = "Internal server error";
          break;
        case "1":
          errorMessage = "Request rejected";
          break;
        default:
          errorMessage = `SMS API Error: ${apiResponse.Text}`;
      }

      console.error("❌ SMS FAILED:", errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error: unknown) {
    console.error("❌ SMS SENDING ERROR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}

export async function checkSMSStatus(messageId: string): Promise<SMSResponse> {
  try {
    const config: SMSConfig = {
      apikey: process.env.REVE_SMS_API_KEY || "",
      secretkey: process.env.REVE_SMS_SECRET_KEY || "",
      callerID: process.env.REVE_SMS_SENDER_ID || "",
    };

    if (!config.apikey || !config.secretkey) {
      throw new Error("SMS credentials not configured");
    }

    const baseUrl = "https://smpp.revesms.com:7790/getstatus";
    const url = new URL(baseUrl);
    url.searchParams.append("apikey", config.apikey);
    url.searchParams.append("secretkey", config.secretkey);
    url.searchParams.append("messageid", messageId);

    const response = await fetch(url.toString());
    const rawData = await response.text();

    try {
      const statusResponse = JSON.parse(rawData);

      let statusText = "Unknown";
      switch (statusResponse.Status) {
        case "0":
          statusText = "DELIVERED";
          break;
        case "2":
          statusText = "PENDING";
          break;
        case "4":
          statusText = "SENT";
          break;
        case "1":
          statusText = "FAILED";
          break;
        default:
          statusText = statusResponse.Text || "Unknown";
      }

      return {
        success: true,
        status: statusText,
        data: rawData,
      };
    } catch {
      return {
        success: true,
        status: rawData,
      };
    }
  } catch (error) {
    console.error("❌ SMS Status Check Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to check SMS status",
    };
  }
}

// SMS Templates
export function generateRegistrationSMS(
  name: string,
  amount: number,
  orderId: string
): string {
  return `নদী যাত্রা ২০২৬
নাম: ${name}
পেমেন্ট: ${amount} টাকা
Order ID: ${orderId}
তারিখ: ১৭ জানুয়ারি ২০২৬
ধন্যবাদ! - রংপুর জেলা সমিতি`;
}

export function generatePaymentSuccessSMS(
  name: string,
  amount: number,
  transactionId: string
): string {
  return `✅ পেমেন্ট সফল হয়েছে!
নাম: ${name}
টাকা: ${amount}/-
Transaction: ${transactionId}
নদী যাত্রা ২০২৬
- রংপুর জেলা সমিতি`;
}

export function generatePaymentFailedSMS(
  name: string,
  orderId: string
): string {
  return `❌ পেমেন্ট ব্যর্থ হয়েছে
Order ID: ${orderId}
আবার চেষ্টা করুন অথবা যোগাযোগ করুন।
নদী যাত্রা ২০২৬`;
}
