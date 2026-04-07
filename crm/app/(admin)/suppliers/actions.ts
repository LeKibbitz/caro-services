"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

export async function createSupplier(formData: FormData) {
  const db = getDb();
  const supplier = await db.supplier.create({
    data: {
      name: (formData.get("name") as string).trim(),
      contactName: (formData.get("contactName") as string)?.trim() || null,
      role: (formData.get("role") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      website: (formData.get("website") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
    },
  });
  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplier.id}`);
}

export async function updateSupplier(id: string, formData: FormData) {
  const db = getDb();
  await db.supplier.update({
    where: { id },
    data: {
      name: (formData.get("name") as string).trim(),
      contactName: (formData.get("contactName") as string)?.trim() || null,
      role: (formData.get("role") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      website: (formData.get("website") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
    },
  });
  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${id}`);
  redirect(`/suppliers/${id}`);
}

export async function deleteSupplier(id: string): Promise<{ error?: string }> {
  const db = getDb();
  await db.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  return {};
}
