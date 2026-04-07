import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const SYSTEM_PROMPT = `Tu es un assistant de rédaction pour Caroline Finance, cabinet de fiscalité et comptabilité au Luxembourg.

Tu améliores les messages commerciaux et professionnels. Tu dois :
- Garder le sens original du message
- Corriger l'orthographe et la grammaire
- Améliorer la clarté et le ton professionnel
- Garder les variables entre crochets intactes ([Prénom], [Nom], [Salon])
- Adapter le style au canal de communication

RÈGLES PAR CANAL :
- email : ton formel et professionnel, phrases complètes, formules de politesse
- whatsapp : ton cordial mais professionnel, concis, pas de formules longues
- sms : très court, direct, pas de fioritures

IMPORTANT :
- Réponds UNIQUEMENT avec le texte amélioré, sans explication ni commentaire
- Ne change pas la langue du message (français par défaut)
- Conserve la structure (paragraphes, sauts de ligne)
- Ne rajoute pas de signature ou de formule de fin si le message original n'en a pas`;

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PERPLEXITY_API_KEY non configuré" }, { status: 500 });
  }

  const body = await req.json();
  const { text, channel, context } = body as {
    text: string;
    channel: "email" | "whatsapp" | "sms";
    context?: string;
  };

  if (!text || text.trim().length < 10) {
    return NextResponse.json({ error: "Texte trop court" }, { status: 400 });
  }

  let userMessage = `Canal : ${channel}\n\nMessage à améliorer :\n${text}`;
  if (context) {
    userMessage += `\n\nContexte (message original auquel on répond) :\n${context}`;
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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: `Perplexity: ${errText.slice(0, 200)}` }, { status: 500 });
  }

  const data = await resp.json();
  const improved = data.choices[0].message.content.trim();

  return NextResponse.json({ improved });
}
