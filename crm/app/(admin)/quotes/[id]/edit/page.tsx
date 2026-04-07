import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { QuoteForm } from "@/components/quote-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { updateQuote } from "../../actions";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const quote = await db.quote.findUnique({
    where: { id },
    include: { contact: true },
  });

  if (!quote) notFound();

  const header = (
    <div className="flex items-center gap-3">
      <Link href={`/quotes/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modifier le devis</h1>
        <p className="text-muted-foreground mt-0.5 text-sm font-mono">
          {quote.number}{" "}
          <span className="font-sans font-normal">
            · {quote.contact.firstName} {quote.contact.lastName}
          </span>
        </p>
      </div>
    </div>
  );

  // Full edit for draft quotes
  if (quote.status === "draft") {
    const contacts = await db.contact.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true, companyName: true, country: true },
    });

    const items = quote.items as { description: string; quantity: number; unitPrice: number; total: number }[];
    const contactName = `${quote.contact.firstName} ${quote.contact.lastName}${quote.contact.companyName ? ` · ${quote.contact.companyName}` : ""}`;

    return (
      <div className="max-w-3xl space-y-6">
        {header}
        <QuoteForm
          contacts={contacts}
          quoteId={id}
          initialContactId={quote.contactId}
          initialContactName={contactName}
          initialItems={items}
          initialTaxRate={Number(quote.taxRate)}
          initialNotes={quote.notes ?? ""}
          initialValidUntil={quote.validUntil ? new Date(quote.validUntil).toISOString().split("T")[0] : ""}
        />
      </div>
    );
  }

  // Simple edit (notes + validUntil) for non-draft quotes
  const validUntilValue = quote.validUntil
    ? new Date(quote.validUntil).toISOString().split("T")[0]
    : "";
  const action = updateQuote.bind(null, id);

  return (
    <div className="space-y-6 max-w-xl">
      {header}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Informations du devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valide jusqu&apos;au</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                defaultValue={validUntilValue}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={5}
                defaultValue={quote.notes ?? ""}
                placeholder="Notes internes sur ce devis..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Link href={`/quotes/${id}`}>
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
