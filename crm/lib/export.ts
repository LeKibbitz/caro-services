import * as XLSX from "xlsx";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Column {
  key: string;
  label: string;
}

// ─── Value resolver ───────────────────────────────────────────────────────────

function resolveValue(row: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let value: unknown = row;
  for (const part of parts) {
    if (value == null || typeof value !== "object") {
      value = undefined;
      break;
    }
    value = (value as Record<string, unknown>)[part];
  }

  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleDateString("fr-FR");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  // Prisma Decimal objects have a toString()
  return String(value);
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

export function generateCSV(
  rows: Record<string, unknown>[],
  columns: Column[]
): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => escape(resolveValue(row, c.key))).join(",")
    )
    .join("\n");

  return `${header}\n${body}`;
}

// ─── XLSX ────────────────────────────────────────────────────────────────────

export function generateXLSX(
  rows: Record<string, unknown>[],
  columns: Column[],
  sheetName: string
): Buffer {
  const data = [
    columns.map((c) => c.label),
    ...rows.map((row) => columns.map((c) => resolveValue(row, c.key))),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf as Buffer;
}

// ─── Column definitions ───────────────────────────────────────────────────────

export const ENTITY_COLUMNS: Record<string, Column[]> = {
  leads: [
    { key: "displayName", label: "Salon" },
    { key: "activityType", label: "Activité" },
    { key: "address", label: "Adresse" },
    { key: "phone", label: "Téléphone" },
    { key: "email", label: "Email" },
    { key: "ownerName", label: "Gérant" },
    { key: "status", label: "Statut" },
    { key: "createdAt", label: "Date création" },
  ],

  contacts: [
    { key: "firstName", label: "Prénom" },
    { key: "lastName", label: "Nom" },
    { key: "companyName", label: "Entreprise" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Téléphone" },
    { key: "city", label: "Ville" },
    { key: "country", label: "Pays" },
    { key: "type", label: "Type" },
    { key: "createdAt", label: "Date création" },
  ],

  quotes: [
    { key: "number", label: "Numéro" },
    { key: "contact.companyName", label: "Client" },
    { key: "subtotal", label: "Montant HT" },
    { key: "taxAmount", label: "TVA" },
    { key: "total", label: "Total" },
    { key: "status", label: "Statut" },
    { key: "validUntil", label: "Validité" },
    { key: "createdAt", label: "Date" },
  ],

  invoices: [
    { key: "number", label: "Numéro" },
    { key: "contact.companyName", label: "Client" },
    { key: "subtotal", label: "Montant HT" },
    { key: "taxAmount", label: "TVA" },
    { key: "total", label: "Total" },
    { key: "status", label: "Statut" },
    { key: "dueDate", label: "Échéance" },
    { key: "paidAt", label: "Payé le" },
    { key: "createdAt", label: "Date" },
  ],

  dossiers: [
    { key: "contact.companyName", label: "Client" },
    { key: "type", label: "Type" },
    { key: "year", label: "Année" },
    { key: "period", label: "Période" },
    { key: "status", label: "Statut" },
    { key: "deadline", label: "Deadline" },
    { key: "createdAt", label: "Date" },
  ],

  suppliers: [
    { key: "name", label: "Nom" },
    { key: "contactName", label: "Contact" },
    { key: "role", label: "Rôle" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Téléphone" },
    { key: "website", label: "Site web" },
  ],

  appointments: [
    { key: "title", label: "Titre" },
    { key: "contact.companyName", label: "Client/Fournisseur" },
    { key: "startAt", label: "Début" },
    { key: "endAt", label: "Fin" },
    { key: "location", label: "Lieu" },
    { key: "type", label: "Type" },
    { key: "status", label: "Statut" },
  ],

  messages: [
    { key: "channel", label: "Canal" },
    { key: "direction", label: "Direction" },
    { key: "fromAddr", label: "De" },
    { key: "toAddr", label: "À" },
    { key: "subject", label: "Objet" },
    { key: "createdAt", label: "Date" },
    { key: "read", label: "Lu" },
  ],
};
