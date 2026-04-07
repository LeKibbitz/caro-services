"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { DossierType, DossierStatus } from "@/lib/generated/prisma/client";

export async function createDossier(formData: FormData) {
  const db = getDb();

  const contactId = formData.get("contactId") as string;
  const type = formData.get("type") as DossierType;
  const year = Number(formData.get("year"));
  const period = (formData.get("period") as string) || undefined;
  const deadlineStr = formData.get("deadline") as string;
  const deadline = deadlineStr ? new Date(deadlineStr) : undefined;
  const notes = (formData.get("notes") as string) || undefined;
  const checklistRaw = formData.get("checklist") as string;
  const checklist = checklistRaw ? JSON.parse(checklistRaw) : undefined;

  const dossier = await db.dossier.create({
    data: { contactId, type, year, period, deadline, notes, checklist },
  });

  revalidatePath("/dossiers");
  redirect(`/dossiers/${dossier.id}`);
}

export async function updateDossier(id: string, formData: FormData) {
  const db = getDb();
  const deadlineStr = formData.get("deadline") as string;
  await db.dossier.update({
    where: { id },
    data: {
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      notes: (formData.get("notes") as string) || null,
      status: (formData.get("status") as DossierStatus) || "todo",
    },
  });
  revalidatePath("/dossiers");
  revalidatePath(`/dossiers/${id}`);
  redirect(`/dossiers/${id}`);
}

export async function updateDossierStatus(id: string, status: DossierStatus) {
  const db = getDb();
  await db.dossier.update({ where: { id }, data: { status } });
  revalidatePath("/dossiers");
  revalidatePath(`/dossiers/${id}`);
}

export async function updateDossierChecklist(id: string, checklist: unknown) {
  const db = getDb();
  await db.dossier.update({ where: { id }, data: { checklist: checklist as object } });
  revalidatePath(`/dossiers/${id}`);
}

export async function deleteDossier(id: string): Promise<{ error?: string }> {
  const db = getDb();
  const count = await db.document.count({ where: { dossierId: id } });
  if (count > 0) return { error: `Impossible : ${count} document(s) lié(s). Supprimez-les d'abord.` };
  await db.dossier.delete({ where: { id } });
  revalidatePath("/dossiers");
  return {};
}
