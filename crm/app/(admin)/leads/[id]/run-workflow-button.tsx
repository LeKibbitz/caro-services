"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Check, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { executeStep } from "../../workflows/actions";
import type { WorkflowDef, WorkflowStep } from "@/lib/workflows-types";
import { STEP_LABELS, STEP_ICONS } from "@/lib/workflows-types";

type StepState = "pending" | "running" | "done" | "error" | "skipped";

interface StepStatus {
  state: StepState;
  message?: string;
}

export function RunWorkflowButton({
  leadId,
  workflows,
}: {
  leadId: string;
  workflows: WorkflowDef[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<WorkflowDef | null>(null);
  const [statuses, setStatuses] = useState<StepStatus[]>([]);
  const [, startTransition] = useTransition();

  if (workflows.length === 0) return null;

  function startWorkflow(wf: WorkflowDef) {
    setSelected(wf);
    setStatuses(wf.steps.map(() => ({ state: "pending" as StepState })));
  }

  function setStatus(idx: number, status: StepStatus) {
    setStatuses((prev) => prev.map((s, i) => (i === idx ? status : s)));
  }

  function runStep(step: WorkflowStep, idx: number) {
    setStatus(idx, { state: "running" });
    startTransition(async () => {
      const result = await executeStep(leadId, step);
      if (result.redirect) {
        setStatus(idx, { state: "done", message: "Redirection…" });
        router.push(result.redirect);
      } else if (result.ok) {
        setStatus(idx, { state: "done", message: result.message });
      } else {
        setStatus(idx, { state: "error", message: result.error });
      }
    });
  }

  function reset() {
    setSelected(null);
    setStatuses([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
      >
        <Play className="h-3.5 w-3.5 mr-1.5" />
        Workflow
        {open ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>

      {open && !selected && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-popover border rounded-lg shadow-lg p-2 space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1">Choisir un workflow</p>
          {workflows.map((wf) => (
            <button
              key={wf.id}
              type="button"
              onClick={() => startWorkflow(wf)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors"
            >
              <div className="font-medium">{wf.name}</div>
              {wf.description && <div className="text-xs text-muted-foreground">{wf.description}</div>}
              <div className="text-xs text-muted-foreground mt-0.5">{wf.steps.length} étape{wf.steps.length !== 1 ? "s" : ""}</div>
            </button>
          ))}
        </div>
      )}

      {open && selected && (
        <div className="absolute right-0 top-full mt-1 z-50 w-80 bg-popover border rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <p className="text-sm font-semibold">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.steps.length} étape{selected.steps.length !== 1 ? "s" : ""}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={reset}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {selected.steps.map((step, idx) => {
              const status = statuses[idx] ?? { state: "pending" as StepState };
              const isDone = status.state === "done";
              const isError = status.state === "error";
              const isRunning = status.state === "running";

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                    isDone ? "bg-emerald-50 border-emerald-200" :
                    isError ? "bg-red-50 border-red-200" :
                    isRunning ? "bg-blue-50 border-blue-200" :
                    "border-border"
                  }`}
                >
                  <span className="text-base mt-0.5 shrink-0">{STEP_ICONS[step.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{step.label || STEP_LABELS[step.type]}</p>
                    {step.type === "change_status" && step.params.status && (
                      <p className="text-xs text-muted-foreground">→ {step.params.status}</p>
                    )}
                    {status.message && (
                      <p className={`text-xs mt-0.5 ${isError ? "text-destructive" : "text-muted-foreground"}`}>
                        {status.message}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isDone ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : isError ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : isRunning ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => runStep(step, idx)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Exécuter
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {statuses.every((s) => s.state === "done") && (
            <div className="px-4 py-3 border-t bg-emerald-50/50">
              <p className="text-xs text-emerald-700 font-medium text-center">
                ✓ Workflow terminé
              </p>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={reset}>
                Fermer
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
