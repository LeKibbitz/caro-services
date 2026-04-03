"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Loader2 } from "lucide-react";
import { sendClientMagicLink } from "@/app/(admin)/contacts/[id]/send-magic-link-action";

export function SendMagicLinkButton({ contactId }: { contactId: string }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleClick() {
    startTransition(async () => {
      const result = await sendClientMagicLink(contactId);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      }
    });
  }

  if (error) {
    return (
      <Button variant="outline" size="sm" className="text-destructive" disabled>
        {error}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending || sent}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : sent ? (
        <Check className="h-4 w-4 mr-2 text-emerald-500" />
      ) : (
        <Link2 className="h-4 w-4 mr-2" />
      )}
      {sent ? "Lien envoyé !" : "Envoyer accès portail"}
    </Button>
  );
}
