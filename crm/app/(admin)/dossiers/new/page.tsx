import { getDb } from "@/lib/db";
import { DossierForm } from "@/components/dossier-form";

export default async function NewDossierPage() {
  const db = getDb();
  const contacts = await db.contact.findMany({
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true, companyName: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau dossier</h1>
        <p className="text-muted-foreground mt-1">
          Créez un nouveau dossier fiscal.
        </p>
      </div>
      <DossierForm contacts={contacts} />
    </div>
  );
}
