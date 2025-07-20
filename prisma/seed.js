const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function main() {
  console.log("🌱 Starting database seeding...");

  // Optional: clear previous data (order matters because of FK constraints)
  await prisma.settlement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.financingRequest.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const seller1 = await prisma.user.create({
    data: {
      name: "ABC Traders",
      email: "abc@seller.com",
      password: await bcrypt.hash("123", 10),
      role: "seller",
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "DEF Suppliers",
      email: "def@seller.com",
      password: await bcrypt.hash("123", 10),
      role: "seller",
    },
  });

  const financier1 = await prisma.user.create({
    data: {
      name: "GHI Finance Co.",
      email: "ghi@financier.com",
      password: await bcrypt.hash("123", 10),
      role: "financier",
    },
  });

  const financier2 = await prisma.user.create({
    data: {
      name: "JKL Investments",
      email: "jkl@financier.com",
      password: await bcrypt.hash("123", 10),
      role: "financier",
    },
  });

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-001",
      buyerName: "XYZ Retailers",
      buyerEmail: "xyz@buyers.com",
      buyerGSTIN: "27ABCDE1234F1Z5",
      amount: 100000,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      sellerId: seller1.id,
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-001",
      buyerName: "DOM Retailers",
      buyerEmail: "dom@buyers.com",
      buyerGSTIN: "27ABCDE5343H23",
      amount: 500000,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      sellerId: seller1.id,
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-002",
      buyerName: "LMN Enterprises",
      amount: 150000,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      sellerId: seller2.id,
    },
  });

  // Financier offers on invoice1
  const offer1 = await prisma.financingRequest.create({
    data: {
      invoiceId: invoice1.id,
      financierId: financier1.id,
      amountRequested: 40000,
      interestRate: 12.5,
      status: "approved",
      acceptedAt: new Date(),
    },
  });

  const offer2 = await prisma.financingRequest.create({
    data: {
      invoiceId: invoice1.id,
      financierId: financier2.id,
      amountRequested: 30000,
      interestRate: 15,
      status: "approved",
      acceptedAt: new Date(),
    },
  });

  // Mark invoice as financed
  await prisma.invoice.update({
    where: { id: invoice1.id },
    data: {
      isFinanced: true,
      status: "funded",
    },
  });

  // Financier offer on invoice2 (still pending)
  await prisma.financingRequest.create({
    data: {
      invoiceId: invoice2.id,
      financierId: financier1.id,
      amountRequested: 100000,
      interestRate: 14,
      status: "pending",
    },
  });

  // Simulate buyer payment for invoice1
  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 100000,
      method: "NEFT",
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
