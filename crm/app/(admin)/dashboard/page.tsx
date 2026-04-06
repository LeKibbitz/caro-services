import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Receipt, FolderOpen, Target, Send, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getSession();
  const db = getDb();

  const currentYear = new Date().getFullYear();
  const [contactsCount, quotesCount, invoicesCount, dossiersCount, leadsCount, outreachSentCount, caAnnuel] =
    await Promise.all([
      db.contact.count(),
      db.quote.count(),
      db.invoice.count(),
      db.dossier.count(),
      db.lead.count(),
      db.outreach.count({ where: { status: "sent" } }),
      db.invoice.aggregate({
        where: {
          status: { not: "cancelled" },
          createdAt: { gte: new Date(`${currentYear}-01-01`), lt: new Date(`${currentYear + 1}-01-01`) },
        },
        _sum: { total: true },
      }),
    ]);
  const caAnnuelValue = Math.round(Number(caAnnuel._sum.total ?? 0));

  const [recentOutreaches, pendingDossiers, unpaidInvoices] = await Promise.all([
    db.outreach.findMany({
      where: { status: "sent" },
      orderBy: { sentAt: "desc" },
      take: 5,
      include: { lead: { select: { displayName: true, id: true } } },
    }),
    db.dossier.findMany({
      where: { status: { not: "done" } },
      include: { contact: true },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
    db.invoice.findMany({
      where: { status: { in: ["sent", "overdue"] } },
      include: { contact: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bonjour {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">Voici un résumé de votre activité.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        <StatCard title="Clients" value={contactsCount} icon={<Users className="h-4 w-4" />} href="/contacts" />
        <StatCard title="Leads" value={leadsCount} icon={<Target className="h-4 w-4" />} href="/leads" />
        <StatCard title="Envois" value={outreachSentCount} icon={<Send className="h-4 w-4" />} href="/leads" />
        <StatCard title="Devis" value={quotesCount} icon={<FileText className="h-4 w-4" />} href="/quotes" />
        <StatCard title="Factures" value={invoicesCount} icon={<Receipt className="h-4 w-4" />} href="/invoices" />
        <StatCard title="Dossiers" value={dossiersCount} icon={<FolderOpen className="h-4 w-4" />} href="/dossiers" />
        <StatCard title={`CA ${currentYear} (€)`} value={caAnnuelValue} icon={<TrendingUp className="h-4 w-4" />} href="/invoices?tab=ca" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent outreaches */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4 text-muted-foreground" />
              Derniers envois
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOutreaches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun envoi pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {recentOutreaches.map((o) => (
                  <Link key={o.id} href={`/leads/${o.lead.id}`} className="flex items-center justify-between text-sm hover:text-primary transition-colors">
                    <div>
                      <span className="font-medium">{o.lead.displayName}</span>
                      <span className="text-muted-foreground ml-2 text-xs">via {o.channel}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {o.sentAt ? new Date(o.sentAt).toLocaleDateString("fr-FR") : "—"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending dossiers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dossiers en cours</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDossiers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun dossier en cours.</p>
            ) : (
              <div className="space-y-3">
                {pendingDossiers.map((d) => (
                  <Link key={d.id} href={`/dossiers/${d.id}`} className="flex items-center justify-between text-sm hover:text-primary transition-colors">
                    <div>
                      <span className="font-medium">{d.contact.firstName} {d.contact.lastName}</span>
                      <span className="text-muted-foreground ml-2">· {d.type.replace("_", " ").toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.deadline && (
                        <span className="text-xs text-muted-foreground">{new Date(d.deadline).toLocaleDateString("fr-FR")}</span>
                      )}
                      <Badge variant={d.status === "docs_pending" ? "destructive" : "secondary"}>
                        {d.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {unpaidInvoices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Factures en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidInvoices.map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between text-sm hover:text-primary transition-colors">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{inv.number}</span>
                    <span className="font-medium">{inv.contact.firstName} {inv.contact.lastName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold">{Number(inv.total).toFixed(2)}€</span>
                    <Badge variant={inv.status === "overdue" ? "destructive" : "secondary"}>
                      {inv.status === "overdue" ? "En retard" : "Envoyée"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, href }: { title: string; value: number; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-0.5">{value}</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
