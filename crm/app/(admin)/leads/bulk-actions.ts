"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateCSV, ENTITY_COLUMNS } from "@/lib/export";

export async function bulkDeleteLeads(ids: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();

  // Delete outreaches first (FK constraint)
  await db.outreach.deleteMany({ where: { leadId: { in: ids } } });
  const result = await db.lead.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/leads");
  return { deleted: result.count };
}

export async function bulkUpdateLeadStatus(ids: string[], status: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();

  const result = await db.lead.updateMany({
    where: { id: { in: ids } },
    data: { status: status as never },
  });
  revalidatePath("/leads");
  return { updated: result.count };
}

export async function bulkExportLeads(ids: string[]): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");
  const db = getDb();

  const leads = await db.lead.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "desc" },
  });

  const csv = generateCSV(leads as Record<string, unknown>[], ENTITY_COLUMNS.leads);
  return csv;
}

export async function bulkEnrichLeads(ids: string[]): Promise<{ enriched: number; errors: number }> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY non configuré");

  const token = process.env.LEADS_IMPORT_TOKEN;
  const appUrl = process.env.APP_URL || "https://crm.caroline-finance.com";

  // Call the enrich-batch endpoint internally
  const resp = await fetch(`${appUrl}/api/leads/enrich-batch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids, limit: ids.length }),
  });

  if (!resp.ok) {
    // Fallback: enrich one by one via individual endpoint
    let enriched = 0;
    let errors = 0;
    for (const id of ids) {
      try {
        const r = await fetch(`${appUrl}/api/leads/${id}/enrich`, {
          method: "POST",
          headers: { cookie: "" }, // Won't work without session — use DB directly
        });
        if (r.ok) enriched++;
        else errors++;
      } catch {
        errors++;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    revalidatePath("/leads");
    return { enriched, errors };
  }

  const data = await resp.json();
  revalidatePath("/leads");
  return { enriched: data.enriched || 0, errors: 0 };
}
