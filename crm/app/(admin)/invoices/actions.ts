"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

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
