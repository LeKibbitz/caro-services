import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const BRIDGE = process.env.WA_BRIDGE_INTERNAL || "http://caro-wa-bridge:3101";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path") || "status";
  try {
    // qr-image is a CRM-side path — bridge only exposes /qr
    const bridgePath = path === "qr-image" ? "qr" : path;
    const res = await fetch(`${BRIDGE}/${bridgePath}`, { cache: "no-store" });
    if (path === "qr") {
      const html = await res.text();
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (path === "qr-image") {
      // Extract base64 PNG from bridge HTML and return raw image
      const html = await res.text();
      const match = html.match(/src="data:image\/png;base64,([^"]+)"/);
      if (!match) {
        return new NextResponse(null, { status: 204 });
      }
      const buf = Buffer.from(match[1], "base64");
      return new NextResponse(buf, {
        headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
      });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Bridge inaccessible" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  try {
    const res = await fetch(`${BRIDGE}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Bridge inaccessible" }, { status: 503 });
  }
}
