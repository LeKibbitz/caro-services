import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Phone, Mail, MapPin, User, ExternalLink,
  Building2, Hash, Linkedin, Clock, MessageSquare, CheckCircle2, MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { LeadStatusSelect } from "./lead-status-select";
import { OutreachForm } from "./outreach-form";
import { ConvertButton } from "./convert-button";
import { EnrichButton } from "./enrich-button";
import type { LeadStatus, OutreachChannel, OutreachStatus } from "@/lib/generated/prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  replied: "Répondu",
  qualified: "Qualifié",
  lost: "Perdu",
  converted: "Converti",
};

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

const OUTREACH_STATUS_LABELS: Record<OutreachStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  replied: "Répondu",
  bounced: "Échec",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-800",
  none: "bg-zinc-100 text-zinc-500",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      outreaches: { orderBy: { createdAt: "desc" } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!lead) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/leads">
            <Button variant="ghost" size="sm" className="mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{lead.salonName}</h1>
            {lead.address && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {lead.address}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
          <EnrichButton leadId={lead.id} />
          {lead.status !== "converted" && (
            <ConvertButton leadId={lead.id} />
          )}
          {lead.contact && (
            <Link href={`/contacts/${lead.contact.id}`}>
              <Button variant="outline" size="sm">
                <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" />
                Voir contact
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Infos salon */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informations commerce
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {lead.activityType && (
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide pb-1">
                {lead.activityType}
              </div>
            )}
            {/* All phones */}
            {(() => {
              const phones = Array.isArray(lead.phones) ? (lead.phones as string[]) : lead.phone ? [lead.phone] : [];
              const unique = [...new Set(phones.filter(Boolean))];
              return unique.map((p, i) => {
                const waPhone = p.replace(/[^\d+]/g, "").replace(/^\+/, "");
                return (
                  <div key={p} className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      {i === 0 && unique.length > 1 ? (
                        <span className="text-emerald-600 font-medium">mobile</span>
                      ) : i > 0 ? (
                        <span>fixe</span>
                      ) : null}
                      {p}
                    </div>
                    <div className="flex gap-1.5">
                      <a href={`tel:${p}`} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors font-medium">
                        <Phone className="h-3 w-3" />
                        Appeler
                      </a>
                      <a href={`sms:${p}`} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors font-medium">
                        <MessageCircle className="h-3 w-3" />
                        SMS
                      </a>
                      <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors font-medium">
                        <MessageSquare className="h-3 w-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              });
            })()}
            {/* All emails */}
            {(() => {
              const emails = Array.isArray(lead.emails) ? (lead.emails as string[]) : lead.email ? [lead.email] : [];
              const unique = [...new Set(emails.filter(Boolean))];
              return unique.map((e) => (
                <div key={e} className="space-y-1">
                  <div className="text-xs text-muted-foreground truncate">{e}</div>
                  <a href={`mailto:${e}`} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors font-medium">
                    <Mail className="h-3 w-3" />
                    Envoyer un email
                  </a>
                </div>
              ));
            })()}
            {lead.sourceUrl && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                <a
                  href={lead.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary text-xs truncate"
                >
                  Profil Salonkee
                </a>
              </div>
            )}
            {lead.reviewsCount != null && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>{lead.reviewsCount} avis</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground text-xs pt-1">
              <Clock className="h-3.5 w-3.5" />
              Importé le {format(lead.createdAt, "d MMMM yyyy", { locale: fr })}
            </div>
          </CardContent>
        </Card>

        {/* Gérant */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Gérant / Propriétaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {lead.ownerName ? (
              <>
                <div className="font-medium">{lead.ownerName}</div>
                {lead.ownerTitle && (
                  <div className="text-muted-foreground">{lead.ownerTitle}</div>
                )}
                {lead.ownerConfidence && (
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded ${
                      CONFIDENCE_COLORS[lead.ownerConfidence] ?? CONFIDENCE_COLORS.none
                    }`}
                  >
                    Confiance : {lead.ownerConfidence}
                  </span>
                )}
                {lead.ownerSource && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    Source : {lead.ownerSource}
                  </div>
                )}
                {lead.rcsNumber && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    RCS : <span className="font-mono">{lead.rcsNumber}</span>
                  </div>
                )}
                {lead.linkedinUrl && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Linkedin className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={lead.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {lead.enrichNotes && (
                  <p className="text-xs text-muted-foreground pt-1 italic">
                    {lead.enrichNotes}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Gérant non identifié</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {lead.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{lead.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Outreach — nouvelle action */}
      {lead.status !== "converted" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Nouveau contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OutreachForm
              leadId={lead.id}
              salonName={lead.salonName}
              ownerName={lead.ownerName}
              hasEmail={!!lead.email}
              hasPhone={!!lead.phone}
            />
          </CardContent>
        </Card>
      )}

      {/* Historique outreach */}
      {lead.outreaches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Historique ({lead.outreaches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.outreaches.map((o) => (
              <div key={o.id} className="border rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {CHANNEL_LABELS[o.channel]}
                    </Badge>
                    <Badge
                      variant={o.status === "sent" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {OUTREACH_STATUS_LABELS[o.status]}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(o.createdAt, "d MMM yyyy à HH:mm", { locale: fr })}
                  </span>
                </div>
                {o.subject && (
                  <p className="text-sm font-medium">{o.subject}</p>
                )}
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {o.body}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
