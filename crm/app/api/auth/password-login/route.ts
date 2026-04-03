import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

const SESSION_EXPIRY_DAYS = 30;
const BASE_URL = process.env.APP_URL || "https://crm.caroline-finance.com";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const db = getDb();
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.passwordHash || !user.active) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const sessionToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.session.create({ data: { token: sessionToken, userId: user.id, expiresAt } });

    const destination = user.role === "admin" ? "/dashboard" : "/portal";
    const response = NextResponse.json({ ok: true, redirect: destination });

    response.cookies.set("caro_session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (err) {
    console.error("Password login error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
