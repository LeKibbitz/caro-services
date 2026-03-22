import { NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requis." },
        { status: 400 }
      );
    }

    const result = await sendMagicLink(email.toLowerCase().trim());

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...(result.devLink ? { devLink: result.devLink } : {}),
    });
  } catch (err) {
    console.error("Magic link error:", err);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez." },
      { status: 500 }
    );
  }
}
