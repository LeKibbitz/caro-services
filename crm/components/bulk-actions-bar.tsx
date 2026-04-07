"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Download,
  Sparkles,
  Mail,
  MessageSquare,
  Smartphone,
  FileText,
  Loader2,
} from "lucide-react";

type BulkAction = {
  key: string;
  label: string;
  icon: ReactNode;
  variant?: "default" | "outline" | "destructive" | "ghost";
  confirm?: string;
  action: (ids: string[]) => Promise<unknown>;
  onComplete?: (result: unknown) => void;
};

type Props = {
  selectedIds: string[];
  actions: BulkAction[];
};

export function BulkActionsBar({ selectedIds, actions }: Props) {
  const [pending, startTransition] = useTransition();
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function handleAction(action: BulkAction) {
    if (action.confirm) {
      const ok = window.confirm(action.confirm.replace("{n}", String(selectedIds.length)));
      if (!ok) return;
    }

    setRunningKey(action.key);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await action.action(selectedIds);
        if (action.onComplete) action.onComplete(res);
        if (typeof res === "object" && res !== null) {
          const r = res as Record<string, unknown>;
          if (r.deleted) setResult(`${r.deleted} supprimé(s)`);
          else if (r.updated) setResult(`${r.updated} mis à jour`);
          else if (r.enriched) setResult(`${r.enriched} enrichi(s)`);
          else setResult("Terminé");
        }
      } catch (e) {
        setResult(`Erreur: ${e instanceof Error ? e.message : "inconnue"}`);
      } finally {
        setRunningKey(null);
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {actions.map((action) => {
        const isRunning = pending && runningKey === action.key;
        return (
          <Button
            key={action.key}
            variant={action.variant ?? "outline"}
            size="sm"
            className="text-xs h-7 gap-1.5"
            disabled={pending}
            onClick={() => handleAction(action)}
          >
            {isRunning ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              action.icon
            )}
            {action.label}
          </Button>
        );
      })}
      {result && (
        <span className="text-xs text-muted-foreground ml-1">{result}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pre-built action factories
// ---------------------------------------------------------------------------

export function makeDeleteAction(
  deleteFn: (ids: string[]) => Promise<{ deleted: number }>,
  entityName = "élément"
): BulkAction {
  return {
    key: "delete",
    label: "Supprimer",
    icon: <Trash2 className="h-3 w-3" />,
    variant: "destructive",
    confirm: `Supprimer {n} ${entityName}(s) ? Cette action est irréversible.`,
    action: deleteFn,
    onComplete: () => window.location.reload(),
  };
}

export function makeExportAction(
  exportFn: (ids: string[]) => Promise<string>,
  filename = "export"
): BulkAction {
  return {
    key: "export",
    label: "Exporter CSV",
    icon: <Download className="h-3 w-3" />,
    action: async (ids) => {
      const csv = await exportFn(ids);
      // Download the CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return { exported: ids.length };
    },
  };
}

export function makeEnrichAction(
  enrichFn: (ids: string[]) => Promise<{ enriched: number; errors: number }>
): BulkAction {
  return {
    key: "enrich",
    label: "Enrichir",
    icon: <Sparkles className="h-3 w-3" />,
    action: enrichFn,
  };
}

export function makeStatusAction(
  updateFn: (ids: string[], status: string) => Promise<{ updated: number }>,
  status: string,
  label: string
): BulkAction {
  return {
    key: `status-${status}`,
    label,
    icon: <FileText className="h-3 w-3" />,
    action: (ids) => updateFn(ids, status),
    onComplete: () => window.location.reload(),
  };
}

export function makeCampaignAction(
  channel: "email" | "whatsapp" | "sms",
  label: string
): BulkAction {
  const icons = {
    email: <Mail className="h-3 w-3" />,
    whatsapp: <MessageSquare className="h-3 w-3" />,
    sms: <Smartphone className="h-3 w-3" />,
  };
  return {
    key: `campaign-${channel}`,
    label,
    icon: icons[channel],
    action: async (ids) => {
      // Navigate to campaign creation page with pre-selected IDs
      const params = new URLSearchParams();
      params.set("ids", ids.join(","));
      params.set("channel", channel);
      window.location.href = `/leads/campaign?${params.toString()}`;
      return {};
    },
  };
}
