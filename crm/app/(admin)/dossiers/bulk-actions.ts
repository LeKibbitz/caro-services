"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateCSV, ENTITY_COLUMNS } from "@/lib/export";

export async function bulkDeleteDossiers(ids: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.dossier.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/dossiers");
  return { deleted: result.count };
}

export async function bulkExportDossiers(ids: string[]): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const dossiers = await db.dossier.findMany({ where: { id: { in: ids } }, include: { contact: true } });
  return generateCSV(dossiers as Record<string, unknown>[], ENTITY_COLUMNS.dossiers);
}

export async function bulkUpdateDossierStatus(ids: string[], status: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();
  const result = await db.dossier.updateMany({ where: { id: { in: ids } }, data: { status: status as never } });
  revalidatePath("/dossiers");
  return { updated: result.count };
}
