"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Undo2 } from "lucide-react";

export function AiImproveButton({
  getText,
  setText,
  channel,
  context,
}: {
  getText: () => string;
  setText: (v: string) => void;
  channel: string;
  context?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState<string | null>(null);

  async function handleImprove() {
    const text = getText();
    if (!text || text.trim().length < 10) return;
    setLoading(true);
    setOriginal(text);
    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, channel, context }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erreur IA");
        setOriginal(null);
        return;
      }
      const { improved } = await res.json();
      setText(improved);
    } catch {
      alert("Erreur de connexion");
      setOriginal(null);
    } finally {
      setLoading(false);
    }
  }

  function handleUndo() {
    if (original !== null) {
      setText(original);
      setOriginal(null);
    }
  }

  const text = getText();
  const disabled = loading || !text || text.trim().length < 10;

  return (
    <span className="inline-flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
        disabled={disabled}
        onClick={handleImprove}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        {loading ? "Amélioration…" : "Améliorer"}
      </Button>
      {original !== null && !loading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
          onClick={handleUndo}
        >
          <Undo2 className="h-3 w-3" />
          Annuler
        </Button>
      )}
    </span>
  );
}
