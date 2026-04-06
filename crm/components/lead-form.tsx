"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLead, updateLead } from "@/app/(admin)/leads/actions";

const ACTIVITY_SUGGESTIONS = [
  "Salon de coiffure",
  "Institut de beauté",
  "Salon de beauté",
  "Onglerie",
  "Spa & bien-être",
  "Pharmacie",
  "Boucherie",
  "Charcuterie",
  "Boulangerie",
  "Pâtisserie",
  "Épicerie",
  "Restaurant",
  "Café / Bar",
  "Cabinet médical",
  "Cabinet dentaire",
  "Cabinet comptable",
  "Cabinet juridique",
  "Agence immobilière",
  "Fleuriste",
  "Pressing / Laverie",
];

interface LeadFormProps {
  lead?: {
    id: string;
    displayName: string;
    activityType: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    ownerName: string | null;
    ownerTitle: string | null;
    notes: string | null;
  };
}

export function LeadForm({ lead }: LeadFormProps) {
  const action = lead
    ? updateLead.bind(null, lead.id)
    : createLead;

  return (
    <form action={action}>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Commerce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="activityType">Type d&apos;activité</Label>
              <Input
                id="activityType"
                name="activityType"
                defaultValue={lead?.activityType ?? ""}
                placeholder="Pharmacie, Boucherie, Salon de coiffure..."
                list="activity-suggestions"
                autoComplete="off"
              />
              <datalist id="activity-suggestions">
                {ACTIVITY_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Nom du commerce *</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={lead?.displayName ?? ""}
                placeholder="Pharmacie du Centre, Boucherie Martin..."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                defaultValue={lead?.address ?? ""}
                placeholder="12 rue des Fleurs, Luxembourg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={lead?.phone ?? ""}
                placeholder="+352 691 ..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={lead?.email ?? ""}
                placeholder="contact@example.lu"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gérant / Propriétaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName">Nom</Label>
              <Input
                id="ownerName"
                name="ownerName"
                defaultValue={lead?.ownerName ?? ""}
                placeholder="Prénom Nom"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerTitle">Titre</Label>
              <Input
                id="ownerTitle"
                name="ownerTitle"
                defaultValue={lead?.ownerTitle ?? ""}
                placeholder="Gérante, Propriétaire..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={lead?.notes ?? ""}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Annuler
          </Button>
          <Button type="submit">
            {lead ? "Enregistrer" : "Créer le lead"}
          </Button>
        </div>
      </div>
    </form>
  );
}
