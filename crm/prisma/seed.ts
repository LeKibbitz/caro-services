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

  // Templates de messages outreach
  // Principe : la carte de visite = la signature → pas de bloc contact dans le corps
  const templateData = [
    {
      name: "Intro WhatsApp",
      channel: "whatsapp" as const,
      subject: null,
      body: `Bonjour [Prénom] 👋

Je me permets de vous contacter au sujet de [Salon].

Je suis spécialisée en comptabilité et fiscalité au Luxembourg — TVA, IR, CCSS — pour les indépendants et gérants. Contact direct, sans intermédiaire.

Seriez-vous disponible pour un échange rapide, sans engagement ?

Bonne journée,
Caroline`,
    },
    {
      name: "Relance WhatsApp",
      channel: "whatsapp" as const,
      subject: null,
      body: `Bonjour [Prénom],

Je me permets de revenir vers vous au sujet de [Salon].

Je reste disponible si vous souhaitez qu'on échange.

Bonne journée 🙂`,
    },
    {
      name: "Intro Email",
      channel: "email" as const,
      subject: "[Salon] — comptabilité & fiscalité Luxembourg",
      body: `Bonjour [Prénom],

Je me permets de vous contacter au sujet de [Salon].

Spécialisée en fiscalité et comptabilité au Luxembourg, j'accompagne les indépendants et gérants dans leur quotidien : déclaration TVA, impôts sur le revenu, tenue comptable, CCSS.

Seriez-vous disponible pour un échange téléphonique, sans engagement ?

Bien cordialement,
Caroline`,
    },
    {
      name: "Relance Email",
      channel: "email" as const,
      subject: "Re : [Salon]",
      body: `Bonjour [Prénom],

Je reviens vers vous suite à mon précédent email concernant [Salon].

Je reste disponible si vous souhaitez en discuter.

Bien cordialement,
Caroline`,
    },
    {
      name: "Intro SMS",
      channel: "sms" as const,
      subject: null,
      body: `Bonjour [Prénom], c'est Caroline — comptabilité & fiscalité Luxembourg. Je vous contacte au sujet de [Salon]. Disponible pour en discuter ?`,
    },
  ];

  for (const t of templateData) {
    const existing = await prisma.outreachTemplate.findFirst({
      where: { name: t.name },
    });
    if (!existing) {
      await prisma.outreachTemplate.create({ data: t });
      console.log(`Template créé : ${t.name}`);
    }
  }

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
