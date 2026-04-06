import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { source, config } = body as { source: string; config: Prisma.InputJsonValue };

  if (!source || !config) {
    return NextResponse.json({ error: "source et config requis" }, { status: 400 });
  }

  const db = getDb();
  const job = await db.scrapeJob.create({
    data: { source, config, status: "pending" },
  });

  // Launch scraper in background via Docker on VPS
  // The CRM itself runs in Docker, so we use the internal network
  // For now, we mark as pending — the scraper container polls for pending jobs
  // or we trigger via docker exec from a separate process

  return NextResponse.json({ id: job.id, status: job.status });
}
