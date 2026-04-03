"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createLead } from "../actions";

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

export default function NewLeadPage() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => createLead(formData));
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau lead</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Saisie manuelle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                <Label htmlFor="salonName">Nom du commerce *</Label>
                <Input id="salonName" name="salonName" placeholder="Pharmacie du Centre, Boucherie Martin..." required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" name="address" placeholder="12 rue des Fleurs, Luxembourg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" name="phone" placeholder="+352 691 ..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="contact@example.lu" />
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
                <Input id="ownerName" name="ownerName" placeholder="Prénom Nom" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ownerTitle">Titre</Label>
                <Input id="ownerTitle" name="ownerTitle" placeholder="Gérante, Propriétaire..." />
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
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/leads")}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Création..." : "Créer le lead"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
