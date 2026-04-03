"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, FileText, Sparkles, Users, Euro } from "lucide-react";
import { createQuote } from "@/app/(admin)/quotes/actions";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const SERVICE_CATALOG = [
  {
    category: "Consultations",
    icon: "📞",
    services: [
      { description: "Appel découverte (15-30 min)", unitPrice: 0, badge: "Gratuit", detail: "Premier contact, évaluation de la situation" },
      { description: "Consultation conseil (1h)", unitPrice: 60, detail: "Conseil fiscal ou comptable personnalisé" },
      { description: "Assistance horaire (classement, appels, formulaires)", unitPrice: 30, detail: "Tarif horaire standard" },
    ],
  },
  {
    category: "Particuliers & Frontaliers",
    icon: "👤",
    services: [
      { description: "Déclaration d'impôts sur le revenu (IR)", unitPrice: 280, badge: "Populaire", detail: "Analyse, optimisation, déclaration complète" },
      { description: "Déclaration IR — situation complexe", unitPrice: 400, detail: "Multi-revenus, immobilier, international" },
      { description: "Pack frontalier — premier setup complet FR-LU", unitPrice: 350, detail: "Configuration initiale, CCSS, MyGuichet, coordination" },
      { description: "Vérification déductions fiscales", unitPrice: 120, detail: "Audit des déductions possibles" },
      { description: "Assistance administrative frontalier", unitPrice: 150, detail: "CCSS, MyGuichet, coordination FR-LU" },
    ],
  },
  {
    category: "TVA & Déclarations périodiques",
    icon: "📊",
    services: [
      { description: "Déclaration TVA mensuelle", unitPrice: 150, badge: "Récurrent", detail: "Préparation + dépôt MyGuichet" },
      { description: "Déclaration TVA trimestrielle", unitPrice: 200, detail: "Préparation + dépôt MyGuichet" },
      { description: "Déclaration TVA annuelle", unitPrice: 350, detail: "Récapitulatif + dépôt" },
    ],
  },
  {
    category: "Entreprises & Sociétés",
    icon: "🏢",
    services: [
      { description: "Pack Entreprise annuel", unitPrice: 1800, badge: "Meilleure offre", detail: "TVA + clôture + RCS + support illimité" },
      { description: "Déclaration société (IS/ICC/IF)", unitPrice: 400, detail: "Impôts des sociétés sous seuils" },
      { description: "Comptabilité annuelle", unitPrice: 1200, detail: "Tenue comptable + clôture" },
      { description: "Clôture annuelle + dépôt RCS", unitPrice: 800, detail: "Bilan + compte de résultat + dépôt" },
      { description: "Création SARL-S — accompagnement", unitPrice: 500, detail: "Statuts, immatriculation, setup" },
    ],
  },
  {
    category: "Social & Paie",
    icon: "👷",
    services: [
      { description: "Déclarations CCSS mensuelle", unitPrice: 200, detail: "Centre Commun Sécurité Sociale" },
      { description: "Bulletins de salaire (par salarié/mois)", unitPrice: 50, detail: "Établissement + envoi" },
      { description: "Coordination FR-LU", unitPrice: 350, detail: "Problématiques transfrontalières" },
    ],
  },
];

interface QuoteFormProps {
  contacts: { id: string; firstName: string; lastName: string; companyName: string | null }[];
}

export function QuoteForm({ contacts }: QuoteFormProps) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [contactId, setContactId] = useState("");
  const [showCatalog, setShowCatalog] = useState(true);

  function addItem(description: string = "", unitPrice: number = 0, quantity: number = 1) {
    setItems((prev) => [
      ...prev,
      { description, quantity, unitPrice, total: unitPrice * quantity },
    ]);
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      item.total = item.quantity * item.unitPrice;
      next[idx] = item;
      return next;
    });
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function addFromCatalog(description: string, unitPrice: number) {
    const existing = items.findIndex((i) => i.description === description);
    if (existing >= 0) {
      updateItem(existing, "quantity", items[existing].quantity + 1);
    } else {
      addItem(description, unitPrice);
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <form
      action={async (formData: FormData) => {
        formData.set("items", JSON.stringify(items));
        formData.set("taxRate", String(taxRate));
        await createQuote(formData);
      }}
    >
      <div className="space-y-6">
        {/* Client & date */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <input type="hidden" name="contactId" value={contactId} />
                <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => {
                      const label = `${c.firstName} ${c.lastName}${c.companyName ? ` · ${c.companyName}` : ""}`;
                      return (
                        <SelectItem key={c.id} value={c.id} label={label}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valable jusqu&apos;au</Label>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  defaultValue={
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service catalog */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Catalogue de services
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCatalog(!showCatalog)}
            >
              {showCatalog ? "Masquer" : "Afficher"}
            </Button>
          </CardHeader>
          {showCatalog && (
            <CardContent className="space-y-5">
              {SERVICE_CATALOG.map((cat) => (
                <div key={cat.category}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.services.map((svc) => {
                      const isAdded = items.some(
                        (i) => i.description === svc.description
                      );
                      return (
                        <button
                          key={svc.description}
                          type="button"
                          onClick={() =>
                            addFromCatalog(svc.description, svc.unitPrice)
                          }
                          className={`text-left p-3 rounded-lg border transition-all group ${
                            isAdded
                              ? "border-primary/50 bg-primary/5"
                              : "border-border hover:border-primary/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                                {svc.description}
                                {svc.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {svc.badge}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {svc.detail}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="font-mono font-bold text-sm">
                                {svc.unitPrice}€
                              </div>
                              {isAdded && (
                                <div className="text-[10px] text-primary font-medium">
                                  Ajouté
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Lignes du devis
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {items.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ligne libre
            </Button>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  Cliquez sur un service du catalogue ou ajoutez une ligne libre.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-1 text-center">Qté</div>
                  <div className="col-span-2 text-right">Prix unit.</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                <Separator />

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center group"
                  >
                    <div className="col-span-6">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                        placeholder="Description du service"
                        className="border-transparent bg-transparent hover:bg-muted/50 focus:bg-background focus:border-input transition-colors"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", Number(e.target.value))
                        }
                        className="text-center border-transparent bg-transparent hover:bg-muted/50 focus:bg-background focus:border-input transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(idx, "unitPrice", Number(e.target.value))
                        }
                        className="text-right font-mono border-transparent bg-transparent hover:bg-muted/50 focus:bg-background focus:border-input transition-colors"
                      />
                    </div>
                    <div className="col-span-2 text-right font-mono font-semibold text-sm">
                      {item.total.toFixed(2)}€
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <Separator className="mt-2" />
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-mono font-medium">
                      {subtotal.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">TVA</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-16 h-7 text-right text-xs font-mono"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                      <span className="font-mono text-sm w-20 text-right">
                        {taxAmount.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-base font-bold flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      Total
                    </span>
                    <span className="text-xl font-bold font-mono text-primary">
                      {total.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes & conditions</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Conditions particulières, délais, informations complémentaires..."
                defaultValue="Ce devis est valable 30 jours à compter de sa date d'émission. Les prestations sont réalisées à titre d'assistance et de support — elles excluent les activités réglementées d'expertise-comptable et de conseil fiscal."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {items.length > 0 && (
              <span>
                {items.length} ligne{items.length > 1 ? "s" : ""} ·{" "}
                <span className="font-mono font-semibold text-foreground">
                  {total.toFixed(2)}€
                </span>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => history.back()}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!contactId || items.length === 0}
              className="min-w-[160px]"
            >
              <FileText className="h-4 w-4 mr-2" />
              Créer le devis
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
