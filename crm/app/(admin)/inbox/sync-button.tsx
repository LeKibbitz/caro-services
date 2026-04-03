"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleSync() {
    setState("loading");
    try {
      const res = await fetch("/api/inbox/sync-email");
      const data = await res.json();
      if (data.error) {
        setState("error");
        setMsg(data.error);
      } else {
        setState("done");
        setMsg(`${data.synced} nouveau${data.synced !== 1 ? "x" : ""}`);
        router.refresh();
      }
    } catch {
      setState("error");
      setMsg("Erreur réseau");
    }
    setTimeout(() => setState("idle"), 4000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={state === "loading"}
      className={state === "error" ? "text-destructive border-destructive" : ""}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${state === "loading" ? "animate-spin" : ""}`} />
      {state === "loading"
        ? "Sync..."
        : state === "done"
        ? `Sync — ${msg}`
        : state === "error"
        ? msg
        : "Sync email"}
    </Button>
  );
}
