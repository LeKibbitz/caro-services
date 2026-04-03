"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createSupplier } from "@/app/(admin)/suppliers/actions";

interface SupplierData {
  name: string;
  contactName: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
}

interface SupplierFormProps {
  supplier?: SupplierData;
  action?: (fd: FormData) => Promise<void>;
}

export function SupplierForm({ supplier, action }: SupplierFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action ?? createSupplier} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom / Entreprise *</Label>
              <Input id="name" name="name" required defaultValue={supplier?.name} placeholder="Le Kibbitz" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle / Type de service</Label>
              <Input id="role" name="role" defaultValue={supplier?.role ?? ""} placeholder="Développeur, Comptable..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Nom du contact</Label>
              <Input id="contactName" name="contactName" defaultValue={supplier?.contactName ?? ""} placeholder="Thomas Joannes" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={supplier?.email ?? ""} placeholder="contact@lekibbitz.fr" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} placeholder="+33 6 00 00 00 00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input id="website" name="website" defaultValue={supplier?.website ?? ""} placeholder="lekibbitz.fr" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" defaultValue={supplier?.address ?? ""} placeholder="Nancy, France" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={supplier?.notes ?? ""} rows={4} placeholder="Informations complémentaires..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => history.back()}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
