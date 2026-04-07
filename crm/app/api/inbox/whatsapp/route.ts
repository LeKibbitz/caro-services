import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * Normalise un numéro de téléphone pour le matching.
 * "352661521101@c.us" → "352661521101"
 * "+352 661 521 101" → "352661521101"
 */
function normalizePhone(raw: string): string {
  return raw.replace(/@.*$/, "").replace(/[^\d]/g, "");
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || token !== process.env.INBOX_WA_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const from = body.from as string | undefined;
  const fromMe = body.fromMe === true;
  const direction = fromMe ? "out" as const : "in" as const;
  const message = (body.message ?? body.body ?? body.text) as string | undefined;
  if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

  const db = getDb();

  // Match contact by waId
  const contact = from
    ? await db.contact.findFirst({ where: { waId: from }, select: { id: true } })
    : null;

  // Match lead by phone number (normalised)
  let leadId: string | null = null;
  let leadAutoUpdate: string | null = null;

  if (from) {
    const normalized = normalizePhone(from);
    // Search leads whose phone contains the normalized digits
    const leads = await db.lead.findMany({
      where: { phone: { not: null } },
      select: { id: true, phone: true, status: true },
    });
    const matched = leads.find((l) => {
      if (!l.phone) return false;
      return normalizePhone(l.phone) === normalized;
    });
    if (matched) {
      leadId = matched.id;
      // Auto-update lead status based on message direction
      if (!fromMe && (matched.status === "contacted" || matched.status === "new")) {
        await db.lead.update({
          where: { id: matched.id },
          data: { status: "replied" },
        });
        leadAutoUpdate = "replied";
      }
    }
  }

  await db.message.create({
    data: {
      channel: "whatsapp",
      direction,
      fromAddr: from ?? null,
      toAddr: fromMe ? (body.to as string ?? null) : null,
      subject: null,
      body: message,
      contactId: contact?.id ?? null,
      leadId,
      rawData: body as object,
      read: fromMe,
    },
  });

  return NextResponse.json({ ok: true, leadId, leadAutoUpdate });
}
