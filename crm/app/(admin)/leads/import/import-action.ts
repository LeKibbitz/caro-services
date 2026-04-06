"use server";

import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface LeadRow {
  name?: string;
  display_name?: string;
  lead_type?: string;
  address?: string;
  phone?: string;
  phones?: string[];
  email?: string;
  emails?: string[];
  owner_name?: string;
  owner_title?: string;
  owner_confidence?: string;
  owner_source?: string;
  rcs_number?: string;
  linkedin_url?: string;
  owner_notes?: string;
  website_url?: string;
  source_url?: string;
  source?: string;
  reviews_count?: number;
  // Forum fields
  username?: string;
  topic_title?: string;
  topic_url?: string;
  topic_category?: string;
  topic_date?: string;
  reply_count?: number;
  view_count?: number;
  summary?: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
}

export async function importLeadsAction(items: LeadRow[]): Promise<ImportResult> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");

  const db = getDb();
  let created = 0, updated = 0, skipped = 0;

  for (const s of items) {
    const leadType = s.lead_type || "business";
    const displayName = (s.name ?? s.display_name ?? s.topic_title)?.trim();
    if (!displayName) { skipped++; continue; }
    const address = s.address?.trim() || null;

    const data = {
      phone: s.phone?.trim() || null,
      phones: s.phones?.length ? s.phones : undefined,
      email: s.email?.trim() || null,
      emails: s.emails?.length ? s.emails : undefined,
      ownerName: s.owner_name || null,
      ownerTitle: s.owner_title || null,
      ownerConfidence: s.owner_confidence || null,
      ownerSource: s.owner_source || null,
      rcsNumber: s.rcs_number || null,
      linkedinUrl: s.linkedin_url || null,
      enrichNotes: s.owner_notes || null,
      websiteUrl: s.website_url || null,
      sourceUrl: s.source_url || null,
      reviewsCount: typeof s.reviews_count === "number" ? s.reviews_count : null,
      source: s.source || "salonkee",
      leadType,
      // Forum fields
      forumUsername: s.username || null,
      topicTitle: s.topic_title || null,
      topicUrl: s.topic_url || null,
      topicCategory: s.topic_category || null,
      topicDate: s.topic_date ? new Date(s.topic_date) : null,
      replyCount: typeof s.reply_count === "number" ? s.reply_count : null,
      viewCount: typeof s.view_count === "number" ? s.view_count : null,
      aiSummary: s.summary || null,
    };

    try {
      if (leadType === "forum" || leadType === "annonce") {
        const existing = data.topicUrl
          ? await db.lead.findFirst({ where: { topicUrl: data.topicUrl } })
          : null;
        if (existing) {
          await db.lead.update({ where: { id: existing.id }, data });
          updated++;
        } else {
          await db.lead.create({ data: { displayName, address, ...data } });
          created++;
        }
      } else {
        const existing = await db.lead.findFirst({ where: { displayName, address: address ?? undefined } });
        if (existing) {
          await db.lead.update({ where: { id: existing.id }, data });
          updated++;
        } else {
          await db.lead.create({ data: { displayName, address, ...data } });
          created++;
        }
      }
    } catch { skipped++; }
  }

  return { created, updated, skipped, total: items.length };
}
