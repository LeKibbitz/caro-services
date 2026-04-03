import { getDb } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload, Phone, Mail, User } from "lucide-react";
import Link from "next/link";
import type { LeadStatus } from "@/lib/generated/prisma/client";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  replied: "Répondu",
  qualified: "Qualifié",
  lost: "Perdu",
  converted: "Converti",
};

const STATUS_VARIANT: Record<
  LeadStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "secondary",
  contacted: "default",
  replied: "default",
  qualified: "default",
  lost: "destructive",
  converted: "outline",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-800",
  none: "bg-zinc-100 text-zinc-500",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const db = getDb();

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { salonName: { contains: q, mode: "insensitive" } },
      { ownerName: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (status && status !== "all") {
    where.status = status as LeadStatus;
  }

  const [leads, counts] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { outreaches: true } },
      },
    }),
    db.lead.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const countsByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count])
  );
  const total = counts.reduce((s, c) => s + c._count, 0);

  const STATUSES: Array<{ value: string; label: string }> = [
    { value: "all", label: `Tous (${total})` },
    ...Object.entries(STATUS_LABELS).map(([k, v]) => ({
      value: k,
      label: `${v} (${countsByStatus[k] ?? 0})`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
            {q || (status && status !== "all") ? " (filtrés)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/leads/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </Link>
          <Link href="/leads/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-3">
            <form className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Salon, gérant, adresse..."
                  defaultValue={q}
                  className="pl-9"
                />
                {status && status !== "all" && (
                  <input type="hidden" name="status" value={status} />
                )}
              </div>
            </form>
            <div className="flex flex-wrap gap-1">
              {STATUSES.map((s) => (
                <Link
                  key={s.value}
                  href={`/leads${s.value !== "all" ? `?status=${s.value}` : ""}${q ? `${s.value !== "all" ? "&" : "?"}q=${q}` : ""}`}
                >
                  <Badge
                    variant={(status || "all") === s.value ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                  >
                    {s.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Aucun lead trouvé.</p>
            <Link href="/leads/import" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importer depuis l&apos;extension Salonkee
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Commerce</th>
                  <th className="px-4 py-3 font-medium">Gérant</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium text-center">Envois</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      {lead.ownerName ? (
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
                      )}
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {lead._count.outreaches > 0 ? (
                        <span className="font-medium">
                          {lead._count.outreaches}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[lead.status]}>
                        {STATUS_LABELS[lead.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
