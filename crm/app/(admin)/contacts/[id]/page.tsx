import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  Pencil,
  FolderOpen,
  Receipt,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const contact = await db.contact.findUnique({
    where: { id },
    include: {
      dossiers: { orderBy: { updatedAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: { startAt: "desc" }, take: 5 },
      messages: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!contact) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {contact.firstName} {contact.lastName}
            </h1>
            <Badge
              variant={
                contact.type === "client"
                  ? "default"
                  : contact.type === "prospect"
                    ? "secondary"
                    : "outline"
              }
            >
              {contact.type}
            </Badge>
          </div>
          {contact.companyName && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {contact.companyName}
            </p>
          )}
        </div>
        <Link href={`/contacts/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Contact info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono">{contact.phone}</span>
                </div>
              )}
              {(contact.address || contact.city || contact.country) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <span>
                    {[contact.address, contact.city, contact.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {contact.source && (
                <>
                  <Separator />
                  <div className="text-muted-foreground">
                    Source : {contact.source}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {contact.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Dossiers, Invoices, Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossiers */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                Dossiers ({contact.dossiers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.dossiers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun dossier.
                </p>
              ) : (
                <div className="space-y-2">
                  {contact.dossiers.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between text-sm py-1.5"
                    >
                      <div>
                        <span className="font-medium">
                          {d.type.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {d.year}
                          {d.period ? ` · ${d.period}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.deadline && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(d.deadline).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        <Badge variant="secondary">
                          {d.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Factures ({contact.invoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune facture.
                </p>
              ) : (
                <div className="space-y-2">
                  {contact.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between text-sm py-1.5"
                    >
                      <div>
                        <span className="font-mono text-xs text-muted-foreground mr-2">
                          {inv.number}
                        </span>
                        <span>
                          {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">
                          {Number(inv.total).toFixed(2)}€
                        </span>
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
                              : inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent messages */}
          {contact.messages.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Messages récents ({contact.messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contact.messages.map((m) => (
                    <div key={m.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-xs">
                          {m.channel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {m.subject ? `${m.subject} — ` : ""}
                        {m.body}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
