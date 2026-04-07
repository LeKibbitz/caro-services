import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStatuses, type EntityWithStatuses, type StatusDef } from "@/lib/statuses";
import { StatusesTabs } from "./statuses-tabs";

export default async function StatusesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const db = getDb();

  const entities: EntityWithStatuses[] = ["leads", "dossiers", "quotes", "invoices"];

  const results = await Promise.all(
    entities.map((e) => getStatuses(e, db))
  );

  const statusesByEntity = Object.fromEntries(
    entities.map((e, i) => [e, results[i]])
  ) as Record<EntityWithStatuses, StatusDef[]>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres — Statuts</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Personnalisez les statuts pour chaque type d&apos;entité. Les statuts par défaut ne peuvent pas être supprimés.
        </p>
      </div>

      <StatusesTabs statusesByEntity={statusesByEntity} />
    </div>
  );
}
