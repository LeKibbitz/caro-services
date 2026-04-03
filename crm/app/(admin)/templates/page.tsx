import { getDb } from "@/lib/db";
import { TemplateList } from "./template-list";

export default async function TemplatesPage() {
  const db = getDb();
  const templates = await db.outreachTemplate.findMany({
    orderBy: [{ channel: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modèles de messages</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Variables disponibles : <code className="bg-muted px-1 rounded text-xs">[Prénom]</code>{" "}
          <code className="bg-muted px-1 rounded text-xs">[Nom]</code>{" "}
          <code className="bg-muted px-1 rounded text-xs">[Salon]</code>
        </p>
      </div>
      <TemplateList templates={templates} />
    </div>
  );
}
