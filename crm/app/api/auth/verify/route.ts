import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.APP_URL || "https://crm.caroline-finance.com";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  const result = await verifyMagicLink(token);

  if (!result) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid`);
  }

  const { user, sessionToken, expiresAt } = result;
  const destination = user.role === "admin" ? "/dashboard" : "/portal";
  const response = NextResponse.redirect(`${baseUrl}${destination}`);

  response.cookies.set("caro_session", sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
