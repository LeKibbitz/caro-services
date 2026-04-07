import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getWorkflows } from "@/lib/workflows";
import { PipelineBoard } from "@/components/pipeline-board";
import { WorkflowBuilder } from "./workflow-builder";
import type { Stage } from "@/components/pipeline-board";

const LEAD_STAGES: Omit<Stage, "count">[] = [
  { value: "new", label: "Nouveau", color: "bg-slate-100 border-slate-300 text-slate-700" },
  { value: "contacted", label: "Contacté", color: "bg-blue-100 border-blue-300 text-blue-700" },
  { value: "lost", label: "Perdu", color: "bg-red-100 border-red-300 text-red-700" },
  { value: "converted", label: "Converti", color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
];

const DOSSIER_STAGES: Omit<Stage, "count">[] = [
  { value: "todo", label: "À faire", color: "bg-slate-100 border-slate-300 text-slate-700" },
  { value: "docs_pending", label: "Docs manquants", color: "bg-amber-100 border-amber-300 text-amber-700" },
  { value: "in_progress", label: "En cours", color: "bg-blue-100 border-blue-300 text-blue-700" },
  { value: "review", label: "À valider", color: "bg-violet-100 border-violet-300 text-violet-700" },
  { value: "done", label: "Terminé", color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
];

const QUOTE_STAGES: Omit<Stage, "count">[] = [
  { value: "draft", label: "Brouillon", color: "bg-slate-100 border-slate-300 text-slate-700" },
  { value: "sent", label: "Envoyé", color: "bg-blue-100 border-blue-300 text-blue-700" },
  { value: "accepted", label: "Accepté", color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
  { value: "rejected", label: "Refusé", color: "bg-red-100 border-red-300 text-red-700" },
  { value: "expired", label: "Expiré", color: "bg-orange-100 border-orange-300 text-orange-700" },
];

const INVOICE_STAGES: Omit<Stage, "count">[] = [
  { value: "draft", label: "Brouillon", color: "bg-slate-100 border-slate-300 text-slate-700" },
  { value: "sent", label: "Envoyé", color: "bg-blue-100 border-blue-300 text-blue-700" },
  { value: "paid", label: "Payé", color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
  { value: "overdue", label: "En retard", color: "bg-red-100 border-red-300 text-red-700" },
  { value: "cancelled", label: "Annulé", color: "bg-orange-100 border-orange-300 text-orange-700" },
];

function buildStages(defs: Omit<Stage, "count">[], counts: { status: string; _count: number }[]): Stage[] {
  const map = new Map(counts.map((c) => [c.status, c._count]));
  return defs.map((d) => ({ ...d, count: map.get(d.value) ?? 0 }));
}

type Tab = "pipelines" | "automations";

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const { tab: tabParam } = await searchParams;
  const tab = (tabParam as Tab) ?? "pipelines";

  const [db, workflows] = [getDb(), await getWorkflows()];

  const [leadCounts, dossierCounts, quoteCounts, invoiceCounts] = await Promise.all([
    db.lead.groupBy({ by: ["status"], _count: true }),
    db.dossier.groupBy({ by: ["status"], _count: true }),
    db.quote.groupBy({ by: ["status"], _count: true }),
    db.invoice.groupBy({ by: ["status"], _count: true }),
  ]);

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pipelines en cours et séquences d&apos;automatisation.
        </p>
      </div>

      <div className="flex border-b gap-1">
        <Link href="/workflows" className={tabClass("pipelines")}>Pipelines</Link>
        <Link href="/workflows?tab=automations" className={tabClass("automations")}>
          Automatisations
          {workflows.length > 0 && (
            <span className="ml-1.5 text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
              {workflows.length}
            </span>
          )}
        </Link>
      </div>

      {tab === "pipelines" && (
        <div className="space-y-10">
          <PipelineBoard title="Leads" stages={buildStages(LEAD_STAGES, leadCounts.map((c) => ({ status: c.status, _count: c._count })))} entityPath="leads" />
          <PipelineBoard title="Dossiers" stages={buildStages(DOSSIER_STAGES, dossierCounts.map((c) => ({ status: c.status, _count: c._count })))} entityPath="dossiers" />
          <PipelineBoard title="Devis" stages={buildStages(QUOTE_STAGES, quoteCounts.map((c) => ({ status: c.status, _count: c._count })))} entityPath="quotes" />
          <PipelineBoard title="Factures" stages={buildStages(INVOICE_STAGES, invoiceCounts.map((c) => ({ status: c.status, _count: c._count })))} entityPath="invoices" />
        </div>
      )}

      {tab === "automations" && (
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground mb-6">
            Définissez des séquences d&apos;étapes à exécuter manuellement sur un lead.
            Déclenchez-les depuis la fiche d&apos;un lead via le bouton <strong>Lancer un workflow</strong>.
          </p>
          <WorkflowBuilder initial={workflows} />
        </div>
      )}
    </div>
  );
}
