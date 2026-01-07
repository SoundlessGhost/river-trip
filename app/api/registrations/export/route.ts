// app/api/registrations/export/route.ts

import { PrismaClient, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // URL theke status parameter nao
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PaymentStatus | null;

    console.log(`📥 CSV Export request - Status filter: ${status || "ALL"}`);

    // ✅ Conditional query - jodi status "SUCCESS" hoy tahole filter koro
    const registrations = await prisma.registration.findMany({
      where: status ? { paymentStatus: status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    console.log(`📊 Found ${registrations.length} registrations`);

    if (registrations.length === 0) {
      return NextResponse.json(
        { success: false, error: "No registrations found" },
        { status: 404 }
      );
    }

    // ✅ CSV Headers
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Mobile Number",
      "Participation Type",
      "Total Participants",
      "Adults",
      "Children",
      "Infants",
      "Amount",
      "Payment Status",
      "Transaction ID",
      "Created At",
    ];

    // ✅ CSV Rows
    const rows = registrations.map((reg) => [
      reg.id,
      reg.fullName,
      reg.email,
      reg.mobileNumber,
      reg.participationType,
      reg.totalParticipants,
      reg.adults,
      reg.children,
      reg.infants,
      reg.amount,
      reg.paymentStatus,
      reg.transactionId || "",
      reg.createdAt.toISOString(),
    ]);

    // ✅ CSV content build
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    console.log("✅ CSV generated successfully");

    // ✅ Response with download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="registrations_${
          status || "all"
        }_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("❌ CSV Export Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
