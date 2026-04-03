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
  const templateData = [
    {
      name: "Intro WhatsApp",
      channel: "whatsapp" as const,
      subject: null,
      body: `Bonjour [Prénom] 👋

Je me permets de vous contacter au sujet de [Salon].

Spécialisée en fiscalité et comptabilité au Luxembourg, j'accompagne les indépendants et gérants dans leur déclaration TVA, impôts sur le revenu et gestion administrative.

Seriez-vous disponible pour un échange rapide, sans engagement ?

Bonne journée,
— Caroline Charpentier
📞 +352 661 521 101
🌐 caroline-finance.com`,
    },
    {
      name: "Relance WhatsApp",
      channel: "whatsapp" as const,
      subject: null,
      body: `Bonjour [Prénom],

Je me permets de vous relancer suite à mon message précédent concernant [Salon].

Si vous avez des questions ou souhaitez qu'on échange rapidement sur vos besoins, n'hésitez pas à me répondre ou à m'appeler directement.

Belle journée,
📞 +352 661 521 101`,
    },
    {
      name: "Intro Email",
      channel: "email" as const,
      subject: "[Salon] — comptabilité & fiscalité Luxembourg",
      body: `Bonjour [Prénom],

Je me permets de vous contacter au sujet de [Salon].

Spécialisée en comptabilité et fiscalité au Luxembourg, j'accompagne les indépendants et gérants dans leur quotidien administratif : déclaration TVA, impôts sur le revenu, tenue comptable, CCSS...

Si vous souhaitez qu'on en discute, je suis disponible pour un premier entretien téléphonique sans engagement.

Bien cordialement,

Caroline Charpentier
Expert-comptable & conseillère fiscale

📞 +352 661 521 101
📧 contact@caroline-finance.com
🌐 caroline-finance.com`,
    },
    {
      name: "Relance Email",
      channel: "email" as const,
      subject: "Re: [Salon] — suivi de ma proposition",
      body: `Bonjour [Prénom],

Je reviens vers vous suite à mon email concernant [Salon], resté sans réponse.

Je reste disponible pour un échange à votre convenance — n'hésitez pas à me répondre directement ou à me joindre par téléphone.

Bien cordialement,

Caroline Charpentier
📞 +352 661 521 101
🌐 caroline-finance.com`,
    },
    {
      name: "Intro SMS",
      channel: "sms" as const,
      subject: null,
      body: `Bonjour [Prénom], je suis Caroline Charpentier — fiscalité & comptabilité au Luxembourg. Je vous contacte au sujet de [Salon]. Disponible pour un échange ? ☎️ +352 661 521 101`,
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
