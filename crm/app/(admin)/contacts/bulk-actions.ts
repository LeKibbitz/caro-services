"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateCSV, ENTITY_COLUMNS } from "@/lib/export";

export async function bulkDeleteContacts(ids: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.contact.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/contacts");
  return { deleted: result.count };
}

export async function bulkExportContacts(ids: string[]): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const contacts = await db.contact.findMany({ where: { id: { in: ids } } });
  return generateCSV(contacts as Record<string, unknown>[], ENTITY_COLUMNS.contacts);
}
