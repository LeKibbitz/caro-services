import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

const SYSTEM_PROMPT = `Tu es un assistant de recherche business spécialisé dans le Luxembourg.
Tu dois trouver le gérant, propriétaire ou dirigeant d'un salon de beauté/coiffure au Luxembourg.

Si un site web du salon est fourni dans la requête, consulte-le EN PRIORITÉ — la page Contact ou À propos contient souvent le nom, email et téléphone du gérant.

Sources prioritaires :
0. Site web propre du salon (fourni dans la requête)
1. RCS Luxembourg (rcsl.lu)
2. LinkedIn
3. Editus.lu
4. Paperjam.lu
5. LBR.lu

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks :
{
  "owner_name": "Prénom Nom ou null si introuvable",
  "owner_title": "Gérant|Propriétaire|Associé|Dirigeant|null",
  "owner_email": "email professionnel du gérant ou null",
  "owner_phone": "numéro de portable du gérant (format +352...) ou null",
  "rcs_number": "B123456 ou null",
  "linkedin_url": "URL ou null",
  "website_url": "URL site web du salon ou null",
  "source": "website|rcsl.lu|linkedin.com|editus.lu|etc ou null",
  "confidence": "high|medium|low|none",
  "notes": "Détails additionnels utiles"
}`;

function parseResponse(content: string) {
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]+\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall */ }
    }
    return { owner_name: null, confidence: "none", notes: `Non parsable: ${cleaned.slice(0, 150)}` };
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PERPLEXITY_API_KEY non configuré" }, { status: 500 });
  }

  const { id } = await params;
  const db = getDb();
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });

  const typedLead = lead as typeof lead & { websiteUrl?: string | null };

  const parts: string[] = [
    `Qui est le gérant ou propriétaire du salon "${lead.salonName}" situé à ${lead.address || "Luxembourg"} ?`,
  ];
  if (typedLead.websiteUrl) {
    parts.push(`Site web du salon : ${typedLead.websiteUrl} — consulte la page Contact et À propos.`);
  } else if (lead.sourceUrl) {
    parts.push(`Profil Salonkee : ${lead.sourceUrl}`);
  }
  parts.push("Trouve son nom complet, email professionnel et numéro de portable.");

  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: parts.join(" ") },
      ],
      temperature: 0.1,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return NextResponse.json({ error: `Perplexity: ${text.slice(0, 200)}` }, { status: 500 });
  }

  const data = await resp.json();
  const result = parseResponse(data.choices[0].message.content);

  const updates: Record<string, unknown> = {
    ownerConfidence: result.confidence || "none",
  };
  if (result.owner_name) updates.ownerName = result.owner_name;
  if (result.owner_title) updates.ownerTitle = result.owner_title;
  if (result.source) updates.ownerSource = result.source;
  if (result.rcs_number) updates.rcsNumber = result.rcs_number;
  if (result.linkedin_url) updates.linkedinUrl = result.linkedin_url;
  if (result.notes) updates.enrichNotes = result.notes;
  if (result.owner_email) updates.email = result.owner_email;
  if (result.website_url && !typedLead.websiteUrl) updates.websiteUrl = result.website_url;
  if (result.owner_phone) {
    updates.phone = result.owner_phone;
    const existing = Array.isArray(lead.phones)
      ? (lead.phones as string[])
      : lead.phone
      ? [lead.phone]
      : [];
    updates.phones = [...new Set([result.owner_phone, ...existing].filter(Boolean))];
  }

  await db.lead.update({ where: { id }, data: updates });
  revalidatePath(`/leads/${id}`);

  return NextResponse.json({
    ok: true,
    owner_name: result.owner_name,
    confidence: result.confidence,
  });
}
