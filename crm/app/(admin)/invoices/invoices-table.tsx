"use client";

import { FilterableList, type Column } from "@/components/filterable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BulkActionsBar,
  makeDeleteAction,
  makeExportAction,
} from "@/components/bulk-actions-bar";
import { bulkDeleteInvoices, bulkExportInvoices, bulkMarkInvoicesPaid } from "./bulk-actions";
import { Check } from "lucide-react";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sent: { label: "En cours", variant: "default" },
  paid: { label: "Payée", variant: "default" },
  overdue: { label: "En retard", variant: "destructive" },
  cancelled: { label: "Annulée", variant: "outline" },
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "En cours" },
  { value: "paid", label: "Payé" },
  { value: "overdue", label: "En retard" },
  { value: "cancelled", label: "Annulé" },
];

type InvoiceRow = {
  id: string;
  number: string;
  status: string;
  total: number | string;
  createdAt: string;
  dueDate: string | null;
  contact: {
    firstName: string;
    lastName: string;
    companyName: string | null;
  };
};

const columns: Column<InvoiceRow>[] = [
  {
    key: "number",
    label: "N°",
    className: "font-mono text-sm",
    render: (inv) => inv.number,
  },
  {
    key: "client",
    label: "Client",
    className: "text-sm font-medium",
    render: (inv) => `${inv.contact.firstName} ${inv.contact.lastName}`,
  },
  {
    key: "date",
    label: "Date",
    className: "text-sm text-muted-foreground",
    render: (inv) => new Date(inv.createdAt).toLocaleDateString("fr-FR"),
  },
  {
    key: "echeance",
    label: "Échéance",
    className: "text-sm text-muted-foreground",
    render: (inv) =>
      inv.dueDate
        ? new Date(inv.dueDate).toLocaleDateString("fr-FR")
        : "—",
  },
  {
    key: "montant",
    label: "Montant",
    className: "text-sm text-right font-mono font-semibold",
    render: (inv) => `${Number(inv.total).toFixed(2)}€`,
  },
  {
    key: "statut",
    label: "Statut",
    render: (inv) => {
      const s = STATUS_MAP[inv.status] ?? { label: inv.status, variant: "secondary" as const };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    key: "actions",
    label: "",
    className: "text-right",
    render: (inv) => (
      <Link href={`/invoices/${inv.id}`}>
        <Button variant="ghost" size="sm">Voir</Button>
      </Link>
    ),
  },
];

export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <FilterableList
      items={invoices}
      searchFields={["number"]}
      searchExtract={(inv) =>
        `${inv.contact.firstName} ${inv.contact.lastName} ${inv.contact.companyName ?? ""}`
      }
      columns={columns}
      getId={(inv) => inv.id}
      statusOptions={STATUS_OPTIONS}
      statusField="status"
      searchPlaceholder="Rechercher une facture..."
      emptyMessage="Aucune facture. Créez un devis et convertissez-le en facture."
      bulkActions={(ids) => (
        <BulkActionsBar
          selectedIds={ids}
          actions={[
            makeDeleteAction(bulkDeleteInvoices, "facture"),
            makeExportAction(bulkExportInvoices, "factures"),
            {
              key: "mark-paid",
              label: "Marquer payées",
              icon: <Check className="h-3 w-3" />,
              action: bulkMarkInvoicesPaid,
              onComplete: () => window.location.reload(),
            },
          ]}
        />
      )}
    />
  );
}

// Simplified table for impayés tab (no filter needed, just selection)
const impayesColumns: Column<InvoiceRow>[] = [
  columns[0], // number
  columns[1], // client
  {
    key: "echeance",
    label: "Échéance",
    className: "text-sm",
    render: (inv) => {
      const isLate = inv.dueDate && new Date(inv.dueDate) < new Date();
      return inv.dueDate ? (
        <span className={isLate ? "text-destructive font-medium" : "text-muted-foreground"}>
          {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  columns[4], // montant
  columns[5], // statut
  columns[6], // actions
];

export function ImpayesTable({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <FilterableList
      items={invoices}
      searchFields={["number"]}
      searchExtract={(inv) =>
        `${inv.contact.firstName} ${inv.contact.lastName}`
      }
      columns={impayesColumns}
      getId={(inv) => inv.id}
      searchPlaceholder="Rechercher un impayé..."
      emptyMessage="Aucun impayé — tout est en ordre !"
      bulkActions={(ids) => (
        <BulkActionsBar
          selectedIds={ids}
          actions={[
            makeExportAction(bulkExportInvoices, "impayes"),
            {
              key: "mark-paid",
              label: "Marquer payées",
              icon: <Check className="h-3 w-3" />,
              action: bulkMarkInvoicesPaid,
              onComplete: () => window.location.reload(),
            },
          ]}
        />
      )}
    />
  );
}
