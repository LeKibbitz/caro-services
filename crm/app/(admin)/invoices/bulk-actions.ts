"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateCSV, ENTITY_COLUMNS } from "@/lib/export";

export async function bulkDeleteInvoices(ids: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.invoice.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/invoices");
  return { deleted: result.count };
}

export async function bulkExportInvoices(ids: string[]): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const invoices = await db.invoice.findMany({ where: { id: { in: ids } }, include: { contact: true } });
  return generateCSV(invoices as Record<string, unknown>[], ENTITY_COLUMNS.invoices);
}

export async function bulkMarkInvoicesPaid(ids: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.invoice.updateMany({
    where: { id: { in: ids } },
    data: { status: "paid", paidAt: new Date() },
  });
  revalidatePath("/invoices");
  return { updated: result.count };
}
