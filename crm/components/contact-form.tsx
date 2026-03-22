"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createContact, updateContact } from "@/app/(admin)/contacts/actions";

interface ContactFormProps {
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    companyName: string | null;
    type: string;
    country: string | null;
    city: string | null;
    address: string | null;
    source: string | null;
    notes: string | null;
  };
}

export function ContactForm({ contact }: ContactFormProps) {
  const action = contact
    ? updateContact.bind(null, contact.id)
    : createContact;

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                defaultValue={contact?.firstName}
                placeholder="Caroline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                defaultValue={contact?.lastName}
                placeholder="Dupont"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email ?? ""}
                placeholder="caroline@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact?.phone ?? ""}
                placeholder="+352 691 123 456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Entreprise</Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={contact?.companyName ?? ""}
                placeholder="SARL-S Example"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Statut</Label>
              <Select name="type" defaultValue={contact?.type ?? "prospect"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="ancien">Ancien client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                name="country"
                defaultValue={contact?.country ?? "Luxembourg"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                defaultValue={contact?.city ?? ""}
                placeholder="Luxembourg-Ville"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                name="source"
                defaultValue={contact?.source ?? ""}
                placeholder="Site web, recommandation..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              defaultValue={contact?.address ?? ""}
              placeholder="12 rue de la Gare"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={contact?.notes ?? ""}
              placeholder="Informations complémentaires..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => history.back()}>
              Annuler
            </Button>
            <Button type="submit">
              {contact ? "Enregistrer" : "Créer le contact"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
