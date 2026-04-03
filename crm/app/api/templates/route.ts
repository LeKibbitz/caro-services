import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json([], { status: 401 });

  const db = getDb();
  const templates = await db.outreachTemplate.findMany({
    orderBy: [{ channel: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(templates);
}
