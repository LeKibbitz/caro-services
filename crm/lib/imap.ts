import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { getDb } from "./db";
import { getImapConfig } from "./settings";

export async function syncInboxEmails(
  db: ReturnType<typeof getDb>
): Promise<{ synced: number; error?: string }> {
  const cfg = await getImapConfig();

  if (!cfg.host || !cfg.user || !cfg.pass) {
    return { synced: 0, error: "IMAP non configuré — renseignez les paramètres dans Paramètres > Email" };
  }

  const existing = await db.message.findMany({
    where: { channel: "email" },
    select: { rawData: true },
  });
  const seenIds = new Set(
    existing
      .map((m) => (m.rawData as Record<string, unknown> | null)?.messageId as string | undefined)
      .filter(Boolean)
  );

  const client = new ImapFlow({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    logger: false,
  });

  let synced = 0;

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const uids = await client.search({ since }, { uid: true });

      if (Array.isArray(uids) && uids.length > 0) {
        for await (const msg of client.fetch(
          uids,
          { envelope: true, uid: true, source: true },
          { uid: true }
        )) {
          const msgId = msg.envelope?.messageId;
          if (msgId && seenIds.has(msgId)) continue;

          const fromInfo = msg.envelope?.from?.[0];
          const fromAddr = fromInfo
            ? fromInfo.name
              ? `${fromInfo.name} <${fromInfo.address}>`
              : (fromInfo.address ?? null)
            : null;

          const contactEmail = fromInfo?.address;
          const contact = contactEmail
            ? await db.contact.findFirst({
                where: { email: contactEmail },
                select: { id: true },
              })
            : null;

          let body = "";
          if (msg.source) {
            const parsed = await simpleParser(msg.source);
            const html = parsed.html || "";
            body = (parsed.text || (typeof html === "string" ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "") || "").slice(0, 8000);
          }

          await db.message.create({
            data: {
              channel: "email",
              direction: "in",
              fromAddr,
              toAddr: cfg.user,
              subject: msg.envelope?.subject ?? null,
              body,
              contactId: contact?.id ?? null,
              rawData: { uid: msg.uid, messageId: msgId ?? null },
              read: false,
            },
          });

          if (msgId) seenIds.add(msgId);
          synced++;
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    return { synced, error: err instanceof Error ? err.message : "IMAP error" };
  }

  return { synced };
}
