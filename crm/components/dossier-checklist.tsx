"use client";

import { useState, useTransition } from "react";
import { updateDossierChecklist } from "@/app/(admin)/dossiers/actions";

interface ChecklistItem {
  label: string;
  done: boolean;
}

export function DossierChecklist({
  dossierId,
  items: initialItems,
}: {
  dossierId: string;
  items: ChecklistItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  function toggle(idx: number) {
    const next = items.map((item, i) =>
      i === idx ? { ...item, done: !item.done } : item
    );
    setItems(next);
    startTransition(() => {
      updateDossierChecklist(dossierId, next);
    });
  }

  const done = items.filter((i) => i.done).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>
          {done}/{items.length} complété{done > 1 ? "s" : ""}
        </span>
        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      </div>
      {items.map((item, idx) => (
        <label
          key={idx}
          className="flex items-center gap-3 text-sm py-1 cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(idx)}
            disabled={isPending}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span
            className={
              item.done
                ? "line-through text-muted-foreground"
                : "group-hover:text-foreground"
            }
          >
            {item.label}
          </span>
        </label>
      ))}
    </div>
  );
}
