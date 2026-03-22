import { getDb } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sent: { label: "Envoyée", variant: "default" },
  paid: { label: "Payée", variant: "default" },
  overdue: { label: "En retard", variant: "destructive" },
  cancelled: { label: "Annulée", variant: "outline" },
};

export default async function InvoicesPage() {
  const db = getDb();
  const invoices = await db.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { contact: true },
  });

  const totalUnpaid = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground mt-1">
            {invoices.length} facture{invoices.length !== 1 ? "s" : ""}
            {totalUnpaid > 0 && (
              <span className="ml-2 text-destructive font-medium">
                · {totalUnpaid.toFixed(2)}€ en attente
              </span>
            )}
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              Aucune facture. Créez un devis et convertissez-le en facture.
            </p>
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
                  <th className="px-4 py-3 font-medium">Échéance</th>
                  <th className="px-4 py-3 font-medium text-right">Montant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const s = STATUS_MAP[inv.status] ?? { label: inv.status, variant: "secondary" as const };
                  return (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm">{inv.number}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {inv.contact.firstName} {inv.contact.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-semibold">
                        {Number(inv.total).toFixed(2)}€
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/invoices/${inv.id}`}>
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
