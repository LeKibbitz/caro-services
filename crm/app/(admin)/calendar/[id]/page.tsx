import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MapPin, CalendarDays, Pencil } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  consultation: "Consultation",
  suivi: "Suivi",
  admin: "Administratif",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Planifié",
  done: "Fait",
  cancelled: "Annulé",
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: { contact: true, supplier: true },
  });

  if (!appointment) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/calendar">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {appointment.title}
              </h1>
              <Badge
                variant={
                  appointment.status === "done"
                    ? "default"
                    : appointment.status === "cancelled"
                      ? "outline"
                      : "secondary"
                }
              >
                {STATUS_LABELS[appointment.status] ?? appointment.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {TYPE_LABELS[appointment.type] ?? appointment.type}
              {appointment.contact && (
                <>
                  {" · "}
                  <Link
                    href={`/contacts/${appointment.contact.id}`}
                    className="hover:text-primary"
                  >
                    {appointment.contact.firstName} {appointment.contact.lastName}
                  </Link>
                </>
              )}
              {appointment.supplier && (
                <>
                  {" · "}
                  {appointment.supplier.contactName ?? appointment.supplier.name}
                </>
              )}
            </p>
          </div>
        </div>
        <Link href={`/calendar/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Détails du rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="font-medium">
                {appointment.startAt.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-muted-foreground ml-2">
                {appointment.startAt.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" — "}
                {appointment.endAt.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {appointment.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{appointment.location}</span>
            </div>
          )}

          {appointment.description && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {appointment.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
