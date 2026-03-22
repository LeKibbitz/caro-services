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
import { createDossier } from "@/app/(admin)/dossiers/actions";

const TYPES = [
  { value: "tva_mensuelle", label: "TVA Mensuelle" },
  { value: "ir", label: "Impôts sur le revenu (IR)" },
  { value: "is", label: "Impôts des sociétés (IS)" },
  { value: "comptabilite", label: "Comptabilité" },
  { value: "ccss", label: "CCSS" },
  { value: "coordination", label: "Coordination FR-LU" },
];

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  ir: [
    "Certificat de rémunération",
    "Fiche de retenue d'impôt",
    "Attestation employeur",
    "Relevés bancaires",
    "Justificatifs de frais déductibles",
    "Attestation intérêts emprunt",
    "Assurance RC Pro / vie",
  ],
  tva_mensuelle: [
    "Factures émises du mois",
    "Factures fournisseurs",
    "Relevés bancaires",
    "Notes de frais",
  ],
  is: [
    "Bilan comptable",
    "Compte de résultat",
    "Relevés bancaires",
    "Factures fournisseurs",
    "Contrats en cours",
  ],
  comptabilite: [
    "Grand livre",
    "Balance",
    "Relevés bancaires",
    "Factures fournisseurs",
    "Factures clients",
  ],
};

interface DossierFormProps {
  contacts: { id: string; firstName: string; lastName: string; companyName: string | null }[];
}

export function DossierForm({ contacts }: DossierFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form
          action={async (formData: FormData) => {
            const type = formData.get("type") as string;
            const checklist = DEFAULT_CHECKLISTS[type]?.map((item) => ({
              label: item,
              done: false,
            }));
            if (checklist) {
              formData.set("checklist", JSON.stringify(checklist));
            }
            await createDossier(formData);
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select name="contactId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                      {c.companyName ? ` · ${c.companyName}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de dossier *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Type de service" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Année *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                required
                defaultValue={new Date().getFullYear()}
                min={2020}
                max={2030}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Période</Label>
              <Input
                id="period"
                name="period"
                placeholder="Janvier, T1, Annuel..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Informations sur le dossier..."
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Une checklist de documents sera automatiquement créée selon le type de
            dossier choisi.
          </p>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => history.back()}>
              Annuler
            </Button>
            <Button type="submit">Créer le dossier</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
