"use client";

import { FilterableList } from "@/components/filterable-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BulkActionsBar,
  makeDeleteAction,
  makeExportAction,
  makeStatusAction,
} from "@/components/bulk-actions-bar";
import { bulkDeleteDossiers, bulkExportDossiers, bulkUpdateDossierStatus } from "./bulk-actions";
import { Calendar, AlertTriangle, CheckSquare, Square } from "lucide-react";
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
  review: { label: "À valider", variant: "default" },
  done: { label: "Terminé", variant: "default" },
};

const STATUS_OPTIONS = [
  { value: "todo", label: "À faire" },
  { value: "docs_pending", label: "Docs manquants" },
  { value: "in_progress", label: "En cours" },
  { value: "review", label: "À valider" },
  { value: "done", label: "Terminé" },
];

type DossierRow = {
  id: string;
  type: string;
  year: number;
  period: string | null;
  status: string;
  deadline: string | null;
  notes: string | null;
  contact: {
    firstName: string;
    lastName: string;
    companyName: string | null;
  };
  _count: { documents: number };
};

export function DossiersList({ dossiers }: { dossiers: DossierRow[] }) {
  return (
    <FilterableList
      items={dossiers}
      searchFields={["type", "notes"]}
      searchExtract={(d) =>
        `${d.contact.firstName} ${d.contact.lastName} ${d.contact.companyName ?? ""} ${TYPE_LABELS[d.type] ?? d.type}`
      }
      columns={[]}
      getId={(d) => d.id}
      layout="rows"
      statusOptions={STATUS_OPTIONS}
      statusField="status"
      renderCard={(d, selected, onToggle) => {
        const s = STATUS_MAP[d.status] ?? { label: d.status, variant: "secondary" as const };
        const isOverdue = d.deadline && new Date(d.deadline) < new Date() && d.status !== "done";
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="filterable-checkbox shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              {selected ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
            <Link href={`/dossiers/${d.id}`} className="flex-1">
              <Card className={`hover:bg-muted/30 transition-colors cursor-pointer ${selected ? "border-primary/30 bg-primary/5" : ""}`}>
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
          </div>
        );
      }}
      searchPlaceholder="Rechercher un dossier..."
      emptyMessage="Aucun dossier trouvé."
      bulkActions={(ids) => (
        <BulkActionsBar
          selectedIds={ids}
          actions={[
            makeDeleteAction(bulkDeleteDossiers, "dossier"),
            makeExportAction(bulkExportDossiers, "dossiers"),
            makeStatusAction(bulkUpdateDossierStatus, "done", "Marquer terminé"),
            makeStatusAction(bulkUpdateDossierStatus, "in_progress", "Marquer en cours"),
          ]}
        />
      )}
    />
  );
}
