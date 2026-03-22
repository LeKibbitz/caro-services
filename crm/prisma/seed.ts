import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }) as PrismaClient;

async function main() {
  // Create admin user (Caroline)
  const admin = await prisma.user.upsert({
    where: { email: "contact@caroline-finance.com" },
    update: {},
    create: {
      email: "contact@caroline-finance.com",
      name: "Caroline Charpentier",
      role: "admin",
    },
  });

  console.log(`Admin créé: ${admin.email} (${admin.id})`);

  // Create Thomas as admin too
  const thomas = await prisma.user.upsert({
    where: { email: "thomas.joannes@lekibbitz.fr" },
    update: {},
    create: {
      email: "thomas.joannes@lekibbitz.fr",
      name: "Thomas Joannes",
      role: "admin",
    },
  });

  console.log(`Admin créé: ${thomas.email} (${thomas.id})`);

  // Create a sample client
  const clientUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Jean Dupont",
      role: "client",
    },
  });

  const contact = await prisma.contact.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      firstName: "Jean",
      lastName: "Dupont",
      email: "demo@example.com",
      phone: "+352 691 123 456",
      type: "client",
      companyName: "Dupont SARL-S",
      country: "Luxembourg",
      city: "Luxembourg-Ville",
      source: "Site web",
    },
  });

  console.log(`Client créé: ${contact.firstName} ${contact.lastName} (${contact.id})`);

  // Create a sample dossier
  await prisma.dossier.create({
    data: {
      contactId: contact.id,
      type: "ir",
      year: 2025,
      status: "in_progress",
      deadline: new Date("2026-03-31"),
      notes: "Déclaration IR 2025 — frontalier FR→LU",
    },
  });

  console.log("Dossier exemple créé");

  // Create a sample invoice
  await prisma.invoice.create({
    data: {
      contactId: contact.id,
      number: "F-2026-001",
      status: "sent",
      items: [
        {
          description: "Déclaration d'impôts sur le revenu 2025",
          quantity: 1,
          unitPrice: 280,
          total: 280,
        },
      ],
      subtotal: 280,
      taxRate: 0,
      taxAmount: 0,
      total: 280,
      dueDate: new Date("2026-04-15"),
    },
  });

  console.log("Facture exemple créée");
  console.log("\n✅ Seed terminé !");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
