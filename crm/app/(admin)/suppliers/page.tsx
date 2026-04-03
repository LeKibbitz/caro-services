import { getDb } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Globe, User } from "lucide-react";
import Link from "next/link";

export default async function SuppliersPage() {
  const db = getDb();
  const suppliers = await db.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground mt-1">{suppliers.length} fournisseur{suppliers.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/suppliers/new">
          <Button><Plus className="h-4 w-4 mr-2" />Nouveau fournisseur</Button>
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            Aucun fournisseur. Créez-en un pour commencer.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <Link key={s.id} href={`/suppliers/${s.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm leading-tight">{s.name}</div>
                    {s.role && <Badge variant="secondary" className="text-xs shrink-0">{s.role}</Badge>}
                  </div>
                  {s.contactName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <User className="h-3 w-3" /> {s.contactName}
                    </div>
                  )}
                  <div className="space-y-1 mt-3">
                    {s.email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {s.email}
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {s.phone}
                      </div>
                    )}
                    {s.website && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" /> {s.website}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
