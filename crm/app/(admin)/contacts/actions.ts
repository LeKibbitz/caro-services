"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { ContactType } from "@/lib/generated/prisma/client";

export async function createContact(formData: FormData) {
  const db = getDb();

  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    companyName: (formData.get("companyName") as string) || undefined,
    type: (formData.get("type") as ContactType) || "prospect",
    country: (formData.get("country") as string) || "Luxembourg",
    city: (formData.get("city") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    source: (formData.get("source") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  if (!data.firstName || !data.lastName) {
    throw new Error("Prénom et nom sont requis.");
  }

  const contact = await db.contact.create({ data });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const db = getDb();

  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    companyName: (formData.get("companyName") as string) || null,
    type: (formData.get("type") as ContactType) || "prospect",
    country: (formData.get("country") as string) || "Luxembourg",
    city: (formData.get("city") as string) || null,
    address: (formData.get("address") as string) || null,
    source: (formData.get("source") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };

  await db.contact.update({ where: { id }, data });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  redirect(`/contacts/${id}`);
}

export async function deleteContact(id: string): Promise<{ error?: string }> {
  const db = getDb();
  const contact = await db.contact.findUnique({
    where: { id },
    include: {
      _count: { select: { quotes: true, invoices: true, dossiers: true, documents: true } },
    },
  });
  if (!contact) return { error: "Contact introuvable" };
  const { quotes, invoices, dossiers, documents } = contact._count;
  if (quotes > 0) return { error: `Impossible : ${quotes} devis lié(s). Supprimez-les d'abord.` };
  if (invoices > 0) return { error: `Impossible : ${invoices} facture(s) liée(s). Supprimez-les d'abord.` };
  if (dossiers > 0) return { error: `Impossible : ${dossiers} dossier(s) lié(s). Supprimez-les d'abord.` };
  if (documents > 0) return { error: `Impossible : ${documents} document(s) lié(s). Supprimez-les d'abord.` };
  // Nullify optional relations before deleting
  await db.lead.updateMany({ where: { contactId: id }, data: { contactId: null } });
  await db.message.deleteMany({ where: { contactId: id } });
  await db.appointment.updateMany({ where: { contactId: id }, data: { contactId: null } });
  await db.contact.delete({ where: { id } });
  revalidatePath("/contacts");
  return {};
}
