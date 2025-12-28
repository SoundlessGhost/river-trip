// scripts/test-sms.ts
import { sendSMS } from "@/lib/sms-service";

async function testSMS() {
  const result = await sendSMS(
    "01794951003", // Your phone number
    "Test SMS from Nadi Yatra 2026"
  );

  console.log("Result:", result);
}

testSMS();
