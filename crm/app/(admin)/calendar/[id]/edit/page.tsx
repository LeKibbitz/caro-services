import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { updateAppointment } from "../../actions";

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditAppointmentPage({
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

  const action = updateAppointment.bind(null, id);

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href={`/calendar/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modifier le rendez-vous</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{appointment.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Informations du rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={appointment.title}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={appointment.type}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="consultation">Consultation</option>
                  <option value="suivi">Suivi</option>
                  <option value="admin">Administratif</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={appointment.status}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="scheduled">Planifié</option>
                  <option value="done">Fait</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startAt">Début *</Label>
                <Input
                  id="startAt"
                  name="startAt"
                  type="datetime-local"
                  required
                  defaultValue={toDatetimeLocal(appointment.startAt)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endAt">Fin *</Label>
                <Input
                  id="endAt"
                  name="endAt"
                  type="datetime-local"
                  required
                  defaultValue={toDatetimeLocal(appointment.endAt)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                name="location"
                defaultValue={appointment.location ?? ""}
                placeholder="Bureau, visio, téléphone..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={appointment.description ?? ""}
                placeholder="Notes pour le rendez-vous..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href={`/calendar/${id}`}>
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
