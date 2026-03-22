import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Receipt } from "lucide-react";

export default async function PortalDashboard() {
  const user = await getSession();
  if (!user) return null;

  const db = getDb();

  const contact = await db.contact.findUnique({
    where: { userId: user.id },
  });

  if (!contact) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-2xl font-bold">Bienvenue {user.name}</h1>
        <p className="text-muted-foreground">
          Votre espace client est en cours de configuration. Caroline vous
          contactera sous 24h.
        </p>
      </div>
    );
  }

  const [dossiers, invoices] = await Promise.all([
    db.dossier.findMany({
      where: { contactId: contact.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.invoice.findMany({
      where: { contactId: contact.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bonjour {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace client Caroline Finance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              Mes dossiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dossiers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun dossier en cours.
              </p>
            ) : (
              <div className="space-y-3">
                {dossiers.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {d.type.replace("_", " ").toUpperCase()} — {d.year}
                    </span>
                    <Badge
                      variant={d.status === "done" ? "default" : "secondary"}
                    >
                      {d.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Mes factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune facture pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {inv.number}
                      </span>
                      <span>{Number(inv.total).toFixed(2)}€</span>
                    </div>
                    <Badge
                      variant={
                        inv.status === "paid"
                          ? "default"
                          : inv.status === "overdue"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {inv.status === "paid"
                        ? "Payée"
                        : inv.status === "overdue"
                          ? "En retard"
                          : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
