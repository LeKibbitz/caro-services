import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ExportButton } from "@/components/export-button";
import { SuppliersGrid } from "./suppliers-grid";

export default async function SuppliersPage() {
  const db = getDb();

  const suppliers = await db.supplier.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground mt-1">
            {suppliers.length} fournisseur{suppliers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton entity="suppliers" filters={{}} />
          <Link href="/suppliers/new">
            <Button><Plus className="h-4 w-4 mr-2" />Nouveau fournisseur</Button>
          </Link>
        </div>
      </div>

      <SuppliersGrid suppliers={JSON.parse(JSON.stringify(suppliers))} />
    </div>
  );
}
