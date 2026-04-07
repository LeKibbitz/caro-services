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

  let items: unknown[];
  try {
    items = await req.json();
    if (!Array.isArray(items)) throw new Error("Expected array");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = getDb();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Generate batch ID for tracking this import wave
  const batchId = `import-${new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-")}`;

  for (const raw of items) {
    const s = raw as Record<string, unknown>;
    const leadType = (s.lead_type as string) || "business";

    // For forum leads, displayName = topic title or username
    // For business leads, displayName = salon/business name
    const displayName = (
      (s.name as string | undefined) ??
      (s.display_name as string | undefined) ??
      (s.topic_title as string | undefined)
    )?.trim();
    if (!displayName) { skipped++; continue; }

    const address = (s.address as string | undefined)?.trim() || null;

    // Common fields (business leads)
    const businessData = {
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
      source: (s.source as string | undefined) || "salonkee",
    };

    // Forum/annonce specific fields
    const forumData = {
      forumUsername: (s.username as string | undefined) || null,
      topicTitle: (s.topic_title as string | undefined) || null,
      topicUrl: (s.topic_url as string | undefined) || null,
      topicCategory: (s.topic_category as string | undefined) || null,
      topicDate: s.topic_date ? new Date(s.topic_date as string) : null,
      replyCount: typeof s.reply_count === "number" ? s.reply_count : null,
      viewCount: typeof s.view_count === "number" ? s.view_count : null,
      aiSummary: (s.summary as string | undefined) || null,
    };

    try {
      if (leadType === "forum" || leadType === "annonce") {
        // Forum/annonce leads: deduplicate by topicUrl
        const topicUrl = forumData.topicUrl;
        const existing = topicUrl
          ? await db.lead.findFirst({ where: { topicUrl } })
          : null;

        if (existing) {
          await db.lead.update({
            where: { id: existing.id },
            data: { ...businessData, ...forumData, leadType },
          });
          updated++;
        } else {
          await db.lead.create({
            data: {
              displayName,
              address,
              leadType,
              importBatch: batchId,
              ...businessData,
              ...forumData,
            },
          });
          created++;
        }
      } else {
        // Business leads: deduplicate by displayName + address
        const existing = await db.lead.findFirst({
          where: { displayName, address: address ?? undefined },
        });

        if (existing) {
          await db.lead.update({
            where: { id: existing.id },
            data: {
              ...businessData,
              leadType,
              ...(existing.status === "new" && businessData.phone
                ? { phone: businessData.phone }
                : {}),
            },
          });
          updated++;
        } else {
          await db.lead.create({
            data: { displayName, address, leadType, importBatch: batchId, ...businessData },
          });
          created++;
        }
      }
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ created, updated, skipped, total: items.length, batchId });
}
