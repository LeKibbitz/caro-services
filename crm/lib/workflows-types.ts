// Pure types and constants — no DB/Node.js imports, safe for client components

export type StepType =
  | "change_status"
  | "send_wa"
  | "send_email"
  | "create_quote"
  | "create_invoice"
  | "note";

export interface WorkflowStep {
  id: string;
  type: StepType;
  label?: string;
  params: {
    status?: string;
    message?: string;
    subject?: string;
    body?: string;
    text?: string;
  };
}

export interface WorkflowDef {
  id: string;
  name: string;
  description?: string;
  entity: "lead";
  steps: WorkflowStep[];
  createdAt: string;
}

export const STEP_LABELS: Record<StepType, string> = {
  change_status: "Changer le statut",
  send_wa: "Envoyer un WhatsApp",
  send_email: "Envoyer un email",
  create_quote: "Créer un devis",
  create_invoice: "Créer une facture",
  note: "Note / rappel",
};

export const STEP_ICONS: Record<StepType, string> = {
  change_status: "🔄",
  send_wa: "💬",
  send_email: "✉️",
  create_quote: "📄",
  create_invoice: "🧾",
  note: "📝",
};

export const LEAD_STATUSES = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "lost", label: "Perdu" },
  { value: "converted", label: "Converti" },
];
