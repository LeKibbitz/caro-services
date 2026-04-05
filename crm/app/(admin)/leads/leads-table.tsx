"use client";

import { FilterableList, type Column } from "@/components/filterable-list";
import { LeadStatusSelect } from "@/components/lead-status-select";
import { Phone, Mail, User, MessageSquare, MessageCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { LeadStatus } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-800",
  none: "bg-zinc-100 text-zinc-500",
};

type LeadRow = {
  id: string;
  salonName: string;
  ownerName: string | null;
  ownerTitle: string | null;
  ownerConfidence: string | null;
  activityType: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
  _count: { outreaches: number };
  outreaches: Array<{
    createdAt: Date;
    channel: string;
    status: string;
  }>;
};

type Props = {
  leads: LeadRow[];
  statuses: Array<{ value: string; label: string }>;
};

const STATUS_GROUPED = ["contacted", "replied", "qualified"];

const columns: Column<LeadRow>[] = [
  {
    key: "commerce",
    label: "Commerce",
    render: (lead) => (
      <div>
        <Link
          href={`/leads/${lead.id}`}
          className="font-medium hover:text-primary transition-colors block"
        >
          {lead.salonName}
        </Link>
        {lead.activityType && (
          <span className="text-xs text-muted-foreground font-medium">
            {lead.activityType}
          </span>
        )}
        {lead.address && (
          <span className="text-xs text-muted-foreground block">
            {lead.address}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "gerant",
    label: "Gérant",
    render: (lead) =>
      lead.ownerName ? (
        <div>
          <div className="flex items-center gap-1.5 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{lead.ownerName}</span>
          </div>
          {lead.ownerTitle && (
            <span className="text-xs text-muted-foreground">
              {lead.ownerTitle}
            </span>
          )}
          {lead.ownerConfidence && (
            <span
              className={`inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 ${
                CONFIDENCE_COLORS[lead.ownerConfidence] ??
                CONFIDENCE_COLORS.none
              }`}
            >
              {lead.ownerConfidence}
            </span>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    key: "contact",
    label: "Contact",
    render: (lead) => (
      <div className="space-y-0.5">
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Phone className="h-3 w-3" />
            {lead.phone}
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {lead.email}
          </div>
        )}
        {!lead.phone && !lead.email && (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    ),
  },
  {
    key: "dernier_contact",
    label: "Dernier contact",
    render: (lead) =>
      lead.outreaches[0] ? (
        <div className="flex items-center gap-1.5 text-sm">
          {lead.outreaches[0].channel === "email" ? (
            <Mail className="h-3 w-3 text-muted-foreground" />
          ) : lead.outreaches[0].channel === "whatsapp" ? (
            <MessageSquare className="h-3 w-3 text-muted-foreground" />
          ) : (
            <MessageCircle className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-xs">
            {format(lead.outreaches[0].createdAt, "d MMM", { locale: fr })}
          </span>
          {lead._count.outreaches > 1 && (
            <span className="text-xs text-muted-foreground">
              ({lead._count.outreaches})
            </span>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "statut",
    label: "Statut",
    render: (lead) => (
      <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
    ),
  },
];

export function LeadsTable({ leads, statuses }: Props) {
  return (
    <FilterableList
      items={leads}
      searchFields={["salonName", "ownerName", "address", "phone", "email"]}
      columns={columns}
      getId={(l) => l.id}
      statusOptions={statuses}
      statusMatcher={(lead, status) => {
        if (status === "all") return true;
        if (status === "contacted") return STATUS_GROUPED.includes(lead.status);
        return lead.status === status;
      }}
      searchPlaceholder="Salon, gérant, adresse, téléphone..."
      emptyMessage="Aucun lead trouvé."
      bulkActions={(ids) => (
        <Button variant="outline" size="sm" className="text-xs">
          {ids.length} lead{ids.length > 1 ? "s" : ""} sélectionné{ids.length > 1 ? "s" : ""}
        </Button>
      )}
    />
  );
}
