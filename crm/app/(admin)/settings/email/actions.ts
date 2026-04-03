"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { setSetting } from "@/lib/settings";

export async function saveEmailSettings(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");

  const smtpPass = formData.get("smtpPass") as string | null;
  const imapPass = formData.get("imapPass") as string | null;
  const smtpUser = formData.get("smtpUser") as string | null;

  if (smtpUser?.trim()) await setSetting("SMTP_USER", smtpUser.trim());
  if (smtpUser?.trim()) await setSetting("IMAP_USER", smtpUser.trim());
  if (smtpPass?.trim()) await setSetting("SMTP_PASS", smtpPass.trim());
  if (imapPass?.trim()) await setSetting("IMAP_PASS", imapPass.trim());

  revalidatePath("/settings/email");
}

export async function testSmtp(): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { ok: false, error: "Non autorisé" };

  const { getSmtpConfig } = await import("@/lib/settings");
  const nodemailer = await import("nodemailer");

  const cfg = await getSmtpConfig();
  if (!cfg.pass) return { ok: false, error: "Mot de passe non configuré" };

  const t = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  try {
    await t.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur SMTP" };
  }
}

export async function testImap(): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { ok: false, error: "Non autorisé" };

  const { getImapConfig } = await import("@/lib/settings");
  const { ImapFlow } = await import("imapflow");

  const cfg = await getImapConfig();
  if (!cfg.pass) return { ok: false, error: "Mot de passe non configuré" };

  const client = new ImapFlow({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    logger: false,
  });

  try {
    await client.connect();
    await client.logout();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur IMAP" };
  }
}
