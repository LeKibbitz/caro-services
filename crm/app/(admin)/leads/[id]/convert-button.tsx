"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { convertLeadToContact } from "../actions";

export function ConvertButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!confirm("Convertir ce lead en contact client ?")) return;
        startTransition(() => convertLeadToContact(leadId));
      }}
    >
      <UserPlus className="h-4 w-4 mr-1.5" />
      {pending ? "Conversion..." : "Convertir"}
    </Button>
  );
}
