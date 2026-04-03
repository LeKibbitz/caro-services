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
import { updateLeadStatus } from "../actions";
import type { LeadStatus } from "@/lib/generated/prisma/client";

const STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "replied", label: "Répondu" },
  { value: "qualified", label: "Qualifié" },
  { value: "lost", label: "Perdu" },
  { value: "converted", label: "Converti" },
];

const STATUS_VARIANT: Record<
  LeadStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "secondary",
  contacted: "default",
  replied: "default",
  qualified: "default",
  lost: "destructive",
  converted: "outline",
};

export function LeadStatusSelect({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [, startTransition] = useTransition();

  function handleChange(next: LeadStatus) {
    if (next === status) return;
    setStatus(next);
    startTransition(() => updateLeadStatus(leadId, next));
  }

  const label = STATUSES.find((s) => s.value === status)?.label ?? status;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 outline-none bg-transparent border-none p-0 cursor-pointer">
        <Badge variant={STATUS_VARIANT[status]}>{label}</Badge>
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
