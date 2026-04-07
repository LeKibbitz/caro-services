"use client";

import { FilterableList, type Column } from "@/components/filterable-list";
import { LeadStatusSelect } from "@/components/lead-status-select";
import {
  BulkActionsBar,
  makeDeleteAction,
  makeExportAction,
  makeEnrichAction,
  makeCampaignAction,
} from "@/components/bulk-actions-bar";
import { bulkDeleteLeads, bulkExportLeads, bulkEnrichLeads } from "./bulk-actions";
import { Phone, Mail, User, MessageSquare, MessageCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { LeadStatus } from "@/lib/generated/prisma/client";

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-800",
  none: "bg-zinc-100 text-zinc-500",
};

type LeadRow = {
  id: string;
  displayName: string;
  leadType: string;
  ownerName: string | null;
  ownerTitle: string | null;
  ownerConfidence: string | null;
  activityType: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  forumUsername: string | null;
  topicCategory: string | null;
  viewCount: number | null;
  replyCount: number | null;
  status: LeadStatus;
  _count: { outreaches: number };
  outreaches: Array<{
    createdAt: Date;
    channel: string;
    status: string;
  }>;
  labels?: Array<{ label: { id: string; name: string; color: string } }>;
};

const SOURCE_BADGES: Record<string, { label: string; className: string }> = {
  salonkee: { label: "Salonkee", className: "bg-violet-100 text-violet-800" },
  "frontaliers-forum": { label: "Forum", className: "bg-blue-100 text-blue-800" },
  "frontaliers-annonces": { label: "Annonce", className: "bg-amber-100 text-amber-800" },
  manual: { label: "Manuel", className: "bg-zinc-100 text-zinc-600" },
};

type Props = {
  leads: LeadRow[];
  statuses: Array<{ value: string; label: string }>;
};

const STATUS_GROUPED = ["contacted", "replied", "qualified"];

const columns: Column<LeadRow>[] = [
  {
    key: "commerce",
    label: "Nom",
    render: (lead) => {
      const badge = SOURCE_BADGES[lead.source] ?? SOURCE_BADGES.manual;
      return (
      <div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/leads/${lead.id}`}
            className="font-medium hover:text-primary transition-colors"
          >
            {lead.displayName}
          </Link>
          <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {lead.leadType === "forum" && lead.forumUsername && (
          <span className="text-xs text-muted-foreground">
            par {lead.forumUsername}
            {lead.replyCount != null && ` · ${lead.replyCount} rép.`}
            {lead.viewCount != null && ` · ${lead.viewCount} vues`}
          </span>
        )}
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
        {lead.labels && lead.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {lead.labels.map((ll) => (
              <span
                key={ll.label.id}
                className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium border"
                style={{ borderColor: ll.label.color, color: ll.label.color }}
              >
                {ll.label.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );},
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
      searchFields={["displayName", "ownerName", "address", "phone", "email", "forumUsername", "topicCategory"]}
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
        <BulkActionsBar
          selectedIds={ids}
          actions={[
            makeDeleteAction(bulkDeleteLeads, "lead"),
            makeExportAction(bulkExportLeads, "leads"),
            makeEnrichAction(bulkEnrichLeads),
            makeCampaignAction("email", "Campagne email"),
            makeCampaignAction("whatsapp", "Campagne WA"),
            makeCampaignAction("sms", "Campagne SMS"),
          ]}
        />
      )}
    />
  );
}
