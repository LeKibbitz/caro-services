"use client";

import { useState } from "react";
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

type AttendeeType = "client" | "supplier" | "personal";

interface AppointmentFormProps {
  contacts: { id: string; firstName: string; lastName: string }[];
  suppliers: { id: string; name: string; contactName: string | null }[];
}

export function AppointmentForm({ contacts, suppliers }: AppointmentFormProps) {
  const [attendeeType, setAttendeeType] = useState<AttendeeType>("client");

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={createAppointment} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input id="title" name="title" required placeholder="Consultation IR 2025" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Attendee type selector */}
            <div className="space-y-2">
              <Label>Type de participant</Label>
              <div className="flex gap-1">
                {(["client", "supplier", "personal"] as AttendeeType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAttendeeType(t)}
                    className={`flex-1 px-2 py-1.5 rounded border text-xs font-medium transition-colors ${
                      attendeeType === t
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {t === "client" ? "Client" : t === "supplier" ? "Fournisseur" : "Personnel"}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic participant dropdown */}
            <div className="space-y-2">
              {attendeeType === "client" && (
                <>
                  <Label>Client</Label>
                  <Select name="contactId">
                    <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                    <SelectContent>
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              {attendeeType === "supplier" && (
                <>
                  <Label>Fournisseur</Label>
                  <Select name="supplierId">
                    <SelectTrigger><SelectValue placeholder="Choisir un fournisseur" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}{s.contactName ? ` — ${s.contactName}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              {attendeeType === "personal" && (
                <div className="flex items-end h-full pb-1">
                  <p className="text-xs text-muted-foreground">Rendez-vous personnel, sans participant lié.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select name="type" defaultValue="consultation">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="suivi">Suivi</SelectItem>
                  <SelectItem value="admin">Administratif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input id="location" name="location" placeholder="Bureau, visio, téléphone..." />
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
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} placeholder="Notes pour le rendez-vous..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => history.back()}>Annuler</Button>
            <Button type="submit">Créer le rendez-vous</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
