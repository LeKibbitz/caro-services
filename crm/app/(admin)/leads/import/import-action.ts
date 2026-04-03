"use server";

import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface SalonRow {
  name?: string;
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
  reviews_count?: number;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
}

export async function importLeadsAction(salons: SalonRow[]): Promise<ImportResult> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Non autorisé");

  const db = getDb();
  let created = 0, updated = 0, skipped = 0;

  for (const s of salons) {
    const salonName = s.name?.trim();
    if (!salonName) { skipped++; continue; }
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
      source: "salonkee",
    };

    try {
      const existing = await db.lead.findFirst({ where: { salonName, address: address ?? undefined } });
      if (existing) {
        await db.lead.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await db.lead.create({ data: { salonName, address, ...data } });
        created++;
      }
    } catch { skipped++; }
  }

  return { created, updated, skipped, total: salons.length };
}
