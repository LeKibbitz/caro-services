import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ExportButton } from "@/components/export-button";
import { QuotesTable } from "./quotes-table";

export default async function QuotesPage() {
  const db = getDb();

  const quotes = await db.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { contact: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground mt-1">
            {quotes.length} devis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton entity="quotes" filters={{}} />
          <Link href="/quotes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau devis
            </Button>
          </Link>
        </div>
      </div>

      <QuotesTable quotes={JSON.parse(JSON.stringify(quotes))} />
    </div>
  );
}
