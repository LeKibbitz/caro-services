import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, Calendar, FileUp } from "lucide-react";
import Link from "next/link";
import { updateDossierStatus } from "../actions";
import { DossierChecklist } from "@/components/dossier-checklist";

const TYPE_LABELS: Record<string, string> = {
  tva_mensuelle: "TVA Mensuelle",
  ir: "Impôts (IR)",
  is: "Impôts Société (IS)",
  comptabilite: "Comptabilité",
  ccss: "CCSS",
  coordination: "Coordination FR-LU",
};

const STATUS_FLOW = [
  { value: "todo", label: "À faire" },
  { value: "docs_pending", label: "Docs manquants" },
  { value: "in_progress", label: "En cours" },
  { value: "review", label: "Révision" },
  { value: "done", label: "Terminé" },
];

export default async function DossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const dossier = await db.dossier.findUnique({
    where: { id },
    include: { contact: true, documents: { include: { uploader: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!dossier) notFound();

  const checklist = (dossier.checklist as { label: string; done: boolean }[] | null) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {TYPE_LABELS[dossier.type] ?? dossier.type}
            </h1>
            <Badge>{dossier.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            <Link
              href={`/contacts/${dossier.contact.id}`}
              className="hover:text-primary"
            >
              {dossier.contact.firstName} {dossier.contact.lastName}
            </Link>
            {" · "}
            {dossier.year}
            {dossier.period ? ` · ${dossier.period}` : ""}
          </p>
        </div>
      </div>

      {/* Status flow */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {STATUS_FLOW.map((s) => (
              <form key={s.value} action={updateDossierStatus.bind(null, id, s.value as never)}>
                <Button
                  variant={dossier.status === s.value ? "default" : "outline"}
                  size="sm"
                  type="submit"
                  disabled={dossier.status === s.value}
                >
                  {s.label}
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>

      {dossier.deadline && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Deadline :</span>
          <span
            className={
              new Date(dossier.deadline) < new Date() && dossier.status !== "done"
                ? "text-destructive font-medium"
                : ""
            }
          >
            {new Date(dossier.deadline).toLocaleDateString("fr-FR")}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              Checklist documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checklist.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas de checklist.</p>
            ) : (
              <DossierChecklist dossierId={id} items={checklist} />
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileUp className="h-4 w-4 text-primary" />
              Documents ({dossier.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dossier.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun document uploadé.
              </p>
            ) : (
              <div className="space-y-2">
                {dossier.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <div>
                      <span className="font-medium">{doc.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {doc.uploader.name} ·{" "}
                        {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {doc.size && (
                      <span className="text-xs text-muted-foreground">
                        {(doc.size / 1024).toFixed(0)} Ko
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {dossier.notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {dossier.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
