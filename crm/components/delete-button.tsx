"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  onDelete: () => Promise<{ error?: string } | void>;
  redirectTo: string;
  label?: string;
  confirmMessage?: string;
}

export function DeleteButton({
  onDelete,
  redirectTo,
  label = "Supprimer",
  confirmMessage = "Supprimer cette fiche ? Cette action est irréversible.",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await onDelete();
      if (result && "error" in result && result.error) {
        setError(result.error);
      } else {
        router.push(redirectTo);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        )}
        {label}
      </Button>
      {error && (
        <p className="text-xs text-destructive max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
