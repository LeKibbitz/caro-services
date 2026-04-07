import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { updateQuoteStatus, convertQuoteToInvoice, deleteQuote } from "../actions";
import { SendQuoteButton } from "./send-quote-button";
import { DeleteButton } from "@/components/delete-button";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  rejected: "Refusé",
  expired: "Expiré",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const quote = await db.quote.findUnique({
    where: { id },
    include: { contact: true, invoices: true },
  });

  if (!quote) notFound();

  const items = quote.items as { description: string; quantity: number; unitPrice: number; total: number }[];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {quote.number}
            </h1>
            <Badge>{STATUS_LABELS[quote.status] ?? quote.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            <Link href={`/contacts/${quote.contact.id}`} className="hover:text-primary">
              {quote.contact.firstName} {quote.contact.lastName}
            </Link>
            {" · "}
            {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/quotes/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <SendQuoteButton
            quoteNumber={quote.number}
            contactEmail={quote.contact.email}
            contactPhone={quote.contact.phone}
            total={Number(quote.total)}
            items={items}
          />
          {quote.status === "draft" && (
            <form action={updateQuoteStatus.bind(null, id, "sent")}>
              <Button type="submit" variant="outline" size="sm">
                Marquer envoyé
              </Button>
            </form>
          )}
          {quote.status !== "rejected" && quote.status !== "expired" &&
            quote.invoices.length === 0 && (
              <form action={convertQuoteToInvoice.bind(null, id)}>
                <Button type="submit" size="sm">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convertir en facture
                </Button>
              </form>
            )}
          <DeleteButton
            onDelete={deleteQuote.bind(null, id)}
            redirectTo="/quotes"
            confirmMessage={`Supprimer le devis ${quote.number} ? Cette action est irréversible.`}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Lignes du devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 text-left font-medium">Description</th>
                <th className="py-2 text-right font-medium w-16">Qté</th>
                <th className="py-2 text-right font-medium w-28">Prix unit.</th>
                <th className="py-2 text-right font-medium w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2.5">{item.description}</td>
                  <td className="py-2.5 text-right font-mono">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono">
                    {item.unitPrice.toFixed(2)}€
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold">
                    {item.total.toFixed(2)}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Separator className="my-3" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-mono">{Number(quote.subtotal).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                TVA ({Number(quote.taxRate)}%)
              </span>
              <span className="font-mono">
                {Number(quote.taxAmount).toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t">
              <span>Total</span>
              <span className="font-mono">{Number(quote.total).toFixed(2)}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {quote.notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {quote.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {quote.invoices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Factures liées</CardTitle>
          </CardHeader>
          <CardContent>
            {quote.invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between text-sm py-1 hover:text-primary"
              >
                <span className="font-mono">{inv.number}</span>
                <Badge variant={inv.status === "paid" ? "default" : "secondary"}>
                  {inv.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
