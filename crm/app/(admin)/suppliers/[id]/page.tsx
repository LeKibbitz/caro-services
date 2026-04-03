import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Globe, MapPin, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteSupplier } from "../actions";
import { SupplierForm } from "@/components/supplier-form";

export default async function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const supplier = await db.supplier.findUnique({
    where: { id },
    include: { appointments: { orderBy: { startAt: "desc" }, take: 5 } },
  });
  if (!supplier) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
          {supplier.role && <Badge variant="secondary" className="mt-1">{supplier.role}</Badge>}
        </div>
        <div className="flex gap-2">
          <Link href={`/suppliers/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5 mr-1.5" />Modifier</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {supplier.contactName && (
              <div className="text-muted-foreground">Contact : <span className="text-foreground font-medium">{supplier.contactName}</span></div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">{supplier.email}</a>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <a href={`tel:${supplier.phone}`} className="hover:underline">{supplier.phone}</a>
              </div>
            )}
            {supplier.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <a href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{supplier.website}</a>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {supplier.address}
              </div>
            )}
          </CardContent>
        </Card>

        {supplier.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-line">{supplier.notes}</CardContent>
          </Card>
        )}
      </div>

      {supplier.appointments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Derniers rendez-vous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {supplier.appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{a.title}</span>
                <span className="text-muted-foreground text-xs">{new Date(a.startAt).toLocaleDateString("fr-FR")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="border-t pt-4">
        <form action={deleteSupplier.bind(null, id)}>
          <Button variant="destructive" size="sm" type="submit" onClick={(e) => { if (!confirm("Supprimer ce fournisseur ?")) e.preventDefault(); }}>
            Supprimer
          </Button>
        </form>
      </div>
    </div>
  );
}
