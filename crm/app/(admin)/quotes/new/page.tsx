import { getDb } from "@/lib/db";
import { getCatalog } from "@/lib/services";
import { QuoteForm } from "@/components/quote-form";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; contactId?: string }>;
}) {
  const { leadId, contactId: qContactId } = await searchParams;
  const db = getDb();

  const [contacts, catalog] = await Promise.all([
    db.contact.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true, companyName: true, country: true },
    }),
    getCatalog(),
  ]);

  // Pre-fill contact from lead or direct contactId param
  let defaultContactId: string | undefined;
  let defaultContactName: string | undefined;

  if (leadId) {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { contact: { select: { id: true, firstName: true, lastName: true, companyName: true } } },
    });
    if (lead?.contact) {
      defaultContactId = lead.contact.id;
      defaultContactName = `${lead.contact.firstName} ${lead.contact.lastName}${lead.contact.companyName ? ` · ${lead.contact.companyName}` : ""}`;
    }
  } else if (qContactId) {
    defaultContactId = qContactId;
    const contact = contacts.find((c) => c.id === qContactId);
    if (contact) {
      defaultContactName = `${contact.firstName} ${contact.lastName}${contact.companyName ? ` · ${contact.companyName}` : ""}`;
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau devis</h1>
        <p className="text-muted-foreground mt-1">
          Créez un devis pour un client.
        </p>
      </div>
      <QuoteForm
        contacts={contacts}
        catalog={catalog}
        defaultContactId={defaultContactId}
        defaultContactName={defaultContactName}
      />
    </div>
  );
}
