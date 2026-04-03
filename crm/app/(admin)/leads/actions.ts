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
  await db.lead.update({ where: { id }, data: { status } });
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

export async function createOutreach(formData: FormData) {
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
    await sendOutreachEmail({
      to: outreach.lead.email,
      subject: subject ?? `Contact — ${outreach.lead.salonName}`,
      body,
      fromName: "Caroline Finance",
      cardImageUrl: cardUrl,
    });
  }

  if (sendNow && (channel === "whatsapp" || channel === "sms") && outreach.lead.phone) {
    const waPhone = outreach.lead.phone.replace(/[^\d+]/g, "").replace(/^\+/, "") + "@c.us";
    const bridgeUrl = process.env.WA_BRIDGE_URL;
    const bridgeToken = process.env.WA_BRIDGE_TOKEN;
    if (bridgeUrl && bridgeToken) {
      // Send text message
      await fetch(bridgeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: bridgeToken, to: waPhone, message: body }),
      }).catch(() => {});

      // Send card image if selected
      if (cardVersion) {
        const imageBase64 = getCardImageBase64(cardVersion);
        if (imageBase64) {
          await fetch(bridgeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: bridgeToken,
              to: waPhone,
              image_base64: imageBase64,
              image_mimetype: "image/png",
              caption: "Ma carte de visite",
            }),
          }).catch(() => {});
        }
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
}

export async function convertLeadToContact(id: string) {
  const db = getDb();
  const lead = await db.lead.findUniqueOrThrow({ where: { id } });

  // Split ownerName into first/last best-effort
  const nameParts = (lead.ownerName ?? lead.salonName).split(" ");
  const firstName = nameParts[0] ?? lead.salonName;
  const lastName = nameParts.slice(1).join(" ") || "-";

  const contact = await db.contact.create({
    data: {
      firstName,
      lastName,
      companyName: lead.salonName,
      email: lead.email ?? undefined,
      phone: lead.phone ?? undefined,
      address: lead.address ?? undefined,
      country: "Luxembourg",
      source: lead.source,
      type: "prospect",
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

export async function deleteLead(id: string) {
  const db = getDb();
  await db.lead.delete({ where: { id } });
  revalidatePath("/leads");
  redirect("/leads");
}

export async function createLead(formData: FormData) {
  const db = getDb();

  const salonName = (formData.get("salonName") as string)?.trim();
  if (!salonName) throw new Error("Le nom du commerce est requis.");

  const activityType = (formData.get("activityType") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const ownerName = (formData.get("ownerName") as string)?.trim() || null;
  const ownerTitle = (formData.get("ownerTitle") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const lead = await db.lead.create({
    data: {
      salonName,
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
