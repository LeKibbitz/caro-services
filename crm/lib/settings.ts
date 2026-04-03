import { getDb } from "./db";

const cache: Record<string, string | undefined> = {};
let cacheTime = 0;
const TTL = 60_000; // 1 min

async function loadSettings() {
  if (Date.now() - cacheTime < TTL) return;
  const db = getDb();
  const rows = await db.appSetting.findMany();
  for (const row of rows) cache[row.key] = row.value;
  cacheTime = Date.now();
}

export async function getSetting(key: string, fallback?: string): Promise<string | undefined> {
  await loadSettings();
  return cache[key] ?? process.env[key] ?? fallback;
}

export async function setSetting(key: string, value: string) {
  const db = getDb();
  await db.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  cache[key] = value;
  cacheTime = 0; // invalidate cache
}

export async function getSmtpConfig() {
  return {
    host: (await getSetting("SMTP_HOST")) ?? "smtp.hostinger.com",
    port: Number((await getSetting("SMTP_PORT")) ?? 465),
    user: (await getSetting("SMTP_USER")) ?? "",
    pass: (await getSetting("SMTP_PASS")) ?? "",
    secure: true, // port 465 = SSL always
  };
}

export async function getImapConfig() {
  return {
    host: (await getSetting("IMAP_HOST")) ?? "imap.hostinger.com",
    port: Number((await getSetting("IMAP_PORT")) ?? 993),
    user: (await getSetting("IMAP_USER")) ?? "",
    pass: (await getSetting("IMAP_PASS")) ?? "",
    secure: true,
  };
}
