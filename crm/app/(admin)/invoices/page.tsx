import { getDb } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ExportButton } from "@/components/export-button";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { InvoicesTable, ImpayesTable } from "./invoices-table";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

type Tab = "all" | "ca" | "impayes";

function formatEUR(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = (tabParam as Tab) ?? "all";
  const db = getDb();

  const allInvoices = await db.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { contact: true },
  });

  const now = new Date();
  const impayes = allInvoices.filter(
    (i) =>
      i.status === "overdue" ||
      (i.status === "sent" && (!i.dueDate || i.dueDate < now))
  );
  const totalImpayes = impayes.reduce((s, i) => s + Number(i.total), 0);

  // CA mensuel
  const caByMonth: Record<string, { total: number; count: number; label: string }> = {};
  for (const inv of allInvoices) {
    if (inv.status === "cancelled") continue;
    const d = new Date(inv.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    if (!caByMonth[key]) caByMonth[key] = { total: 0, count: 0, label };
    caByMonth[key].total += Number(inv.total);
    caByMonth[key].count += 1;
  }
  const caMonths = Object.entries(caByMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v);
  const totalCA = caMonths.reduce((s, m) => s + m.total, 0);

  const totalUnpaid = allInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.total), 0);

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground mt-1">
            {allInvoices.length} facture{allInvoices.length !== 1 ? "s" : ""}
            {totalUnpaid > 0 && tab === "all" && (
              <span className="ml-2 text-destructive font-medium">
                · {formatEUR(totalUnpaid)} en attente
              </span>
            )}
          </p>
        </div>
        <ExportButton entity="invoices" filters={{}} />
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-1">
        <Link href="/invoices" className={tabClass("all")}>
          Toutes
        </Link>
        <Link href="/invoices?tab=ca" className={tabClass("ca")}>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Chiffre d&apos;affaires
          </span>
        </Link>
        <Link href="/invoices?tab=impayes" className={tabClass("impayes")}>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Impayés
            {impayes.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                {impayes.length}
              </span>
            )}
          </span>
        </Link>
      </div>

      {/* Tab: Chiffre d'affaires */}
      {tab === "ca" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              CA total (hors annulées) : <span className="font-semibold text-foreground">{formatEUR(totalCA)}</span>
            </p>
          </div>
          {caMonths.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Aucune donnée de facturation.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Mois</th>
                      <th className="px-4 py-3 font-medium text-center">Factures</th>
                      <th className="px-4 py-3 font-medium text-right">CA du mois</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caMonths.map((m) => (
                      <tr key={m.label} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-sm">{m.label}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground text-center">{m.count}</td>
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-right">
                          {formatEUR(m.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/30">
                      <td className="px-4 py-3 text-sm font-semibold">Total</td>
                      <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                        {allInvoices.filter((i) => i.status !== "cancelled").length}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-bold text-right">{formatEUR(totalCA)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Impayés */}
      {tab === "impayes" && (
        <div className="space-y-4">
          {impayes.length > 0 && (
            <p className="text-sm text-destructive font-medium">
              {impayes.length} facture{impayes.length !== 1 ? "s" : ""} impayée{impayes.length !== 1 ? "s" : ""} · {formatEUR(totalImpayes)}
            </p>
          )}
          <ImpayesTable
            invoices={JSON.parse(JSON.stringify(
              impayes.sort((a, b) => {
                const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                const db_ = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                return da - db_;
              })
            ))}
          />
        </div>
      )}

      {/* Tab: Toutes (default) */}
      {tab === "all" && (
        <InvoicesTable invoices={JSON.parse(JSON.stringify(allInvoices))} />
      )}
    </div>
  );
}
