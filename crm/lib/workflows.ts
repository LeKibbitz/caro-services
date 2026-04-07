import { getSetting, setSetting } from "./settings";
export type { StepType, WorkflowStep, WorkflowDef } from "./workflows-types";
export { STEP_LABELS, STEP_ICONS, LEAD_STATUSES } from "./workflows-types";
import type { WorkflowDef } from "./workflows-types";

const SETTING_KEY = "workflow_definitions";

export async function getWorkflows(): Promise<WorkflowDef[]> {
  const raw = await getSetting(SETTING_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkflowDef[];
  } catch {
    return [];
  }
}

export async function saveWorkflows(workflows: WorkflowDef[]): Promise<void> {
  await setSetting(SETTING_KEY, JSON.stringify(workflows));
}
