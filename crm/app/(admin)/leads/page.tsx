import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import Link from "next/link";
import { ExportButton } from "@/components/export-button";
import { LeadsTable } from "./leads-table";

export default async function LeadsPage() {
  const db = getDb();

  const [leads, counts] = await Promise.all([
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { outreaches: true } },
        outreaches: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, channel: true, status: true },
        },
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

  const contactedCount =
    (countsByStatus["contacted"] ?? 0) +
    (countsByStatus["replied"] ?? 0) +
    (countsByStatus["qualified"] ?? 0);

  const STATUSES = [
    { value: "all", label: `Tous (${total})` },
    { value: "new", label: `Nouveau (${countsByStatus["new"] ?? 0})` },
    { value: "contacted", label: `Contacté (${contactedCount})` },
    { value: "lost", label: `Perdu (${countsByStatus["lost"] ?? 0})` },
    { value: "converted", label: `Converti (${countsByStatus["converted"] ?? 0})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            {total} lead{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton entity="leads" filters={{}} />
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

      <LeadsTable leads={JSON.parse(JSON.stringify(leads))} statuses={STATUSES} />
    </div>
  );
}
