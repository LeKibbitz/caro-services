import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const result = await verifyMagicLink(token);

  if (!result) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const { user, sessionToken, expiresAt } = result;
  const destination = user.role === "admin" ? "/dashboard" : "/portal";
  const response = NextResponse.redirect(new URL(destination, req.url));

  response.cookies.set("caro_session", sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
