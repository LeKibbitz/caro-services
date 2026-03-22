"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

export async function createQuote(formData: FormData) {
  const db = getDb();

  const contactId = formData.get("contactId") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const validUntilStr = formData.get("validUntil") as string;
  const validUntil = validUntilStr ? new Date(validUntilStr) : undefined;
  const itemsRaw = formData.get("items") as string;
  const items = JSON.parse(itemsRaw || "[]");

  const subtotal = items.reduce((sum: number, i: { total: number }) => sum + i.total, 0);
  const taxRate = Number(formData.get("taxRate")) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Generate quote number
  const year = new Date().getFullYear();
  const count = await db.quote.count({ where: { number: { startsWith: `D-${year}` } } });
  const number = `D-${year}-${String(count + 1).padStart(3, "0")}`;

  const quote = await db.quote.create({
    data: { contactId, number, items, subtotal, taxRate, taxAmount, total, validUntil, notes },
  });

  revalidatePath("/quotes");
  redirect(`/quotes/${quote.id}`);
}

export async function updateQuoteStatus(id: string, status: string) {
  const db = getDb();
  await db.quote.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
}

export async function convertQuoteToInvoice(quoteId: string) {
  const db = getDb();
  const quote = await db.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new Error("Devis introuvable");

  const year = new Date().getFullYear();
  const count = await db.invoice.count({ where: { number: { startsWith: `F-${year}` } } });
  const number = `F-${year}-${String(count + 1).padStart(3, "0")}`;

  const invoice = await db.invoice.create({
    data: {
      contactId: quote.contactId,
      quoteId: quote.id,
      number,
      items: quote.items as object,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: quote.notes,
    },
  });

  await db.quote.update({ where: { id: quoteId }, data: { status: "accepted" } });

  revalidatePath("/quotes");
  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}
