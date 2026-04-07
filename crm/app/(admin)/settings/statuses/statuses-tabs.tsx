"use client";

import { useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { addCustomStatus, deleteCustomStatus } from "./actions";
import type { StatusDef, EntityWithStatuses } from "@/lib/statuses";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type EntityConfig = {
  key: EntityWithStatuses;
  label: string;
};

const ENTITIES: EntityConfig[] = [
  { key: "leads", label: "Leads" },
  { key: "dossiers", label: "Dossiers" },
  { key: "quotes", label: "Devis" },
  { key: "invoices", label: "Factures" },
];

type Props = {
  statusesByEntity: Record<EntityWithStatuses, StatusDef[]>;
};

function StatusRow({
  status,
  entity,
}: {
  status: StatusDef;
  entity: EntityWithStatuses;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteCustomStatus(entity, status.value);
    });
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      {/* Color dot */}
      <span
        className="h-3 w-3 rounded-full shrink-0 border border-black/10"
        style={{ backgroundColor: status.color }}
      />

      {/* Label */}
      <span className="flex-1 text-sm font-medium">{status.label}</span>

      {/* Default badge */}
      {!status.deletable && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          par défaut
        </span>
      )}

      {/* Raw value */}
      <span className="text-xs text-muted-foreground font-mono">{status.value}</span>

      {/* Delete button — only for custom statuses */}
      {status.deletable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label={`Supprimer le statut ${status.label}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

function AddStatusForm({ entity }: { entity: EntityWithStatuses }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await addCustomStatus(entity, formData);
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 mt-4">
      <div className="flex-1 space-y-1">
        <label htmlFor={`label-${entity}`} className="text-xs font-medium text-muted-foreground">
          Libellé
        </label>
        <input
          id={`label-${entity}`}
          name="label"
          type="text"
          required
          placeholder="Nouveau statut…"
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={`color-${entity}`} className="text-xs font-medium text-muted-foreground">
          Couleur
        </label>
        <input
          id={`color-${entity}`}
          name="color"
          type="color"
          defaultValue="#64748b"
          className="h-9 w-14 rounded-md border border-input bg-background px-1 py-1 cursor-pointer"
        />
      </div>
      <Button type="submit" disabled={isPending} size="sm" className="h-9">
        {isPending ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}

export function StatusesTabs({ statusesByEntity }: Props) {
  return (
    <Tabs defaultValue="leads">
      <TabsList>
        {ENTITIES.map((e) => (
          <TabsTrigger key={e.key} value={e.key}>
            {e.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {ENTITIES.map((e) => (
        <TabsContent key={e.key} value={e.key} className="mt-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-1">
            <div>
              {statusesByEntity[e.key].map((status) => (
                <StatusRow key={status.value} status={status} entity={e.key} />
              ))}
            </div>
            <AddStatusForm entity={e.key} />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
