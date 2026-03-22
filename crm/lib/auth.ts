import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getDb } from "./db";
import { sendMagicLinkEmail } from "./email";

const SESSION_COOKIE = "caro_session";
const MAGIC_LINK_EXPIRY_MINUTES = 15;
const SESSION_EXPIRY_DAYS = 30;

export async function sendMagicLink(email: string) {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000
  );

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "Aucun compte associé à cet email." };

  await db.magicLink.create({
    data: { email, token, expiresAt, userId: user.id },
  });

  try {
    await sendMagicLinkEmail(email, token, user.name);
  } catch (err) {
    console.error("SMTP error:", err);
    // Fallback: return link directly so user can still log in
    const url = `${process.env.APP_URL}/api/auth/verify?token=${token}`;
    return { success: true, devLink: url };
  }
  return { success: true };
}

export async function verifyMagicLink(token: string) {
  const db = getDb();
  const link = await db.magicLink.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!link || !link.user) return null;
  if (link.usedAt) return null;
  if (link.expiresAt < new Date()) return null;

  // Mark as used
  await db.magicLink.update({
    where: { id: link.id },
    data: { usedAt: new Date() },
  });

  // Create session
  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  await db.session.create({
    data: {
      token: sessionToken,
      userId: link.user.id,
      expiresAt,
    },
  });

  return { user: link.user, sessionToken, expiresAt };
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const db = getDb();
    await db.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE);
}
