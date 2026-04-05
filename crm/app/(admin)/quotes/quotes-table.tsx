"use client";

import { FilterableList, type Column } from "@/components/filterable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sent: { label: "Envoyé", variant: "default" },
  accepted: { label: "Accepté", variant: "default" },
  rejected: { label: "Refusé", variant: "destructive" },
  expired: { label: "Expiré", variant: "outline" },
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyé" },
  { value: "accepted", label: "Accepté" },
  { value: "rejected", label: "Refusé" },
  { value: "expired", label: "Expiré" },
];

type QuoteRow = {
  id: string;
  number: string;
  status: string;
  total: number | string;
  createdAt: string;
  contact: {
    firstName: string;
    lastName: string;
    companyName: string | null;
  };
};

const columns: Column<QuoteRow>[] = [
  {
    key: "number",
    label: "N°",
    className: "font-mono text-sm",
    render: (q) => q.number,
  },
  {
    key: "client",
    label: "Client",
    className: "text-sm font-medium",
    render: (q) => `${q.contact.firstName} ${q.contact.lastName}`,
  },
  {
    key: "date",
    label: "Date",
    className: "text-sm text-muted-foreground",
    render: (q) => new Date(q.createdAt).toLocaleDateString("fr-FR"),
  },
  {
    key: "montant",
    label: "Montant",
    className: "text-sm text-right font-mono font-semibold",
    render: (q) => `${Number(q.total).toFixed(2)}€`,
  },
  {
    key: "statut",
    label: "Statut",
    render: (q) => {
      const s = STATUS_LABELS[q.status] ?? { label: q.status, variant: "secondary" as const };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    key: "actions",
    label: "",
    className: "text-right",
    render: (q) => (
      <Link href={`/quotes/${q.id}`}>
        <Button variant="ghost" size="sm">Voir</Button>
      </Link>
    ),
  },
];

export function QuotesTable({ quotes }: { quotes: QuoteRow[] }) {
  return (
    <FilterableList
      items={quotes}
      searchFields={["number"]}
      searchExtract={(q) => `${q.contact.firstName} ${q.contact.lastName} ${q.contact.companyName ?? ""}`}
      columns={columns}
      getId={(q) => q.id}
      statusOptions={STATUS_OPTIONS}
      statusField="status"
      searchPlaceholder="Rechercher un devis..."
      emptyMessage="Aucun devis pour le moment."
      bulkActions={(ids) => (
        <Button variant="outline" size="sm" className="text-xs">
          {ids.length} devis sélectionné{ids.length > 1 ? "s" : ""}
        </Button>
      )}
    />
  );
}
