"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { updateOutreachStatus } from "../actions";
import type { OutreachStatus } from "@/lib/generated/prisma/client";

const STATUSES: Array<{ value: OutreachStatus; label: string }> = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyé" },
  { value: "replied", label: "Répondu" },
  { value: "bounced", label: "Échec" },
];

const STATUS_VARIANT: Record<
  OutreachStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  sent: "default",
  replied: "default",
  bounced: "destructive",
};

export function OutreachStatusSelect({
  outreachId,
  currentStatus,
}: {
  outreachId: string;
  currentStatus: OutreachStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [, startTransition] = useTransition();

  function handleChange(next: OutreachStatus) {
    if (next === status) return;
    setStatus(next);
    startTransition(() => updateOutreachStatus(outreachId, next));
  }

  const label = STATUSES.find((s) => s.value === status)?.label ?? status;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 outline-none bg-transparent border-none p-0 cursor-pointer">
        <Badge
          variant={STATUS_VARIANT[status]}
          className={status === "replied" ? "bg-emerald-600" : ""}
        >
          {label}
        </Badge>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUSES.map((s) => (
          <DropdownMenuItem
            key={s.value}
            onSelect={() => handleChange(s.value)}
            className={s.value === status ? "font-medium" : ""}
          >
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
