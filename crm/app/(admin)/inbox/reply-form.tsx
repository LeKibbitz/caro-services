"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, X } from "lucide-react";
import { AiImproveButton } from "@/components/ai-improve-button";
import { useRouter } from "next/navigation";

type Props = {
  defaultTo?: string;
  defaultChannel?: "whatsapp" | "email";
  defaultMessage?: string;
  defaultSubject?: string;
  originalSubject?: string;
  originalBody?: string;
  onClose: () => void;
};

export function ReplyForm({ defaultTo = "", defaultChannel = "whatsapp", defaultMessage = "", defaultSubject, originalSubject, originalBody, onClose }: Props) {
  const router = useRouter();
  const [channel, setChannel] = useState<"whatsapp" | "email">(defaultChannel);
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject ?? (originalSubject ? `Re: ${originalSubject}` : ""));
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!to.trim() || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, to: to.trim(), message: message.trim(), subject: subject.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur d'envoi");
        return;
      }
      onClose();
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nouveau message</span>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Canal</Label>
          <Select value={channel} onValueChange={(v) => setChannel(v as "whatsapp" | "email")}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">
            {channel === "whatsapp" ? "Numéro (+352...)" : "Email destinataire"}
          </Label>
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={channel === "whatsapp" ? "+352661521101" : "contact@example.com"}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {channel === "email" && (
        <div className="space-y-1">
          <Label className="text-xs">Objet</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet du message"
            className="h-8 text-sm"
          />
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Message</Label>
          <AiImproveButton getText={() => message} setText={setMessage} channel={channel} context={originalBody} />
        </div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message..."
          rows={4}
          className="text-sm resize-none"
        />
      </div>

      {originalBody && (
        <div className="border-l-2 border-muted pl-3 text-xs text-muted-foreground max-h-28 overflow-y-auto">
          <p className="font-medium mb-1">Message original :</p>
          <p className="whitespace-pre-wrap">{originalBody}</p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sending || !to.trim() || !message.trim()}
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {sending ? "Envoi…" : "Envoyer"}
        </Button>
      </div>
    </div>
  );
}
