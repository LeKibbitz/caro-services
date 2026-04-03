"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, FileText, Mail, MessageCircle, Smartphone, CreditCard, Settings } from "lucide-react";
import { createOutreach } from "../actions";
import { CARD_VERSIONS } from "@/lib/cards";
import type { OutreachChannel } from "@/lib/generated/prisma/client";

type Template = { id: string; name: string; channel: OutreachChannel; subject: string | null; body: string; cardVersion: string | null };
type ChannelConfig = { value: OutreachChannel; label: string; icon: React.ReactNode };

const CHANNELS: ChannelConfig[] = [
  { value: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
  { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { value: "sms", label: "SMS", icon: <Smartphone className="h-3.5 w-3.5" /> },
];

const CARD_NAMES = Object.fromEntries(CARD_VERSIONS.map((c) => [c.id, c.name]));

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
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data);
        const first = (data as Template[]).find((t) => t.channel === channel);
        if (first && !body) {
          setSubject(applyVariables(first.subject ?? "", salonName, ownerName));
          setBody(applyVariables(first.body, salonName, ownerName));
          if (first.cardVersion) setSelectedCard(first.cardVersion);
        }
      })
      .catch(() => {});
    try {
      const stored = localStorage.getItem("cardFavorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const channelTemplates = templates.filter((t) => t.channel === channel);

  function applyTemplate(t: Template) {
    setSubject(applyVariables(t.subject ?? "", salonName, ownerName));
    setBody(applyVariables(t.body, salonName, ownerName));
    setSelectedCard(t.cardVersion ?? null);
  }

  function handleChannelChange(newChannel: OutreachChannel) {
    setChannel(newChannel);
    const first = templates.find((t) => t.channel === newChannel);
    if (first) {
      setSubject(applyVariables(first.subject ?? "", salonName, ownerName));
      setBody(applyVariables(first.body, salonName, ownerName));
      setSelectedCard(first.cardVersion ?? null);
    } else {
      setSubject("");
      setBody("");
      setSelectedCard(null);
    }
  }

  function handleSubmit() {
    if (!body.trim()) return;
    const fd = new FormData();
    fd.set("leadId", leadId);
    fd.set("channel", channel);
    fd.set("subject", subject);
    fd.set("body", body);
    fd.set("sendNow", String(sendNow));
    if (selectedCard) fd.set("cardVersion", selectedCard);
    setError(null);
    startTransition(async () => {
      const result = await createOutreach(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
        setBody("");
        setSubject("");
        setSelectedCard(null);
        setTimeout(() => setSent(false), 3000);
      }
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

      {/* Business card picker = signature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Signature — carte de visite
          </p>
          <Link href="/business-cards" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            <Settings className="h-2.5 w-2.5" /> Gérer les favorites
          </Link>
        </div>
        {favorites.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            <Link href="/business-cards" className="text-primary hover:underline">Sélectionnez des cartes favorites</Link>{" "}
            pour les voir ici en accès rapide
          </p>
        ) : (
          <div className="flex items-end gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className={`px-2 py-1 rounded text-xs border transition-colors self-center ${
                !selectedCard
                  ? "border-border bg-muted text-muted-foreground"
                  : "border-transparent text-muted-foreground hover:border-border"
              }`}
            >
              Aucune
            </button>
            {favorites.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCard(id)}
                title={CARD_NAMES[id]}
                className={`relative rounded-md overflow-hidden border-2 transition-all ${
                  selectedCard === id
                    ? "border-primary shadow-md shadow-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img src={`/cards/${id}.png`} alt={CARD_NAMES[id]} className="h-16 w-auto block" />
                {selectedCard === id && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
                <div
                  className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[10px] font-medium ${
                    selectedCard === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-black/40 text-white"
                  }`}
                >
                  {CARD_NAMES[id]}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SMTP error */}
      {error && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {error}
        </div>
      )}

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
