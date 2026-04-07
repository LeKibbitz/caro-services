"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

export async function updateInvoice(id: string, formData: FormData) {
  const db = getDb();
  const dueDateStr = formData.get("dueDate") as string;
  await db.invoice.update({
    where: { id },
    data: {
      notes: (formData.get("notes") as string) || null,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      paymentMethod: (formData.get("paymentMethod") as string) || null,
    },
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const db = getDb();
  const data: Record<string, unknown> = { status };

  if (status === "paid") {
    data.paidAt = new Date();
  }

  await db.invoice.update({ where: { id }, data: data as never });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoice(id: string): Promise<{ error?: string }> {
  const db = getDb();
  await db.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  return {};
}
