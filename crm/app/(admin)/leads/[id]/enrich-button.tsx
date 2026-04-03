"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
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
        setMsg(data.error.slice(0, 60));
      } else {
        setState("done");
        setMsg(data.owner_name ? `Trouvé : ${data.owner_name}` : "Aucun gérant trouvé");
        router.refresh();
      }
    } catch {
      setState("error");
      setMsg("Erreur réseau");
    }
    setTimeout(() => setState("idle"), 5000);
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleEnrich}
      disabled={state === "loading"}
      className={state === "error" ? "text-destructive border-destructive" : ""}
      title="Rechercher le gérant via Perplexity AI"
    >
      <Sparkles className={`h-4 w-4 mr-1.5 ${state === "loading" ? "animate-pulse" : ""}`} />
      {state === "loading"
        ? "Recherche..."
        : state === "done"
        ? msg
        : state === "error"
        ? msg
        : "Réenrichir"}
    </Button>
  );
}
