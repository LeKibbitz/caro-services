import { ImapFlow } from "imapflow";
import type { getDb } from "./db";

export async function syncInboxEmails(
  db: ReturnType<typeof getDb>
): Promise<{ synced: number; error?: string }> {
  const host = process.env.IMAP_HOST;
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASS;

  if (!host || !user || !pass) {
    return { synced: 0, error: "IMAP not configured (IMAP_HOST, IMAP_USER, IMAP_PASS)" };
  }

  // Collect messageIds already stored to avoid duplicates
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
    host,
    port: Number(process.env.IMAP_PORT) || 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  let synced = 0;

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      // Only fetch messages from the last 30 days
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
            const raw = Buffer.isBuffer(msg.source)
              ? msg.source.toString("utf-8")
              : Buffer.from(msg.source as Uint8Array).toString("utf-8");
            const sep = raw.indexOf("\r\n\r\n");
            body = (sep >= 0 ? raw.slice(sep + 4) : raw).slice(0, 8000);
          }

          await db.message.create({
            data: {
              channel: "email",
              direction: "in",
              fromAddr,
              toAddr: user,
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
