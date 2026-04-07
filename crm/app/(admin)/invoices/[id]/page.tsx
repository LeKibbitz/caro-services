import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Receipt, Check, AlertTriangle, Pencil } from "lucide-react";
import Link from "next/link";
import { updateInvoiceStatus, deleteInvoice } from "../actions";
import { DeleteButton } from "@/components/delete-button";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { contact: true, quote: true },
  });

  if (!invoice) notFound();

  const items = invoice.items as { description: string; quantity: number; unitPrice: number; total: number }[];
  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status === "sent";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {invoice.number}
            </h1>
            <Badge
              variant={
                invoice.status === "paid"
                  ? "default"
                  : invoice.status === "overdue" || isOverdue
                    ? "destructive"
                    : "secondary"
              }
            >
              {invoice.status === "paid"
                ? "Payée"
                : isOverdue
                  ? "En retard"
                  : invoice.status === "sent"
                    ? "En cours"
                    : invoice.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            <Link
              href={`/contacts/${invoice.contact.id}`}
              className="hover:text-primary"
            >
              {invoice.contact.firstName} {invoice.contact.lastName}
            </Link>
            {" · "}
            {new Date(invoice.createdAt).toLocaleDateString("fr-FR")}
            {invoice.dueDate && (
              <>
                {" · Échéance : "}
                <span className={isOverdue ? "text-destructive font-medium" : ""}>
                  {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/invoices/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
          {invoice.status === "draft" && (
            <form action={updateInvoiceStatus.bind(null, id, "sent")}>
              <Button type="submit" variant="outline" size="sm">
                Marquer en cours
              </Button>
            </form>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <form action={updateInvoiceStatus.bind(null, id, "paid")}>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Check className="h-4 w-4 mr-2" />
                Marquer payée
              </Button>
            </form>
          )}
          {invoice.status === "sent" && isOverdue && (
            <form action={updateInvoiceStatus.bind(null, id, "overdue")}>
              <Button type="submit" variant="destructive" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Marquer en retard
              </Button>
            </form>
          )}
          <DeleteButton
            onDelete={deleteInvoice.bind(null, id)}
            redirectTo="/invoices"
            confirmMessage={`Supprimer la facture ${invoice.number} ? Cette action est irréversible.`}
          />
        </div>
      </div>

      {invoice.quote && (
        <div className="text-sm text-muted-foreground">
          Créée depuis le devis{" "}
          <Link href={`/quotes/${invoice.quote.id}`} className="font-mono hover:text-primary">
            {invoice.quote.number}
          </Link>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Détails
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
              <span className="font-mono">
                {Number(invoice.subtotal).toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                TVA ({Number(invoice.taxRate)}%)
              </span>
              <span className="font-mono">
                {Number(invoice.taxAmount).toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t">
              <span>Total</span>
              <span className="font-mono">
                {Number(invoice.total).toFixed(2)}€
              </span>
            </div>
          </div>

          {invoice.paidAt && (
            <div className="mt-3 text-sm text-emerald-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Payée le {new Date(invoice.paidAt).toLocaleDateString("fr-FR")}
              {invoice.paymentMethod && ` · ${invoice.paymentMethod}`}
            </div>
          )}
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
