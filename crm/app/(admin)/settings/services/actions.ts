"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getCatalog, saveCatalog, DEFAULT_CATALOG } from "@/lib/services";
import type { ServiceItem } from "@/lib/services";

function adminOnly() {
  return getSession().then((s) => {
    if (!s || s.role !== "admin") throw new Error("Non autorisé");
  });
}

function uid() {
  return `s${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function addService(formData: FormData): Promise<void> {
  await adminOnly();
  const catalog = await getCatalog();
  const item: ServiceItem = {
    id: uid(),
    category: (formData.get("category") as string).trim(),
    description: (formData.get("description") as string).trim(),
    unitPrice: Number(formData.get("unitPrice")) || 0,
    badge: (formData.get("badge") as string)?.trim() || undefined,
    detail: (formData.get("detail") as string)?.trim() || undefined,
  };
  await saveCatalog([...catalog, item]);
  revalidatePath("/settings/services");
}

export async function updateService(formData: FormData): Promise<void> {
  await adminOnly();
  const id = formData.get("id") as string;
  const catalog = await getCatalog();
  const updated = catalog.map((s): ServiceItem =>
    s.id === id
      ? {
          ...s,
          category: (formData.get("category") as string).trim(),
          description: (formData.get("description") as string).trim(),
          unitPrice: Number(formData.get("unitPrice")) || 0,
          badge: (formData.get("badge") as string)?.trim() || undefined,
          detail: (formData.get("detail") as string)?.trim() || undefined,
        }
      : s
  );
  await saveCatalog(updated);
  revalidatePath("/settings/services");
}

export async function deleteService(id: string): Promise<void> {
  await adminOnly();
  const catalog = await getCatalog();
  await saveCatalog(catalog.filter((s) => s.id !== id));
  revalidatePath("/settings/services");
}

export async function resetToDefault(): Promise<void> {
  await adminOnly();
  await saveCatalog(DEFAULT_CATALOG);
  revalidatePath("/settings/services");
}
