import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Bearer token auth — set LEADS_IMPORT_TOKEN in env
function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = process.env.LEADS_IMPORT_TOKEN;
  if (!token) return false;
  return auth === `Bearer ${token}`;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let salons: unknown[];
  try {
    salons = await req.json();
    if (!Array.isArray(salons)) throw new Error("Expected array");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = getDb();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of salons) {
    const s = raw as Record<string, unknown>;
    const salonName = (s.name as string | undefined)?.trim();
    if (!salonName) { skipped++; continue; }

    const address = (s.address as string | undefined)?.trim() || null;

    const data = {
      phone: (s.phone as string | undefined)?.trim() || null,
      phones: Array.isArray(s.phones) && s.phones.length ? s.phones : undefined,
      email: (s.email as string | undefined)?.trim() || null,
      emails: Array.isArray(s.emails) && s.emails.length ? s.emails : undefined,
      ownerName: (s.owner_name as string | undefined) || null,
      ownerTitle: (s.owner_title as string | undefined) || null,
      ownerConfidence: (s.owner_confidence as string | undefined) || null,
      ownerSource: (s.owner_source as string | undefined) || null,
      rcsNumber: (s.rcs_number as string | undefined) || null,
      linkedinUrl: (s.linkedin_url as string | undefined) || null,
      enrichNotes: (s.owner_notes as string | undefined) || null,
      websiteUrl: (s.website_url as string | undefined) || null,
      sourceUrl: (s.source_url as string | undefined) || null,
      reviewsCount: typeof s.reviews_count === "number" ? s.reviews_count : null,
      source: "salonkee",
    };

    try {
      const existing = await db.lead.findFirst({
        where: { salonName, address: address ?? undefined },
      });

      if (existing) {
        // Only update enrichment fields if we have better data
        await db.lead.update({
          where: { id: existing.id },
          data: {
            ...data,
            // Don't overwrite if already converted/qualified
            ...(existing.status === "new" && data.phone
              ? { phone: data.phone }
              : {}),
          },
        });
        updated++;
      } else {
        await db.lead.create({
          data: { salonName, address, ...data },
        });
        created++;
      }
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ created, updated, skipped, total: salons.length });
}
