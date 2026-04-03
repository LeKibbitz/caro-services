import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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
  const message = (body.message ?? body.body ?? body.text) as string | undefined;
  if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

  const db = getDb();

  const contact = from
    ? await db.contact.findFirst({ where: { waId: from }, select: { id: true } })
    : null;

  await db.message.create({
    data: {
      channel: "whatsapp",
      direction: "in",
      fromAddr: from ?? null,
      subject: null,
      body: message,
      contactId: contact?.id ?? null,
      rawData: body as object,
      read: false,
    },
  });

  return NextResponse.json({ ok: true });
}
