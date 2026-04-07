"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Check, X, RotateCcw } from "lucide-react";
import { addService, updateService, deleteService, resetToDefault } from "./actions";
import type { ServiceItem } from "@/lib/services-types";

interface Props {
  catalog: ServiceItem[];
  grouped: { category: string; items: ServiceItem[] }[];
}

const CATEGORIES = [
  "Consultations",
  "Particuliers & Frontaliers",
  "TVA & Déclarations périodiques",
  "Entreprises & Sociétés",
  "Social & Paie",
];

function ServiceRow({
  item,
  onDeleted,
}: {
  item: ServiceItem;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <form
        action={async (fd) => {
          fd.set("id", item.id);
          await updateService(fd);
          setEditing(false);
        }}
        className="border rounded-lg p-3 bg-muted/30 space-y-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Catégorie</Label>
            <Input name="category" defaultValue={item.category} list="categories" required className="text-sm" />
            <datalist id="categories">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Prix unitaire (€)</Label>
            <Input name="unitPrice" type="number" min={0} step={0.01} defaultValue={item.unitPrice} required className="text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description *</Label>
          <Input name="description" defaultValue={item.description} required className="text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Badge (ex: Populaire)</Label>
            <Input name="badge" defaultValue={item.badge ?? ""} className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Détail</Label>
            <Input name="detail" defaultValue={item.detail ?? ""} className="text-sm" />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5 mr-1" />Annuler
          </Button>
          <Button type="submit" size="sm">
            <Check className="h-3.5 w-3.5 mr-1" />Enregistrer
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors group">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{item.description}</span>
          {item.badge && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>}
        </div>
        {item.detail && <p className="text-xs text-muted-foreground truncate">{item.detail}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-sm font-semibold">{item.unitPrice}€</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Supprimer "${item.description}" ?`)) return;
              startTransition(async () => {
                await deleteService(item.id);
                onDeleted();
              });
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddServiceForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />
        Ajouter un service
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await addService(fd);
        setOpen(false);
        onAdded();
      }}
      className="border rounded-lg p-4 space-y-3 bg-muted/20"
    >
      <p className="text-sm font-medium">Nouveau service</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Catégorie *</Label>
          <Input name="category" list="categories-add" placeholder="Consultations" required className="text-sm" />
          <datalist id="categories-add">
            {CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Prix unitaire (€) *</Label>
          <Input name="unitPrice" type="number" min={0} step={0.01} defaultValue={0} required className="text-sm" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Description *</Label>
        <Input name="description" placeholder="Déclaration IR" required className="text-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Badge (optionnel)</Label>
          <Input name="badge" placeholder="Populaire, Nouveau…" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Détail (optionnel)</Label>
          <Input name="detail" placeholder="Description courte" className="text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
        <Button type="submit" size="sm"><Plus className="h-3.5 w-3.5 mr-1" />Ajouter</Button>
      </div>
    </form>
  );
}

export function ServiceCatalogEditor({ grouped }: Props) {
  const [, startTransition] = useTransition();
  const [key, setKey] = useState(0); // force re-render after mutations

  function refresh() { setKey((k) => k + 1); }

  return (
    <div className="space-y-6" key={key}>
      {grouped.map(({ category, items }) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              {category}
              <span className="text-xs font-normal text-muted-foreground">{items.length} service{items.length !== 1 ? "s" : ""}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {items.map((item) => (
              <ServiceRow key={item.id} item={item} onDeleted={refresh} />
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between gap-4">
        <AddServiceForm onAdded={refresh} />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground text-xs"
          onClick={() => {
            if (!confirm("Réinitialiser le catalogue aux valeurs par défaut ? Vos modifications seront perdues.")) return;
            startTransition(() => resetToDefault());
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
