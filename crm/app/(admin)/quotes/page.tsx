import { getDb } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sent: { label: "Envoyé", variant: "default" },
  accepted: { label: "Accepté", variant: "default" },
  rejected: { label: "Refusé", variant: "destructive" },
  expired: { label: "Expiré", variant: "outline" },
};

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
        <Link href="/quotes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Aucun devis pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">N°</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Montant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const s = STATUS_LABELS[q.status] ?? { label: q.status, variant: "secondary" as const };
                  return (
                    <tr key={q.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm">{q.number}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {q.contact.firstName} {q.contact.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-semibold">
                        {Number(q.total).toFixed(2)}€
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/quotes/${q.id}`}>
                          <Button variant="ghost" size="sm">Voir</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
