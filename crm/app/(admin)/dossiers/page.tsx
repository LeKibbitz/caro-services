import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ExportButton } from "@/components/export-button";
import { DossiersList } from "./dossiers-list";

export default async function DossiersPage() {
  const db = getDb();

  const dossiers = await db.dossier.findMany({
    orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }],
    include: { contact: true, _count: { select: { documents: true } } },
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
        <div className="flex items-center gap-2">
          <ExportButton entity="dossiers" filters={{}} />
          <Link href="/dossiers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </Button>
          </Link>
        </div>
      </div>

      <DossiersList dossiers={JSON.parse(JSON.stringify(dossiers))} />
    </div>
  );
}
