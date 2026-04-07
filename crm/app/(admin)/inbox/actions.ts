"use server";

import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function markMessageRead(id: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  await db.message.update({ where: { id }, data: { read: true } });
}
