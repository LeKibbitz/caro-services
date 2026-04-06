import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Internal endpoint — called by the scraper to update progress
// Auth via LEADS_IMPORT_TOKEN (same token used by scraper)
function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = process.env.LEADS_IMPORT_TOKEN;
  if (!token) return false;
  return auth === `Bearer ${token}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, progress, total, phase, resultCount, errorLog } = body as {
    status?: string;
    progress?: number;
    total?: number;
    phase?: string;
    resultCount?: number;
    errorLog?: string;
  };

  const db = getDb();
  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (progress !== undefined) data.progress = progress;
  if (total !== undefined) data.total = total;
  if (phase !== undefined) data.phase = phase;
  if (resultCount !== undefined) data.resultCount = resultCount;
  if (errorLog !== undefined) data.errorLog = errorLog;

  if (status === "running" && !data.startedAt) data.startedAt = new Date();
  if (status === "done" || status === "failed") data.finishedAt = new Date();

  const job = await db.scrapeJob.update({ where: { id }, data });
  return NextResponse.json({ ok: true, status: job.status });
}
