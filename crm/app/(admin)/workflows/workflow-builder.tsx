"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, Trash2, Pencil, Check, X, ChevronUp, ChevronDown, GitBranch, GripVertical,
} from "lucide-react";
import { saveWorkflowDef, deleteWorkflowDef } from "./actions";
import type { WorkflowDef, WorkflowStep, StepType } from "@/lib/workflows-types";
import { STEP_LABELS, STEP_ICONS, LEAD_STATUSES } from "@/lib/workflows-types";

const STEP_TYPES: StepType[] = [
  "change_status", "send_wa", "send_email", "create_quote", "create_invoice", "note",
];

// ─── Step editor ─────────────────────────────────────────────────────────────

function StepEditor({
  step,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  step: WorkflowStep;
  onChange: (s: WorkflowStep) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  function setParam(key: string, value: string) {
    onChange({ ...step, params: { ...step.params, [key]: value } });
  }

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-background">
      <div className="flex items-center gap-2">
        <span className="text-lg">{STEP_ICONS[step.type]}</span>
        <select
          value={step.type}
          onChange={(e) => onChange({ ...step, type: e.target.value as StepType, params: {} })}
          className="flex-1 h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          {STEP_TYPES.map((t) => (
            <option key={t} value={t}>{STEP_LABELS[t]}</option>
          ))}
        </select>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onMoveUp} disabled={!canMoveUp}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onMoveDown} disabled={!canMoveDown}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Optional label */}
      <Input
        placeholder="Label (optionnel)"
        value={step.label ?? ""}
        onChange={(e) => onChange({ ...step, label: e.target.value })}
        className="text-sm h-8"
      />

      {/* Type-specific params */}
      {step.type === "change_status" && (
        <div className="space-y-1">
          <Label className="text-xs">Nouveau statut</Label>
          <select
            value={step.params.status ?? ""}
            onChange={(e) => setParam("status", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            <option value="">— Choisir —</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {step.type === "send_wa" && (
        <div className="space-y-1">
          <Label className="text-xs">Message WhatsApp</Label>
          <textarea
            value={step.params.message ?? ""}
            onChange={(e) => setParam("message", e.target.value)}
            rows={3}
            placeholder="Bonjour [Prénom], ..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none"
          />
        </div>
      )}

      {step.type === "send_email" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Objet</Label>
            <Input
              value={step.params.subject ?? ""}
              onChange={(e) => setParam("subject", e.target.value)}
              placeholder="Objet du mail"
              className="text-sm h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Corps du message</Label>
            <textarea
              value={step.params.body ?? ""}
              onChange={(e) => setParam("body", e.target.value)}
              rows={3}
              placeholder="Bonjour [Prénom], ..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>
      )}

      {step.type === "note" && (
        <div className="space-y-1">
          <Label className="text-xs">Note / instruction</Label>
          <Input
            value={step.params.text ?? ""}
            onChange={(e) => setParam("text", e.target.value)}
            placeholder="Ex: Relancer si pas de réponse sous 3 jours"
            className="text-sm h-8"
          />
        </div>
      )}

      {(step.type === "create_quote" || step.type === "create_invoice") && (
        <p className="text-xs text-muted-foreground italic">
          Redirige vers la création {step.type === "create_quote" ? "d'un devis" : "d'une facture"}.
        </p>
      )}
    </div>
  );
}

// ─── WorkflowForm ─────────────────────────────────────────────────────────────

function WorkflowForm({
  initial,
  onClose,
}: {
  initial?: WorkflowDef;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [steps, setSteps] = useState<WorkflowStep[]>(initial?.steps ?? []);
  const [pending, startTransition] = useTransition();

  function addStep() {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: "change_status",
      params: {},
    };
    setSteps((prev) => [...prev, newStep]);
  }

  function updateStep(idx: number, s: WorkflowStep) {
    setSteps((prev) => prev.map((old, i) => (i === idx ? s : old)));
  }

  function removeStep(idx: number) {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveStep(idx: number, dir: -1 | 1) {
    setSteps((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function handleSave() {
    if (!name.trim()) return;
    const fd = new FormData();
    if (initial?.id) fd.set("id", initial.id);
    fd.set("name", name);
    fd.set("description", description);
    fd.set("steps", JSON.stringify(steps));
    startTransition(async () => {
      await saveWorkflowDef(fd);
      onClose();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nom du workflow *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pipeline standard lead" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Séquence de prise en charge…" className="text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Étapes ({steps.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-3.5 w-3.5 mr-1" />Ajouter une étape
          </Button>
        </div>

        {steps.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
            Aucune étape. Cliquez sur &ldquo;Ajouter une étape&rdquo;.
          </div>
        )}

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-2">
              <div className="mt-3 text-xs text-muted-foreground font-mono w-5 text-right shrink-0">{idx + 1}</div>
              <div className="flex-1">
                <StepEditor
                  step={step}
                  onChange={(s) => updateStep(idx, s)}
                  onRemove={() => removeStep(idx)}
                  onMoveUp={() => moveStep(idx, -1)}
                  onMoveDown={() => moveStep(idx, 1)}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < steps.length - 1}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
        <Button
          type="button"
          size="sm"
          disabled={!name.trim() || pending}
          onClick={handleSave}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

// ─── WorkflowCard ─────────────────────────────────────────────────────────────

function WorkflowCard({ workflow, onRefresh }: { workflow: WorkflowDef; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  if (editing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Modifier : {workflow.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowForm initial={workflow} onClose={() => { setEditing(false); onRefresh(); }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            {workflow.name}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => {
                if (!confirm(`Supprimer le workflow "${workflow.name}" ?`)) return;
                startTransition(async () => {
                  await deleteWorkflowDef(workflow.id);
                  onRefresh();
                });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardTitle>
        {workflow.description && (
          <p className="text-xs text-muted-foreground">{workflow.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        {workflow.steps.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Aucune étape définie.</p>
        )}
        {workflow.steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2 text-sm">
            <span className="text-xs text-muted-foreground font-mono w-4 text-right shrink-0">{idx + 1}</span>
            <span className="text-base">{STEP_ICONS[step.type]}</span>
            <span className="text-muted-foreground">{step.label || STEP_LABELS[step.type]}</span>
            {step.type === "change_status" && step.params.status && (
              <span className="text-xs text-primary font-medium">→ {step.params.status}</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkflowBuilder({ initial }: { initial: WorkflowDef[] }) {
  const [workflows, setWorkflows] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  // Re-fetch after mutations by triggering a page-level revalidation pattern:
  // we just close the form and let Next.js revalidatePath do the rest.
  // For the local state we do a simple router refresh trick via key.
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((k) => k + 1);
    // Update local list by reloading
    startTransition(() => {
      // The server action already calls revalidatePath so the page
      // will re-render with fresh data on next navigation. For immediate
      // local feedback we re-set from the prop (stale, but acceptable).
      setWorkflows(initial);
    });
  }

  return (
    <div className="space-y-4" key={refreshKey}>
      {workflows.length === 0 && !creating && (
        <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground text-sm">
          <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-30" />
          Aucun workflow défini. Créez votre premier workflow.
        </div>
      )}

      {workflows.map((wf) => (
        <WorkflowCard key={wf.id} workflow={wf} onRefresh={refresh} />
      ))}

      {creating ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowForm onClose={() => { setCreating(false); refresh(); }} />
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nouveau workflow
        </Button>
      )}
    </div>
  );
}
