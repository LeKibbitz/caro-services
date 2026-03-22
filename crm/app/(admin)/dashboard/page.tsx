import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Receipt, FolderOpen } from "lucide-react";

export default async function DashboardPage() {
  const user = await getSession();
  const db = getDb();

  const [contactsCount, quotesCount, invoicesCount, dossiersCount] =
    await Promise.all([
      db.contact.count(),
      db.quote.count(),
      db.invoice.count(),
      db.dossier.count(),
    ]);

  const recentContacts = await db.contact.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const pendingDossiers = await db.dossier.findMany({
    where: { status: { not: "done" } },
    include: { contact: true },
    orderBy: { deadline: "asc" },
    take: 5,
  });

  const unpaidInvoices = await db.invoice.findMany({
    where: { status: { in: ["sent", "overdue"] } },
    include: { contact: true },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bonjour {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Voici un résumé de votre activité.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clients"
          value={contactsCount}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Devis"
          value={quotesCount}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Factures"
          value={invoicesCount}
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          title="Dossiers"
          value={dossiersCount}
          icon={<FolderOpen className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent contacts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Derniers contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun contact pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {c.firstName} {c.lastName}
                      </span>
                      {c.companyName && (
                        <span className="text-muted-foreground ml-2">
                          · {c.companyName}
                        </span>
                      )}
                    </div>
                    <Badge variant={c.type === "client" ? "default" : "secondary"}>
                      {c.type}
                    </Badge>
                  </div>
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
              <p className="text-sm text-muted-foreground">
                Aucun dossier en cours.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingDossiers.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {d.contact.firstName} {d.contact.lastName}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        · {d.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.deadline && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(d.deadline).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      <Badge
                        variant={
                          d.status === "docs_pending" ? "destructive" : "secondary"
                        }
                      >
                        {d.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unpaid invoices */}
      {unpaidInvoices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Factures en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      {inv.number}
                    </span>
                    <span className="font-medium">
                      {inv.contact.firstName} {inv.contact.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold">
                      {Number(inv.total).toFixed(2)}€
                    </span>
                    <Badge
                      variant={
                        inv.status === "overdue" ? "destructive" : "secondary"
                      }
                    >
                      {inv.status === "overdue" ? "En retard" : "Envoyée"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
