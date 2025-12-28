// scripts/create-test-registration.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const registration = await prisma.registration.create({
    data: {
      email: "test@example.com",
      fullName: "IPN Test User",
      mobileNumber: "01700000000",
      participationType: "single",
      adults: 1,
      children: 0,
      infants: 0,
      totalParticipants: 1,
      amount: 1000,
      paymentStatus: "PENDING",
    },
  });

  console.log("✅ Test Registration Created:");
  console.log("ID:", registration.id);
  console.log("\nUse this URL to test:");
  console.log(
    `https://www.dekhai.org/api/payment/ipn?order_id=${registration.id}&sp_order_id=TEST123&bank_status=Success&sp_code=1000`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
