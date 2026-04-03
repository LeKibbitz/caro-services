"use server";

import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "@/lib/email";

export async function sendClientMagicLink(contactId: string) {
  const db = getDb();

  const contact = await db.contact.findUnique({
    where: { id: contactId },
    include: { user: true },
  });

  if (!contact || !contact.email) {
    return { error: "Ce contact n'a pas d'adresse email." };
  }

  // Create or find user account for client
  let user = contact.user;
  if (!user && contact.userId) {
    user = await db.user.findUnique({ where: { id: contact.userId } });
  }
  if (!user) {
    // Auto-create client user account
    user = await db.user.create({
      data: {
        email: contact.email,
        name: `${contact.firstName} ${contact.lastName}`,
        role: "client",
      },
    });
    await db.contact.update({
      where: { id: contactId },
      data: { userId: user.id },
    });
  }

  // Create magic link
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h for client links

  await db.magicLink.create({
    data: { email: user.email, token, expiresAt, userId: user.id },
  });

  // Send to client + notify admins
  const url = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

  try {
    await sendMagicLinkEmail(user.email, token, user.name);
  } catch {
    // If email fails, still return the link for manual sharing
  }

  // Also send to admins for testing
  const admins = await db.user.findMany({ where: { role: "admin" } });
  for (const admin of admins) {
    try {
      await sendMagicLinkEmail(admin.email, token, `${user.name} (lien portail client)`);
    } catch {
      // Silent fail for admin notifications
    }
  }

  return { success: true, url };
}
