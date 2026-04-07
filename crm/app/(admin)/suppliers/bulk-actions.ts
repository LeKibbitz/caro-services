"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateCSV, ENTITY_COLUMNS } from "@/lib/export";

export async function bulkDeleteSuppliers(ids: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.supplier.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/suppliers");
  return { deleted: result.count };
}

export async function bulkExportSuppliers(ids: string[]): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const suppliers = await db.supplier.findMany({ where: { id: { in: ids } } });
  return generateCSV(suppliers as Record<string, unknown>[], ENTITY_COLUMNS.suppliers);
}
