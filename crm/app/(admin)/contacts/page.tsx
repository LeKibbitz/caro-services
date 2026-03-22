import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const db = getDb();

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
    ];
  }

  if (type && type !== "all") {
    where.type = type;
  }

  const contacts = await db.contact.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { dossiers: true, invoices: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/contacts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau contact
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <form className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Rechercher..."
                defaultValue={q}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {["all", "prospect", "client", "ancien"].map((t) => (
                <Link
                  key={t}
                  href={`/contacts${t !== "all" ? `?type=${t}` : ""}${q ? `&q=${q}` : ""}`}
                >
                  <Badge
                    variant={
                      (type || "all") === t ? "default" : "secondary"
                    }
                    className="cursor-pointer"
                  >
                    {t === "all" ? "Tous" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </Badge>
                </Link>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Contact list */}
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Aucun contact trouvé.</p>
            <Link href="/contacts/new" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier contact
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Entreprise</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Téléphone</th>
                  <th className="px-4 py-3 font-medium text-center">Dossiers</th>
                  <th className="px-4 py-3 font-medium text-center">Factures</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {c.companyName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {c.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {c._count.dossiers}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {c._count.invoices}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          c.type === "client"
                            ? "default"
                            : c.type === "prospect"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {c.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
