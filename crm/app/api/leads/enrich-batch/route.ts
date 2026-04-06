import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const FORUM_SYSTEM_PROMPT = `Tu es un assistant spécialisé en fiscalité et comptabilité au Luxembourg.
Analyse ce post du forum lesfrontaliers.lu pour déterminer si la personne pourrait avoir besoin des services d'un cabinet de fiscalité/comptabilité luxembourgeois (Caroline Finance).

Services proposés par Caroline Finance :
- Déclaration IR frontalier (impôts sur le revenu)
- TVA Luxembourg
- Comptabilité annuelle
- Coordination fiscale France-Luxembourg
- CCSS (sécurité sociale)
- Conseil fiscal général

Cible : particuliers frontaliers français travaillant au Luxembourg, indépendants, PME/TPE, résidents luxembourgeois.

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks :
{
  "relevance": "high|medium|low",
  "service_match": ["IR frontalier", "TVA", "Comptabilité", etc.],
  "summary": "Résumé en 1-2 phrases du besoin de la personne",
  "reasoning": "Pourquoi cette personne pourrait devenir cliente"
}`;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = process.env.LEADS_IMPORT_TOKEN;
  if (!token) return false;
  return auth === `Bearer ${token}`;
}

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
    return { relevance: "none", summary: `Non parsable: ${cleaned.slice(0, 150)}` };
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PERPLEXITY_API_KEY non configuré" }, { status: 500 });
  }

  const body = await req.json();
  const { leadType, limit: maxLeads } = body as { leadType?: string; limit?: number };

  const db = getDb();
  const leads = await db.lead.findMany({
    where: {
      leadType: leadType || "forum",
      ownerConfidence: null,
    },
    take: maxLeads || 10,
    orderBy: { createdAt: "desc" },
  });

  if (leads.length === 0) {
    return NextResponse.json({ enriched: 0, message: "Aucun lead à enrichir" });
  }

  let enriched = 0;
  const results: Array<{ id: string; displayName: string; relevance: string }> = [];

  for (const lead of leads) {
    const parts = [
      `Titre du sujet : "${lead.displayName}"`,
    ];
    if (lead.aiSummary) parts.push(`Contenu : ${lead.aiSummary.substring(0, 1500)}`);
    if (lead.topicCategory) parts.push(`Catégorie : ${lead.topicCategory}`);
    if (lead.topicUrl) parts.push(`URL : ${lead.topicUrl}`);
    parts.push("Analyse si cette personne pourrait devenir cliente de Caroline Finance.");

    try {
      const resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: FORUM_SYSTEM_PROMPT },
            { role: "user", content: parts.join("\n") },
          ],
          temperature: 0.1,
        }),
      });

      if (!resp.ok) continue;

      const data = await resp.json();
      const result = parseResponse(data.choices[0].message.content);

      const updates: Record<string, unknown> = {
        ownerConfidence: result.relevance || "none",
      };
      if (result.summary) updates.aiSummary = result.summary;
      if (result.service_match || result.reasoning) {
        const services = Array.isArray(result.service_match) ? result.service_match.join(", ") : (result.service_match || "");
        updates.enrichNotes = `Services : ${services}${result.reasoning ? `\n${result.reasoning}` : ""}`;
      }

      await db.lead.update({ where: { id: lead.id }, data: updates });
      enriched++;
      results.push({
        id: lead.id,
        displayName: lead.displayName,
        relevance: result.relevance || "none",
      });

      // Rate limit: 1.5s between calls
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      // Continue on error
    }
  }

  return NextResponse.json({ enriched, total: leads.length, results });
}
