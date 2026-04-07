"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function EnrichButton({ leadId }: { leadId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleEnrich() {
    setState("loading");
    try {
      const res = await fetch(`/api/leads/${leadId}/enrich`, { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setState("error");
        setMsg(data.error.slice(0, 80));
      } else {
        setState("done");
        setMsg(data.owner_name ? `Trouvé : ${data.owner_name}` : "Aucun gérant trouvé");
        router.refresh();
        setTimeout(() => setState("idle"), 5000);
      }
    } catch {
      setState("error");
      setMsg("Erreur réseau");
    }
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-destructive max-w-[200px] truncate" title={msg}>
          {msg}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleEnrich}
          className="text-destructive border-destructive hover:bg-destructive/10"
          title="Réessayer l'enrichissement"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleEnrich}
      disabled={state === "loading"}
      title="Rechercher le gérant via Perplexity AI"
    >
      <Sparkles className={`h-4 w-4 mr-1.5 ${state === "loading" ? "animate-pulse" : ""}`} />
      {state === "loading"
        ? "Recherche..."
        : state === "done"
        ? msg
        : "Réenrichir"}
    </Button>
  );
}
