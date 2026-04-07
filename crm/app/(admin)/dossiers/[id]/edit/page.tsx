import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import { updateDossier } from "../../actions";

const TYPE_LABELS: Record<string, string> = {
  tva_mensuelle: "TVA Mensuelle",
  ir: "Impôts (IR)",
  is: "Impôts Société (IS)",
  comptabilite: "Comptabilité",
  ccss: "CCSS",
  coordination: "Coordination FR-LU",
};

const STATUS_OPTIONS = [
  { value: "todo", label: "À faire" },
  { value: "docs_pending", label: "Documents manquants" },
  { value: "in_progress", label: "En cours" },
  { value: "review", label: "Révision" },
  { value: "done", label: "Terminé" },
];

export default async function EditDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const dossier = await db.dossier.findUnique({
    where: { id },
    include: { contact: true },
  });

  if (!dossier) notFound();

  const deadlineValue = dossier.deadline
    ? new Date(dossier.deadline).toISOString().split("T")[0]
    : "";

  const action = updateDossier.bind(null, id);

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href={`/dossiers/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modifier le dossier</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {TYPE_LABELS[dossier.type] ?? dossier.type}{" "}
            · {dossier.contact.firstName} {dossier.contact.lastName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Informations du dossier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                name="status"
                defaultValue={dossier.status}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite (deadline)</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={deadlineValue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={5}
                defaultValue={dossier.notes ?? ""}
                placeholder="Notes internes sur ce dossier..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href={`/dossiers/${id}`}>
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
