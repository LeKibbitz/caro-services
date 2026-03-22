import { getDb } from "@/lib/db";
import { QuoteForm } from "@/components/quote-form";

export default async function NewQuotePage() {
  const db = getDb();
  const contacts = await db.contact.findMany({
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true, companyName: true },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau devis</h1>
        <p className="text-muted-foreground mt-1">
          Créez un devis pour un client.
        </p>
      </div>
      <QuoteForm contacts={contacts} />
    </div>
  );
}
