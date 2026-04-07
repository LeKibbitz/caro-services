"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateCSV, ENTITY_COLUMNS } from "@/lib/export";

export async function bulkDeleteQuotes(ids: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.quote.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/quotes");
  return { deleted: result.count };
}

export async function bulkExportQuotes(ids: string[]): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const quotes = await db.quote.findMany({ where: { id: { in: ids } }, include: { contact: true } });
  return generateCSV(quotes as Record<string, unknown>[], ENTITY_COLUMNS.quotes);
}

export async function bulkUpdateQuoteStatus(ids: string[], status: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.quote.updateMany({ where: { id: { in: ids } }, data: { status: status as never } });
  revalidatePath("/quotes");
  return { updated: result.count };
}
