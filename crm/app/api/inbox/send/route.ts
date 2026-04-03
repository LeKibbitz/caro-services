import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getSmtpConfig } from "@/lib/settings";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { channel, to, message, subject } = body as {
    channel: "whatsapp" | "email";
    to: string;
    message: string;
    subject?: string;
  };

  if (!channel || !to || !message) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const db = getDb();

  if (channel === "whatsapp") {
    const bridgeUrl = process.env.WA_BRIDGE_URL;
    if (!bridgeUrl) {
      return NextResponse.json({ error: "Bridge WA non configuré" }, { status: 503 });
    }
    const waTo = to.replace(/[^\d]/g, "") + "@c.us";
    const res = await fetch(bridgeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: waTo, message }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Bridge error: ${err}` }, { status: 502 });
    }
  } else if (channel === "email") {
    const cfg = await getSmtpConfig();
    if (!cfg.host || !cfg.user || !cfg.pass) {
      return NextResponse.json({ error: "SMTP non configuré — Paramètres > Email" }, { status: 503 });
    }
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure, // true = SSL port 465
      auth: { user: cfg.user, pass: cfg.pass },
    });
    await transporter.sendMail({
      from: cfg.user,
      to,
      subject: subject || "(sans objet)",
      text: message,
    });
  } else {
    return NextResponse.json({ error: "Canal inconnu" }, { status: 400 });
  }

  const contact = await db.contact.findFirst({
    where: channel === "whatsapp" ? { waId: to } : { email: to },
    select: { id: true },
  });

  await db.message.create({
    data: {
      channel,
      direction: "out",
      fromAddr: null,
      toAddr: to,
      subject: subject ?? null,
      body: message,
      contactId: contact?.id ?? null,
      rawData: { to, channel },
      read: true,
    },
  });

  return NextResponse.json({ ok: true });
}
