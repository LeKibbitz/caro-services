import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generateCSV, generateXLSX, ENTITY_COLUMNS } from "@/lib/export";

const VALID_ENTITIES = [
  "leads",
  "contacts",
  "quotes",
  "invoices",
  "dossiers",
  "suppliers",
  "appointments",
  "messages",
] as const;

type Entity = (typeof VALID_ENTITIES)[number];

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRows(entity: Entity, q: string, status: string, db: any) {
  const insensitive = "insensitive" as const;

  switch (entity) {
    case "leads":
      return db.lead.findMany({
        where: {
          AND: [
            q
              ? {
                  OR: [
                    { displayName: { contains: q, mode: insensitive } },
                    { ownerName: { contains: q, mode: insensitive } },
                  ],
                }
              : {},
            status ? { status } : {},
          ],
        },
        orderBy: { createdAt: "desc" },
      });

    case "contacts":
      return db.contact.findMany({
        where: {
          AND: [
            q
              ? {
                  OR: [
                    { firstName: { contains: q, mode: insensitive } },
                    { lastName: { contains: q, mode: insensitive } },
                    { companyName: { contains: q, mode: insensitive } },
                    { email: { contains: q, mode: insensitive } },
                  ],
                }
              : {},
            status ? { type: status } : {},
          ],
        },
        orderBy: { createdAt: "desc" },
      });

    case "quotes":
      return db.quote.findMany({
        include: { contact: true },
        where: {
          AND: [
            q
              ? {
                  OR: [
                    { number: { contains: q, mode: insensitive } },
                    {
                      contact: {
                        companyName: { contains: q, mode: insensitive },
                      },
                    },
                  ],
                }
              : {},
            status ? { status } : {},
          ],
        },
        orderBy: { createdAt: "desc" },
      });

    case "invoices":
      return db.invoice.findMany({
        include: { contact: true },
        where: {
          AND: [
            q
              ? {
                  OR: [
                    { number: { contains: q, mode: insensitive } },
                    {
                      contact: {
                        companyName: { contains: q, mode: insensitive },
                      },
                    },
                  ],
                }
              : {},
            status ? { status } : {},
          ],
        },
        orderBy: { createdAt: "desc" },
      });

    case "dossiers":
      return db.dossier.findMany({
        include: { contact: true },
        where: {
          AND: [
            q
              ? { contact: { companyName: { contains: q, mode: insensitive } } }
              : {},
            status ? { status } : {},
          ],
        },
        orderBy: { createdAt: "desc" },
      });

    case "suppliers":
      return db.supplier.findMany({
        where: q
          ? {
              OR: [
                { name: { contains: q, mode: insensitive } },
                { contactName: { contains: q, mode: insensitive } },
              ],
            }
          : {},
        orderBy: { name: "asc" },
      });

    case "appointments":
      return db.appointment.findMany({
        include: { contact: true },
        where: {
          AND: [status ? { status } : {}],
        },
        orderBy: { startAt: "desc" },
      });

    case "messages":
      return db.message.findMany({
        where: {
          AND: [status ? { channel: status } : {}],
        },
        orderBy: { createdAt: "desc" },
      });

    default:
      return [];
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { entity } = await params;

  if (!VALID_ENTITIES.includes(entity as Entity)) {
    return NextResponse.json({ error: "Entité inconnue" }, { status: 400 });
  }

  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "csv";
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";

  const columns = ENTITY_COLUMNS[entity];
  if (!columns) {
    return NextResponse.json(
      { error: "Colonnes non définies" },
      { status: 400 }
    );
  }

  const db = getDb();
  const rows = await fetchRows(entity as Entity, q, status, db);

  const dateStr = formatDate(new Date());
  const filename = `${entity}_${dateStr}`;

  if (format === "xlsx") {
    const buf = generateXLSX(rows, columns, entity);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  // Default: CSV
  const csv = generateCSV(rows, columns);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
