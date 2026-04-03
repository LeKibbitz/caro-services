"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, FileText, Mail, MessageCircle, Smartphone, CreditCard, ExternalLink } from "lucide-react";
import { createOutreach } from "../actions";
import type { OutreachChannel } from "@/lib/generated/prisma/client";

type Template = { id: string; name: string; channel: OutreachChannel; subject: string | null; body: string };
type ChannelConfig = { value: OutreachChannel; label: string; icon: React.ReactNode };

const CHANNELS: ChannelConfig[] = [
  { value: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
  { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { value: "sms", label: "SMS", icon: <Smartphone className="h-3.5 w-3.5" /> },
];

const CARD_VERSIONS = [
  { id: "v1", name: "V1 Signature" },
  { id: "v2", name: "V2 Bande latérale" },
  { id: "v3", name: "V3 Dark élégante" },
  { id: "v4", name: "V4 Bicolore" },
  { id: "v5", name: "V5 Orange bold" },
  { id: "v6", name: "V6 Géométrique" },
  { id: "v7", name: "V7 Ligne fine" },
  { id: "v8", name: "V8 Shadow" },
  { id: "v9", name: "V9 Gradient" },
  { id: "v10", name: "V10 Typo" },
  { id: "v11", name: "V11 Arrondi XL" },
  { id: "v12", name: "V12 Dégradé orange" },
  { id: "v13", name: "V13 Sombre orange" },
  { id: "v14", name: "V14 Bordure" },
  { id: "v15", name: "V15 Texturée" },
  { id: "v16", name: "V16 Diagonal" },
  { id: "v17", name: "V17 Initiales" },
  { id: "v18", name: "V18 Carré central" },
  { id: "v19", name: "V19 Compact" },
  { id: "v20", name: "V20 Premium noir" },
];

function applyVariables(text: string, salonName: string, ownerName: string | null) {
  const firstName = ownerName ? ownerName.split(" ")[0] : "";
  return text
    .replace(/\[Prénom\]/g, firstName)
    .replace(/\[Nom\]/g, ownerName ?? "")
    .replace(/\[Salon\]/g, salonName);
}

export function OutreachForm({
  leadId,
  salonName,
  ownerName,
  hasEmail,
  hasPhone,
}: {
  leadId: string;
  salonName: string;
  ownerName: string | null;
  hasEmail: boolean;
  hasPhone: boolean;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data);
        const first = (data as Template[]).find((t) => t.channel === channel);
        if (first && !body) {
          setSubject(applyVariables(first.subject ?? "", salonName, ownerName));
          setBody(applyVariables(first.body, salonName, ownerName));
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const channelTemplates = templates.filter((t) => t.channel === channel);

  function applyTemplate(t: Template) {
    setSubject(applyVariables(t.subject ?? "", salonName, ownerName));
    setBody(applyVariables(t.body, salonName, ownerName));
  }

  function handleChannelChange(newChannel: OutreachChannel) {
    setChannel(newChannel);
    setSelectedCard(null);
    const first = templates.find((t) => t.channel === newChannel);
    if (first) {
      setSubject(applyVariables(first.subject ?? "", salonName, ownerName));
      setBody(applyVariables(first.body, salonName, ownerName));
    } else {
      setSubject("");
      setBody("");
    }
  }

  function handleSubmit() {
    if (!body.trim()) return;
    const fd = new FormData();
    fd.set("leadId", leadId);
    fd.set("channel", channel);
    fd.set("subject", subject);
    const finalBody = selectedCard
      ? body + `\n\n📎 Carte de visite jointe — ${CARD_VERSIONS.find((c) => c.id === selectedCard)?.name}`
      : body;
    fd.set("body", finalBody);
    fd.set("sendNow", String(sendNow));
    startTransition(async () => {
      await createOutreach(fd);
      setSent(true);
      setBody("");
      setSubject("");
      setSelectedCard(null);
      setTimeout(() => setSent(false), 3000);
    });
  }

  const canSendNow = channel === "whatsapp" || channel === "sms" ? hasPhone : hasEmail;

  return (
    <div className="space-y-4">
      {/* Channel selector */}
      <div className="flex gap-2">
        {CHANNELS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => handleChannelChange(c.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors ${
              channel === c.value
                ? "border-primary bg-primary/5 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>

      {/* Templates from DB */}
      {channelTemplates.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Modèles
          </p>
          <div className="flex flex-wrap gap-1.5">
            {channelTemplates.map((t) => (
              <Badge
                key={t.id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => applyTemplate(t)}
              >
                {t.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Subject (email only) */}
      {channel === "email" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Objet</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet de l'email"
            className="text-sm"
          />
        </div>
      )}

      {/* Body */}
      <div className="space-y-1.5">
        <Label className="text-xs">Message</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Rédigez votre message..."
          rows={6}
          className="text-sm resize-none"
        />
      </div>

      {/* Business card picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Carte de visite à joindre
          </p>
          <a
            href="/cartes-de-visite.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            Voir toutes <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCard(null)}
            className={`px-2.5 py-1 rounded text-xs border transition-colors ${
              !selectedCard
                ? "border-border bg-muted text-muted-foreground"
                : "border-transparent text-muted-foreground hover:border-border"
            }`}
          >
            Aucune
          </button>
          {CARD_VERSIONS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCard(card.id)}
              className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                selectedCard === card.id
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              {card.name}
            </button>
          ))}
        </div>
        {selectedCard && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
            Pensez à joindre manuellement la capture d'écran de la carte{" "}
            <span className="font-medium">{CARD_VERSIONS.find((c) => c.id === selectedCard)?.name}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={sendNow}
            onChange={(e) => setSendNow(e.target.checked)}
            className="rounded"
          />
          Envoyer maintenant
          {sendNow && !canSendNow && (
            <span className="text-xs text-amber-600 ml-1">
              (aucun {channel === "email" ? "email" : "téléphone"} enregistré)
            </span>
          )}
        </label>
        <Button
          onClick={handleSubmit}
          disabled={pending || !body.trim() || (sendNow && !canSendNow)}
          size="sm"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {pending ? "Envoi..." : sent ? "Envoyé !" : sendNow ? "Envoyer" : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}
