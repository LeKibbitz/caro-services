"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getWorkflows, saveWorkflows } from "@/lib/workflows";
import type { WorkflowDef, WorkflowStep } from "@/lib/workflows";
import { getDb } from "@/lib/db";
import type { LeadStatus } from "@/lib/generated/prisma/client";

async function adminOnly() {
  const s = await getSession();
  if (!s || s.role !== "admin") throw new Error("Non autorisé");
}

function uid() {
  return `wf${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function saveWorkflowDef(formData: FormData): Promise<void> {
  await adminOnly();
  const id = (formData.get("id") as string) || uid();
  const stepsRaw = formData.get("steps") as string;
  const steps: WorkflowStep[] = JSON.parse(stepsRaw || "[]");

  const workflows = await getWorkflows();
  const existing = workflows.find((w) => w.id === id);

  const def: WorkflowDef = {
    id,
    name: (formData.get("name") as string).trim(),
    description: (formData.get("description") as string)?.trim() || undefined,
    entity: "lead",
    steps,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  if (existing) {
    await saveWorkflows(workflows.map((w) => (w.id === id ? def : w)));
  } else {
    await saveWorkflows([...workflows, def]);
  }

  revalidatePath("/workflows");
}

export async function deleteWorkflowDef(id: string): Promise<void> {
  await adminOnly();
  const workflows = await getWorkflows();
  await saveWorkflows(workflows.filter((w) => w.id !== id));
  revalidatePath("/workflows");
}

// Execute a single step on a lead — returns result for UI feedback
export async function executeStep(
  leadId: string,
  step: WorkflowStep
): Promise<{ ok: boolean; redirect?: string; message?: string; error?: string }> {
  await adminOnly();

  switch (step.type) {
    case "change_status": {
      const db = getDb();
      const status = step.params.status as LeadStatus;
      if (!status) return { ok: false, error: "Statut non défini" };
      await db.lead.update({ where: { id: leadId }, data: { status } });
      revalidatePath(`/leads/${leadId}`);
      revalidatePath("/leads");
      return { ok: true, message: `Statut changé → ${status}` };
    }

    case "create_quote": {
      return { ok: true, redirect: `/quotes/new?leadId=${leadId}` };
    }

    case "create_invoice": {
      // Find latest accepted quote for this lead's contact
      const db = getDb();
      const lead = await db.lead.findUnique({ where: { id: leadId }, select: { contactId: true } });
      if (!lead?.contactId) return { ok: false, error: "Lead non converti en contact" };
      const quote = await db.quote.findFirst({
        where: { contactId: lead.contactId, status: "accepted" },
        orderBy: { createdAt: "desc" },
      });
      if (!quote) return { ok: false, error: "Aucun devis accepté trouvé pour ce contact" };
      return { ok: true, redirect: `/quotes/${quote.id}` };
    }

    case "send_wa":
    case "send_email":
      // These are handled client-side (open the outreach form)
      return { ok: true, message: "Ouvrez le formulaire de contact ci-dessous" };

    case "note":
      return { ok: true, message: step.params.text ?? "Note enregistrée" };

    default:
      return { ok: false, error: "Type d'étape inconnu" };
  }
}
