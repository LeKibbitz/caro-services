"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { sendOutreachEmail } from "@/lib/email";
import type { LeadStatus, OutreachChannel } from "@/lib/generated/prisma/client";
import path from "path";
import fs from "fs";

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const db = getDb();

  if (status === "converted") {
    const lead = await db.lead.findUniqueOrThrow({ where: { id } });
    if (lead.contactId) {
      // Upgrade existing contact to client
      await db.contact.update({ where: { id: lead.contactId }, data: { type: "client" } });
      await db.lead.update({ where: { id }, data: { status, convertedAt: new Date() } });
    } else {
      // Create new client contact
      const nameParts = (lead.ownerName ?? lead.displayName).split(" ");
      const firstName = nameParts[0] ?? lead.displayName;
      const lastName = nameParts.slice(1).join(" ") || "-";
      const contact = await db.contact.create({
        data: {
          firstName,
          lastName,
          companyName: lead.displayName,
          email: lead.email ?? undefined,
          phone: lead.phone ?? undefined,
          address: lead.address ?? undefined,
          country: "Luxembourg",
          source: lead.source,
          type: "client",
        },
      });
      await db.lead.update({ where: { id }, data: { status, contactId: contact.id, convertedAt: new Date() } });
    }
  } else {
    await db.lead.update({ where: { id }, data: { status } });
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function updateLeadNotes(id: string, notes: string) {
  const db = getDb();
  await db.lead.update({ where: { id }, data: { notes } });
  revalidatePath(`/leads/${id}`);
}

const VALID_CARD_VERSIONS = new Set(
  Array.from({ length: 20 }, (_, i) => `v${i + 1}`)
);

function getCardImageBase64(version: string): string | null {
  if (!VALID_CARD_VERSIONS.has(version)) return null;
  try {
    const imgPath = path.join(process.cwd(), "public", "cards", `${version}.png`);
    return fs.readFileSync(imgPath).toString("base64");
  } catch {
    return null;
  }
}

export async function createOutreach(formData: FormData): Promise<{ error?: string }> {
  const db = getDb();
  const leadId = formData.get("leadId") as string;
  const channel = formData.get("channel") as OutreachChannel;
  const subject = (formData.get("subject") as string) || null;
  const body = formData.get("body") as string;
  const sendNow = formData.get("sendNow") === "true";
  const rawCardVersion = (formData.get("cardVersion") as string) || null;
  const cardVersion = rawCardVersion && VALID_CARD_VERSIONS.has(rawCardVersion) ? rawCardVersion : null;

  if (!leadId || !channel || !body) throw new Error("Champs requis manquants.");

  const bodyWithCard = cardVersion
    ? body + `\n\n📎 Carte de visite : ${process.env.APP_URL ?? "https://crm.caroline-finance.com"}/cards/${cardVersion}.png`
    : body;

  const outreach = await db.outreach.create({
    data: {
      leadId,
      channel,
      subject,
      body: bodyWithCard,
      status: sendNow ? "sent" : "draft",
      sentAt: sendNow ? new Date() : null,
    },
    include: { lead: true },
  });

  if (sendNow && channel === "email" && outreach.lead.email) {
    const cardUrl = cardVersion
      ? `${process.env.APP_URL ?? "https://crm.caroline-finance.com"}/cards/${cardVersion}.png`
      : null;
    try {
      await sendOutreachEmail({
        to: outreach.lead.email,
        subject: subject ?? `Contact — ${outreach.lead.displayName}`,
        body,
        fromName: "Caroline Finance",
        cardImageUrl: cardUrl,
      });
    } catch (err) {
      console.error("Email send failed (outreach saved):", err);
      await db.outreach.update({ where: { id: outreach.id }, data: { status: "draft", sentAt: null } });
      revalidatePath(`/leads/${leadId}`);
      const detail = err instanceof Error ? err.message : "Erreur inconnue";
      return { error: `Erreur SMTP : ${detail} — Message sauvegardé en brouillon. Vérifiez Paramètres → Email.` };
    }
  }

  if (sendNow && (channel === "whatsapp" || channel === "sms") && outreach.lead.phone) {
    const waPhone = outreach.lead.phone.replace(/[^\d+]/g, "").replace(/^\+/, "") + "@c.us";
    const bridgeInternal = process.env.WA_BRIDGE_INTERNAL || "http://caro-wa-bridge:3101";

    // Send text message via local bridge
    await fetch(`${bridgeInternal}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: waPhone, message: body }),
    }).catch(() => {});

    // Send card image if selected
    if (cardVersion) {
      const imageBase64 = getCardImageBase64(cardVersion);
      if (imageBase64) {
        await fetch(`${bridgeInternal}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: waPhone,
            image_base64: imageBase64,
            image_mimetype: "image/png",
            caption: "Ma carte de visite",
          }),
        }).catch(() => {});
      }
    }
  }

  if (sendNow) {
    // Move lead to "contacted" if still "new"
    if (outreach.lead.status === "new") {
      await db.lead.update({
        where: { id: leadId },
        data: { status: "contacted" },
      });
    }
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return {};
}

export async function convertLeadToContact(id: string) {
  const db = getDb();
  const lead = await db.lead.findUniqueOrThrow({ where: { id } });

  // Split ownerName into first/last best-effort
  const nameParts = (lead.ownerName ?? lead.displayName).split(" ");
  const firstName = nameParts[0] ?? lead.displayName;
  const lastName = nameParts.slice(1).join(" ") || "-";

  const contact = await db.contact.create({
    data: {
      firstName,
      lastName,
      companyName: lead.displayName,
      email: lead.email ?? undefined,
      phone: lead.phone ?? undefined,
      address: lead.address ?? undefined,
      country: "Luxembourg",
      source: lead.source,
      type: "client",
    },
  });

  await db.lead.update({
    where: { id },
    data: {
      status: "converted",
      contactId: contact.id,
      convertedAt: new Date(),
    },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  redirect(`/contacts/${contact.id}`);
}

export async function deleteLead(id: string): Promise<{ error?: string }> {
  const db = getDb();
  await db.lead.delete({ where: { id } });
  revalidatePath("/leads");
  return {};
}

export async function updateLead(id: string, formData: FormData) {
  const db = getDb();

  const displayName = (formData.get("displayName") as string)?.trim();
  if (!displayName) throw new Error("Le nom du commerce est requis.");

  const activityType = (formData.get("activityType") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const ownerName = (formData.get("ownerName") as string)?.trim() || null;
  const ownerTitle = (formData.get("ownerTitle") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  await db.lead.update({
    where: { id },
    data: {
      displayName,
      activityType,
      address,
      phone,
      email,
      ownerName,
      ownerTitle,
      notes,
    },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

export async function updateOutreachStatus(outreachId: string, status: string) {
  const db = getDb();
  const data: Record<string, unknown> = { status };
  if (status === "replied") data.repliedAt = new Date();

  const outreach = await db.outreach.update({
    where: { id: outreachId },
    data,
    include: { lead: true },
  });

  revalidatePath(`/leads/${outreach.leadId}`);
  revalidatePath("/leads");
}

export async function createLead(formData: FormData) {
  const db = getDb();

  const displayName = (formData.get("displayName") as string)?.trim();
  if (!displayName) throw new Error("Le nom du commerce est requis.");

  const activityType = (formData.get("activityType") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const ownerName = (formData.get("ownerName") as string)?.trim() || null;
  const ownerTitle = (formData.get("ownerTitle") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const lead = await db.lead.create({
    data: {
      displayName,
      activityType,
      address,
      phone,
      phones: phone ? [phone] : [],
      email,
      emails: email ? [email] : [],
      ownerName,
      ownerTitle,
      notes,
      source: "manual",
    },
  });

  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}
