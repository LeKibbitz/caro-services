"use client";

import { FilterableList, type Column } from "@/components/filterable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ContactRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  type: string;
  _count: { dossiers: number; invoices: number };
};

const TYPE_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "client", label: "Client" },
  { value: "ancien", label: "Ancien" },
];

const columns: Column<ContactRow>[] = [
  {
    key: "nom",
    label: "Nom",
    render: (c) => (
      <Link
        href={`/contacts/${c.id}`}
        className="font-medium hover:text-primary transition-colors"
      >
        {c.firstName} {c.lastName}
      </Link>
    ),
  },
  {
    key: "entreprise",
    label: "Entreprise",
    className: "text-sm text-muted-foreground",
    render: (c) => c.companyName || "—",
  },
  {
    key: "email",
    label: "Email",
    className: "text-sm text-muted-foreground",
    render: (c) => c.email || "—",
  },
  {
    key: "phone",
    label: "Téléphone",
    className: "text-sm text-muted-foreground font-mono",
    render: (c) => c.phone || "—",
  },
  {
    key: "dossiers",
    label: "Dossiers",
    className: "text-center text-sm",
    render: (c) => c._count.dossiers,
  },
  {
    key: "factures",
    label: "Factures",
    className: "text-center text-sm",
    render: (c) => c._count.invoices,
  },
  {
    key: "statut",
    label: "Statut",
    render: (c) => (
      <Badge
        variant={
          c.type === "client"
            ? "default"
            : c.type === "prospect"
              ? "secondary"
              : "outline"
        }
      >
        {c.type}
      </Badge>
    ),
  },
];

export function ContactsTable({ contacts }: { contacts: ContactRow[] }) {
  return (
    <FilterableList
      items={contacts}
      searchFields={["firstName", "lastName", "email", "companyName", "phone"]}
      columns={columns}
      getId={(c) => c.id}
      statusOptions={TYPE_OPTIONS}
      statusField="type"
      searchPlaceholder="Nom, email, entreprise..."
      emptyMessage="Aucun contact trouvé."
      bulkActions={(ids) => (
        <Button variant="outline" size="sm" className="text-xs">
          {ids.length} contact{ids.length > 1 ? "s" : ""} sélectionné{ids.length > 1 ? "s" : ""}
        </Button>
      )}
    />
  );
}
