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
import { Plus, Trash2 } from "lucide-react";
import { createQuote } from "@/app/(admin)/quotes/actions";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const PRESETS = [
  { description: "Déclaration TVA mensuelle", unitPrice: 150 },
  { description: "Déclaration d'impôts sur le revenu (IR)", unitPrice: 280 },
  { description: "Déclaration société (IS)", unitPrice: 400 },
  { description: "Comptabilité annuelle", unitPrice: 1200 },
  { description: "Pack Entreprise annuel", unitPrice: 1800 },
  { description: "Déclarations CCSS", unitPrice: 200 },
  { description: "Coordination FR-LU", unitPrice: 350 },
];

interface QuoteFormProps {
  contacts: { id: string; firstName: string; lastName: string; companyName: string | null }[];
}

export function QuoteForm({ contacts }: QuoteFormProps) {
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [contactId, setContactId] = useState("");

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      item.total = item.quantity * item.unitPrice;
      next[idx] = item;
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function applyPreset(idx: number, presetIdx: number) {
    const preset = PRESETS[presetIdx];
    setItems((prev) => {
      const next = [...prev];
      next[idx] = {
        description: preset.description,
        quantity: 1,
        unitPrice: preset.unitPrice,
        total: preset.unitPrice,
      };
      return next;
    });
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informations</CardTitle>
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
                <Label htmlFor="validUntil">Valable jusqu'au</Label>
                <Input id="validUntil" name="validUntil" type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Lignes du devis</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  {idx === 0 && (
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                  )}
                  <div className="space-y-1">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(idx, "description", e.target.value)
                      }
                      placeholder="Description du service"
                    />
                    <Select
                      onValueChange={(v) => applyPreset(idx, Number(v))}
                    >
                      <SelectTrigger className="h-7 text-xs text-muted-foreground">
                        <SelectValue placeholder="Preset..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESETS.map((p, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {p.description} — {p.unitPrice}€
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  {idx === 0 && (
                    <Label className="text-xs text-muted-foreground">Qté</Label>
                  )}
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", Number(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  {idx === 0 && (
                    <Label className="text-xs text-muted-foreground">
                      Prix unit.
                    </Label>
                  )}
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(idx, "unitPrice", Number(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-2 text-right font-mono font-semibold text-sm pt-1">
                  {item.total.toFixed(2)}€
                </div>
                <div className="col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(idx)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-mono">{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-4">
                <span className="text-muted-foreground">TVA (%)</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-24 text-right"
                />
                <span className="font-mono w-24 text-right">
                  {taxAmount.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-2">
                <span>Total</span>
                <span className="font-mono">{total.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Conditions particulières, informations complémentaires..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={!contactId || items.length === 0}>
            Créer le devis
          </Button>
        </div>
      </div>
    </form>
  );
}
