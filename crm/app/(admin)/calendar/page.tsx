import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, MapPin, CalendarPlus } from "lucide-react";
import Link from "next/link";

function gcalUrl(apt: {
  title: string;
  startAt: Date;
  endAt: Date;
  location?: string | null;
  description?: string | null;
}) {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: apt.title,
    dates: `${fmt(apt.startAt)}/${fmt(apt.endAt)}`,
    ...(apt.location ? { location: apt.location } : {}),
    ...(apt.description ? { details: apt.description } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const TYPE_COLORS: Record<string, string> = {
  consultation: "bg-primary/10 text-primary",
  suivi: "bg-accent/10 text-accent-foreground",
  admin: "bg-muted text-muted-foreground",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const db = getDb();

  const now = new Date();
  const targetMonth = month ? new Date(month + "-01") : now;
  const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

  const appointments = await db.appointment.findMany({
    where: {
      startAt: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { contact: true, supplier: true },
    orderBy: { startAt: "asc" },
  });

  // Upcoming (next 7 days)
  const upcoming = await db.appointment.findMany({
    where: {
      startAt: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: "scheduled",
    },
    include: { contact: true, supplier: true },
    orderBy: { startAt: "asc" },
  });

  // Group by day
  const grouped: Record<string, typeof appointments> = {};
  for (const apt of appointments) {
    const day = apt.startAt.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(apt);
  }

  const monthLabel = targetMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
  const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            {appointments.length} rendez-vous ce mois
          </p>
        </div>
        <Link href="/calendar/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau RDV
          </Button>
        </Link>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4">
        <Link href={`/calendar?month=${fmt(prevMonth)}`}>
          <Button variant="outline" size="sm">← Précédent</Button>
        </Link>
        <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
        <Link href={`/calendar?month=${fmt(nextMonth)}`}>
          <Button variant="outline" size="sm">Suivant →</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar list */}
        <div className="lg:col-span-2 space-y-4">
          {Object.keys(grouped).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucun rendez-vous ce mois.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(grouped).map(([day, apts]) => (
              <div key={day}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                  {day}
                </h3>
                <div className="space-y-2">
                  {apts.map((apt) => (
                    <Card key={apt.id} className="hover:bg-muted/30 transition-colors">
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${TYPE_COLORS[apt.type] ?? TYPE_COLORS.admin}`}
                          >
                            {apt.type}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{apt.title}</div>
                            {apt.contact && (
                              <span className="text-xs text-muted-foreground">
                                {apt.contact.firstName} {apt.contact.lastName}
                              </span>
                            )}
                          {apt.supplier && (
                              <span className="text-xs text-muted-foreground">
                                {apt.supplier.contactName ?? apt.supplier.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {apt.startAt.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" — "}
                            {apt.endAt.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {apt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {apt.location}
                            </span>
                          )}
                          <Badge
                            variant={
                              apt.status === "done"
                                ? "default"
                                : apt.status === "cancelled"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {apt.status === "scheduled"
                              ? "Planifié"
                              : apt.status === "done"
                                ? "Fait"
                                : "Annulé"}
                          </Badge>
                          <a
                            href={gcalUrl(apt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ajouter à Google Calendar"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar: upcoming */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">7 prochains jours</CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Rien de prévu.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((apt) => (
                    <div key={apt.id} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{apt.title}</span>
                        <a
                          href={gcalUrl(apt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ajouter à Google Calendar"
                          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {apt.startAt.toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        à{" "}
                        {apt.startAt.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {apt.contact && (
                        <div className="text-xs text-muted-foreground">
                          {apt.contact.firstName} {apt.contact.lastName}
                        </div>
                      )}
                      {apt.supplier && (
                        <div className="text-xs text-muted-foreground">
                          {apt.supplier.contactName ?? apt.supplier.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
