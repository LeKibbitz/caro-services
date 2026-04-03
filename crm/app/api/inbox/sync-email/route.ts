import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { syncInboxEmails } from "@/lib/imap";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const result = await syncInboxEmails(db);
  return NextResponse.json(result);
}
