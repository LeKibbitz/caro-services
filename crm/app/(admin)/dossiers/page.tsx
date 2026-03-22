import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  tva_mensuelle: "TVA Mensuelle",
  ir: "Impôts (IR)",
  is: "Impôts Société (IS)",
  comptabilite: "Comptabilité",
  ccss: "CCSS",
  coordination: "Coordination FR-LU",
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  todo: { label: "À faire", variant: "outline" },
  docs_pending: { label: "Docs manquants", variant: "destructive" },
  in_progress: { label: "En cours", variant: "secondary" },
  review: { label: "Révision", variant: "default" },
  done: { label: "Terminé", variant: "default" },
};

export default async function DossiersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const db = getDb();

  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    where.status = status;
  }

  const dossiers = await db.dossier.findMany({
    where,
    orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }],
    include: { contact: true, _count: { select: { documents: true } } },
  });

  const statusCounts = await db.dossier.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dossiers fiscaux</h1>
          <p className="text-muted-foreground mt-1">
            {dossiers.length} dossier{dossiers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dossiers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau dossier
          </Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/dossiers">
          <Badge variant={!status || status === "all" ? "default" : "secondary"} className="cursor-pointer">
            Tous
          </Badge>
        </Link>
        {Object.entries(STATUS_MAP).map(([key, { label }]) => {
          const count = statusCounts.find((s) => s.status === key)?._count ?? 0;
          return (
            <Link key={key} href={`/dossiers?status=${key}`}>
              <Badge
                variant={status === key ? "default" : "secondary"}
                className="cursor-pointer"
              >
                {label} ({count})
              </Badge>
            </Link>
          );
        })}
      </div>

      {dossiers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Aucun dossier trouvé.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {dossiers.map((d) => {
            const s = STATUS_MAP[d.status] ?? { label: d.status, variant: "secondary" as const };
            const isOverdue = d.deadline && new Date(d.deadline) < new Date() && d.status !== "done";
            return (
              <Link key={d.id} href={`/dossiers/${d.id}`}>
                <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium text-sm">
                          {d.contact.firstName} {d.contact.lastName}
                          {d.contact.companyName && (
                            <span className="text-muted-foreground ml-1">
                              · {d.contact.companyName}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {TYPE_LABELS[d.type] ?? d.type} · {d.year}
                          {d.period ? ` · ${d.period}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d._count.documents > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {d._count.documents} doc{d._count.documents > 1 ? "s" : ""}
                        </span>
                      )}
                      {d.deadline && (
                        <span
                          className={`text-xs flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                        >
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          <Calendar className="h-3 w-3" />
                          {new Date(d.deadline).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      <Badge variant={isOverdue ? "destructive" : s.variant}>
                        {s.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
