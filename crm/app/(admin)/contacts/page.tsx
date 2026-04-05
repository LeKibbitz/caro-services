import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ExportButton } from "@/components/export-button";
import { ContactsTable } from "./contacts-table";

export default async function ContactsPage() {
  const db = getDb();

  const contacts = await db.contact.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { dossiers: true, invoices: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton entity="contacts" filters={{}} />
          <Link href="/contacts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contact
            </Button>
          </Link>
        </div>
      </div>

      <ContactsTable contacts={JSON.parse(JSON.stringify(contacts))} />
    </div>
  );
}
