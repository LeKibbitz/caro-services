import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { updateInvoice } from "../../actions";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { contact: true },
  });

  if (!invoice) notFound();

  const dueDateValue = invoice.dueDate
    ? new Date(invoice.dueDate).toISOString().split("T")[0]
    : "";

  const action = updateInvoice.bind(null, id);

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href={`/invoices/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modifier la facture</h1>
          <p className="text-muted-foreground mt-0.5 text-sm font-mono">
            {invoice.number}{" "}
            <span className="font-sans font-normal">
              · {invoice.contact.firstName} {invoice.contact.lastName}
            </span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Informations de la facture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d&apos;échéance</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={dueDateValue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <Input
                id="paymentMethod"
                name="paymentMethod"
                defaultValue={invoice.paymentMethod ?? ""}
                placeholder="Virement, chèque, espèces..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={5}
                defaultValue={invoice.notes ?? ""}
                placeholder="Notes internes sur cette facture..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href={`/invoices/${id}`}>
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
