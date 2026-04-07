import type { PrismaClient } from "@/lib/generated/prisma/client";

// Default statuses per entity (matches Prisma enums)
export const DEFAULT_STATUSES = {
  leads: [
    { value: "new", label: "Nouveau", color: "#64748b", deletable: false },
    { value: "contacted", label: "Contacté", color: "#3b82f6", deletable: false },
    { value: "replied", label: "A répondu", color: "#8b5cf6", deletable: false },
    { value: "qualified", label: "Qualifié", color: "#f59e0b", deletable: false },
    { value: "lost", label: "Perdu", color: "#ef4444", deletable: false },
    { value: "converted", label: "Converti", color: "#10b981", deletable: false },
  ],
  dossiers: [
    { value: "todo", label: "À faire", color: "#64748b", deletable: false },
    { value: "docs_pending", label: "Docs manquants", color: "#f59e0b", deletable: false },
    { value: "in_progress", label: "En cours", color: "#3b82f6", deletable: false },
    { value: "review", label: "À valider", color: "#8b5cf6", deletable: false },
    { value: "done", label: "Terminé", color: "#10b981", deletable: false },
  ],
  quotes: [
    { value: "draft", label: "Brouillon", color: "#64748b", deletable: false },
    { value: "sent", label: "Envoyé", color: "#3b82f6", deletable: false },
    { value: "accepted", label: "Accepté", color: "#10b981", deletable: false },
    { value: "rejected", label: "Refusé", color: "#ef4444", deletable: false },
    { value: "expired", label: "Expiré", color: "#f97316", deletable: false },
  ],
  invoices: [
    { value: "draft", label: "Brouillon", color: "#64748b", deletable: false },
    { value: "sent", label: "En cours", color: "#3b82f6", deletable: false },
    { value: "paid", label: "Payée", color: "#10b981", deletable: false },
    { value: "overdue", label: "En retard", color: "#ef4444", deletable: false },
    { value: "cancelled", label: "Annulé", color: "#f97316", deletable: false },
  ],
} as const;

export type EntityWithStatuses = keyof typeof DEFAULT_STATUSES;
export type StatusDef = { value: string; label: string; color: string; deletable: boolean };

// Read statuses from AppSetting, merged with defaults
export async function getStatuses(
  entity: EntityWithStatuses,
  db: PrismaClient
): Promise<StatusDef[]> {
  try {
    const setting = await db.appSetting.findUnique({
      where: { key: `custom_statuses_${entity}` },
    });
    if (!setting) return [...DEFAULT_STATUSES[entity]];
    const custom: StatusDef[] = JSON.parse(setting.value);
    return custom;
  } catch {
    return [...DEFAULT_STATUSES[entity]];
  }
}
