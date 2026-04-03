"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Mail, MessageCircle, Smartphone, X, Check, CreditCard } from "lucide-react";
import { createTemplate, updateTemplate, deleteTemplate } from "./actions";
import { CARD_VERSIONS } from "@/lib/cards";
import type { OutreachChannel } from "@/lib/generated/prisma/client";

type Template = {
  id: string;
  name: string;
  channel: OutreachChannel;
  subject: string | null;
  body: string;
  cardVersion: string | null;
};

const CHANNEL_CONFIG: Record<OutreachChannel, { label: string; icon: React.ReactNode; color: string }> = {
  email: { label: "Email", icon: <Mail className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-800" },
  whatsapp: { label: "WhatsApp", icon: <MessageCircle className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-800" },
  sms: { label: "SMS", icon: <Smartphone className="h-3.5 w-3.5" />, color: "bg-amber-100 text-amber-800" },
};

function CardPicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex items-center gap-1">
        <CreditCard className="h-3 w-3" /> Signature — carte de visite par défaut
      </Label>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-2 py-0.5 rounded text-xs border transition-colors ${
            !value ? "border-border bg-muted text-muted-foreground font-medium" : "border-transparent text-muted-foreground hover:border-border"
          }`}
        >
          Aucune
        </button>
        {CARD_VERSIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={`px-2 py-0.5 rounded text-xs border transition-colors ${
              value === c.id
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <input type="hidden" name="cardVersion" value={value ?? ""} />
    </div>
  );
}

function TemplateForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Template;
  onSave: (fd: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [channel, setChannel] = useState<OutreachChannel>(initial?.channel ?? "email");
  const [cardVersion, setCardVersion] = useState<string | null>(initial?.cardVersion ?? null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    await onSave(fd);
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nom du modèle</Label>
          <Input name="name" defaultValue={initial?.name} placeholder="Ex: Intro WhatsApp" required className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Canal</Label>
          <div className="flex gap-1.5">
            {(["email", "whatsapp", "sms"] as OutreachChannel[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-medium transition-colors ${
                  channel === c ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {CHANNEL_CONFIG[c].icon}
                {CHANNEL_CONFIG[c].label}
              </button>
            ))}
            <input type="hidden" name="channel" value={channel} />
          </div>
        </div>
      </div>
      {channel === "email" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Objet</Label>
          <Input name="subject" defaultValue={initial?.subject ?? ""} placeholder="Objet de l'email" className="text-sm" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs">Corps du message</Label>
        <Textarea
          name="body"
          defaultValue={initial?.body}
          placeholder={`Bonjour [Prénom],\n\nVotre message...`}
          rows={7}
          required
          className="text-sm resize-none font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Variables : <code>[Prénom]</code> · <code>[Nom]</code> · <code>[Salon]</code>
        </p>
      </div>
      <CardPicker value={cardVersion} onChange={setCardVersion} />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5 mr-1" /> Annuler
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          <Check className="h-3.5 w-3.5 mr-1" /> {pending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

export function TemplateList({ templates }: { templates: Template[] }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(fd: FormData) {
    await createTemplate(fd);
    setCreating(false);
  }

  async function handleUpdate(id: string, fd: FormData) {
    await updateTemplate(id, fd);
    setEditingId(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le modèle "${name}" ?`)) return;
    await deleteTemplate(id);
  }

  return (
    <div className="space-y-4">
      {templates.length === 0 && !creating && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            Aucun modèle. Créez-en un pour commencer.
          </CardContent>
        </Card>
      )}

      {(["whatsapp", "email", "sms"] as OutreachChannel[]).map((ch) => {
        const items = templates.filter((t) => t.channel === ch);
        if (!items.length) return null;
        const cfg = CHANNEL_CONFIG[ch];
        return (
          <div key={ch}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((t) => (
                <Card key={t.id}>
                  <CardContent className="py-3 px-4">
                    {editingId === t.id ? (
                      <TemplateForm
                        initial={t}
                        onSave={(fd) => handleUpdate(t.id, fd)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{t.name}</div>
                          {t.subject && (
                            <div className="text-xs text-muted-foreground mt-0.5">Objet : {t.subject}</div>
                          )}
                          {t.cardVersion && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {CARD_VERSIONS.find((c) => c.id === t.cardVersion)?.name ?? t.cardVersion}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 whitespace-pre-line">
                            {t.body}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(t.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(t.id, t.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {creating ? (
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm">Nouveau modèle</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <TemplateForm onSave={handleCreate} onCancel={() => setCreating(false)} />
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setCreating(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Nouveau modèle
        </Button>
      )}
    </div>
  );
}
