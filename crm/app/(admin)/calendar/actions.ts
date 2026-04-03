"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { AppointmentType } from "@/lib/generated/prisma/client";

export async function createAppointment(formData: FormData) {
  const db = getDb();
  const user = await getSession();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const contactId = (formData.get("contactId") as string) || undefined;
  const supplierId = (formData.get("supplierId") as string) || undefined;
  const startAt = new Date(formData.get("startAt") as string);
  const endAt = new Date(formData.get("endAt") as string);
  const location = (formData.get("location") as string) || undefined;
  const type = (formData.get("type") as AppointmentType) || "consultation";

  await db.appointment.create({
    data: {
      title,
      description,
      contactId: contactId || undefined,
      supplierId: supplierId || undefined,
      userId: user?.id,
      startAt,
      endAt,
      location,
      type,
    },
  });

  revalidatePath("/calendar");
  redirect("/calendar");
}
