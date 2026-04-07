"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X, Tag } from "lucide-react";
import { createLabel, toggleLeadLabel } from "@/app/(admin)/leads/actions";

type Label = { id: string; name: string; color: string };

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

export function LeadLabels({
  leadId,
  activeLabels,
  allLabels,
}: {
  leadId: string;
  activeLabels: Label[];
  allLabels: Label[];
}) {
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [open, setOpen] = useState(false);

  function handleToggle(labelId: string) {
    startTransition(() => toggleLeadLabel(leadId, labelId));
  }

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const label = await createLabel(newName.trim(), newColor);
      await toggleLeadLabel(leadId, label.id);
      setNewName("");
    });
  }

  const activeIds = new Set(activeLabels.map((l) => l.id));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {activeLabels.map((label) => (
        <Badge
          key={label.id}
          variant="outline"
          className="gap-1 pr-1"
          style={{ borderColor: label.color, color: label.color }}
        >
          {label.name}
          <button
            onClick={() => handleToggle(label.id)}
            className="ml-0.5 hover:opacity-70"
            disabled={isPending}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="inline-flex items-center gap-0.5 h-6 px-1.5 text-muted-foreground rounded-md hover:bg-muted transition-colors text-sm">
          <Tag className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-2">
            {allLabels.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allLabels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleToggle(label.id)}
                    disabled={isPending}
                    className="flex items-center gap-2 w-full text-left text-sm px-2 py-1 rounded hover:bg-muted transition-colors"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate">{label.name}</span>
                    {activeIds.has(label.id) && (
                      <span className="ml-auto text-xs text-muted-foreground">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="border-t pt-2 space-y-1.5">
              <Input
                placeholder="Nouveau label..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-7 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className="h-5 w-5 rounded-full border-2 transition-transform"
                    style={{
                      backgroundColor: c,
                      borderColor: c === newColor ? "#000" : "transparent",
                      transform: c === newColor ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
              <button
                className="w-full h-7 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={handleCreate}
                disabled={!newName.trim() || isPending}
              >
                Créer & ajouter
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
