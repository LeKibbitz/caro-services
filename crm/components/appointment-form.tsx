"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAppointment } from "@/app/(admin)/calendar/actions";

interface AppointmentFormProps {
  contacts: { id: string; firstName: string; lastName: string }[];
}

export function AppointmentForm({ contacts }: AppointmentFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form action={createAppointment} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Consultation IR 2025"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select name="contactId">
                <SelectTrigger>
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id} label={`${c.firstName} ${c.lastName}`}>
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select name="type" defaultValue="consultation">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="suivi">Suivi</SelectItem>
                  <SelectItem value="admin">Administratif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Début *</Label>
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">Fin *</Label>
              <Input id="endAt" name="endAt" type="datetime-local" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              name="location"
              placeholder="Bureau, visio, téléphone..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Notes pour le rendez-vous..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => history.back()}>
              Annuler
            </Button>
            <Button type="submit">Créer le rendez-vous</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
