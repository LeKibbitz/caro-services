import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

const BUSINESS_SYSTEM_PROMPT = `Tu es un assistant de recherche business spécialisé dans le Luxembourg.
Tu dois trouver le gérant, propriétaire ou dirigeant d'un commerce au Luxembourg.

MÉTHODE DE RECHERCHE (suis cet ordre) :
1. Si un site web est fourni, consulte-le EN PRIORITÉ — pages Contact, À propos, Mentions légales, Impressum
2. Sinon, cherche d'abord le site web du commerce sur Google (nom + ville + Luxembourg)
3. Cherche sur rcsl.lu (RCS Luxembourg) le nom de la société pour trouver le gérant officiel
4. Cherche sur LinkedIn la société et ses employés
5. Cherche sur Editus.lu, Paperjam.lu, LBR.lu
6. Cherche sur Google : "nom du commerce" + "gérant" ou "propriétaire" ou "fondateur"

IMPORTANT : Ne te limite PAS aux annuaires. Cherche aussi le site web propre du commerce — il contient souvent le nom du gérant dans les mentions légales ou la page "À propos".

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks :
{
  "owner_name": "Prénom Nom ou null si introuvable",
  "owner_title": "Gérant|Propriétaire|Associé|Dirigeant|null",
  "owner_email": "email professionnel du gérant ou null",
  "owner_phone": "numéro de portable du gérant (format +352...) ou null",
  "rcs_number": "B123456 ou null",
  "linkedin_url": "URL ou null",
  "website_url": "URL site web du commerce ou null",
  "source": "website|rcsl.lu|linkedin.com|editus.lu|google|etc ou null",
  "confidence": "high|medium|low|none",
  "notes": "Détails additionnels utiles"
}`;

const FORUM_SYSTEM_PROMPT = `Tu es un assistant spécialisé en fiscalité et comptabilité au Luxembourg.
Analyse ce post du forum lesfrontaliers.lu pour déterminer si la personne pourrait avoir besoin des services d'un cabinet de fiscalité/comptabilité luxembourgeois (Caroline Finance).

Services proposés par Caroline Finance :
- Déclaration IR frontalier (impôts sur le revenu)
- TVA Luxembourg
- Comptabilité annuelle
- Coordination fiscale France-Luxembourg
- CCSS (sécurité sociale)
- Conseil fiscal général

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks :
{
  "relevance": "high|medium|low",
  "service_match": ["IR frontalier", "TVA", "Comptabilité", etc.],
  "summary": "Résumé en 1-2 phrases du besoin de la personne",
  "reasoning": "Pourquoi cette personne pourrait devenir cliente",
  "confidence": "high|medium|low|none"
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

  const isForumLead = lead.leadType === "forum" || lead.leadType === "annonce";

  let systemPrompt: string;
  let userMessage: string;

  if (isForumLead) {
    // Forum/annonce lead: qualify the lead
    systemPrompt = FORUM_SYSTEM_PROMPT;
    const parts: string[] = [
      `Titre du sujet : "${lead.displayName}"`,
    ];
    if (lead.aiSummary) {
      parts.push(`Contenu de la question : ${lead.aiSummary.substring(0, 1500)}`);
    }
    if (lead.topicCategory) {
      parts.push(`Catégorie : ${lead.topicCategory}`);
    }
    if (lead.topicUrl) {
      parts.push(`URL du post : ${lead.topicUrl}`);
    }
    parts.push("Analyse si cette personne pourrait devenir cliente de Caroline Finance.");
    userMessage = parts.join("\n");
  } else {
    // Business lead: find the owner
    systemPrompt = BUSINESS_SYSTEM_PROMPT;
    const parts: string[] = [
      `Qui est le gérant ou propriétaire de "${lead.displayName}" situé à ${lead.address || "Luxembourg"} ?`,
    ];
    if (lead.websiteUrl) {
      parts.push(`Site web : ${lead.websiteUrl} — consulte les pages Contact, À propos et Mentions légales.`);
    }
    if (lead.sourceUrl) {
      parts.push(`Profil en ligne : ${lead.sourceUrl}`);
    }
    if (!lead.websiteUrl) {
      parts.push(`Cherche d'abord le site web de "${lead.displayName}" sur Google.`);
    }
    parts.push("Trouve son nom complet, email professionnel et numéro de portable.");
    userMessage = parts.join(" ");
  }

  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
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

  if (isForumLead) {
    // Forum enrichment: store qualification data
    if (result.summary) updates.aiSummary = result.summary;
    if (result.reasoning) updates.enrichNotes = result.reasoning;
    if (result.service_match) {
      updates.enrichNotes = `Services : ${Array.isArray(result.service_match) ? result.service_match.join(", ") : result.service_match}${result.reasoning ? `\n${result.reasoning}` : ""}`;
    }
    updates.ownerConfidence = result.relevance || result.confidence || "none";
  } else {
    // Business enrichment: store owner data
    if (result.owner_name) updates.ownerName = result.owner_name;
    if (result.owner_title) updates.ownerTitle = result.owner_title;
    if (result.source) updates.ownerSource = result.source;
    if (result.rcs_number) updates.rcsNumber = result.rcs_number;
    if (result.linkedin_url) updates.linkedinUrl = result.linkedin_url;
    if (result.notes) updates.enrichNotes = result.notes;
    if (result.owner_email) updates.email = result.owner_email;
    if (result.website_url && !lead.websiteUrl) updates.websiteUrl = result.website_url;
    if (result.owner_phone) {
      updates.phone = result.owner_phone;
      const existing = Array.isArray(lead.phones)
        ? (lead.phones as string[])
        : lead.phone
        ? [lead.phone]
        : [];
      updates.phones = [...new Set([result.owner_phone, ...existing].filter(Boolean))];
    }
  }

  await db.lead.update({ where: { id }, data: updates });
  revalidatePath(`/leads/${id}`);

  return NextResponse.json({
    ok: true,
    owner_name: result.owner_name ?? null,
    confidence: result.confidence ?? result.relevance ?? "none",
    relevance: result.relevance ?? null,
    service_match: result.service_match ?? null,
  });
}
