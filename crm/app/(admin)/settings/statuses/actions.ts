"use server";

import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DEFAULT_STATUSES, type StatusDef, type EntityWithStatuses } from "@/lib/statuses";
import { revalidatePath } from "next/cache";

const VALID_ENTITIES = Object.keys(DEFAULT_STATUSES) as EntityWithStatuses[];

function isValidEntity(entity: string): entity is EntityWithStatuses {
  return VALID_ENTITIES.includes(entity as EntityWithStatuses);
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function readStatuses(entity: EntityWithStatuses): Promise<StatusDef[]> {
  const db = getDb();
  try {
    const setting = await db.appSetting.findUnique({
      where: { key: `custom_statuses_${entity}` },
    });
    if (!setting) return [...DEFAULT_STATUSES[entity]];
    return JSON.parse(setting.value) as StatusDef[];
  } catch {
    return [...DEFAULT_STATUSES[entity]];
  }
}

async function writeStatuses(entity: EntityWithStatuses, statuses: StatusDef[]): Promise<void> {
  const db = getDb();
  await db.appSetting.upsert({
    where: { key: `custom_statuses_${entity}` },
    create: { key: `custom_statuses_${entity}`, value: JSON.stringify(statuses) },
    update: { value: JSON.stringify(statuses) },
  });
}

export async function addCustomStatus(entity: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Non autorisé");
  }

  if (!isValidEntity(entity)) {
    throw new Error("Entité invalide");
  }

  const label = (formData.get("label") as string | null)?.trim();
  const color = (formData.get("color") as string | null)?.trim() ?? "#64748b";

  if (!label) throw new Error("Le libellé est requis");

  const value = slugify(label) || `status_${Date.now()}`;

  const statuses = await readStatuses(entity);

  // Avoid duplicate values
  if (statuses.some((s) => s.value === value)) {
    throw new Error("Un statut avec ce libellé existe déjà");
  }

  statuses.push({ value, label, color, deletable: true });
  await writeStatuses(entity, statuses);

  revalidatePath("/settings/statuses");
}

export async function deleteCustomStatus(entity: string, value: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Non autorisé");
  }

  if (!isValidEntity(entity)) {
    throw new Error("Entité invalide");
  }

  const statuses = await readStatuses(entity);
  const filtered = statuses.filter(
    (s) => !(s.value === value && s.deletable === true)
  );
  await writeStatuses(entity, filtered);

  revalidatePath("/settings/statuses");
}

export async function updateStatusLabel(
  entity: string,
  value: string,
  newLabel: string
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Non autorisé");
  }

  if (!isValidEntity(entity)) {
    throw new Error("Entité invalide");
  }

  const trimmed = newLabel.trim();
  if (!trimmed) throw new Error("Le libellé est requis");

  const statuses = await readStatuses(entity);
  const updated = statuses.map((s) =>
    s.value === value ? { ...s, label: trimmed } : s
  );
  await writeStatuses(entity, updated);

  revalidatePath("/settings/statuses");
}
