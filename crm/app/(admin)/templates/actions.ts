"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import type { OutreachChannel } from "@/lib/generated/prisma/client";

export async function createTemplate(formData: FormData) {
  const db = getDb();
  await db.outreachTemplate.create({
    data: {
      name: formData.get("name") as string,
      channel: formData.get("channel") as OutreachChannel,
      subject: (formData.get("subject") as string) || null,
      body: formData.get("body") as string,
      cardVersion: (formData.get("cardVersion") as string) || null,
    },
  });
  revalidatePath("/templates");
}

export async function updateTemplate(id: string, formData: FormData) {
  const db = getDb();
  await db.outreachTemplate.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      channel: formData.get("channel") as OutreachChannel,
      subject: (formData.get("subject") as string) || null,
      body: formData.get("body") as string,
      cardVersion: (formData.get("cardVersion") as string) || null,
    },
  });
  revalidatePath("/templates");
}

export async function deleteTemplate(id: string) {
  const db = getDb();
  await db.outreachTemplate.delete({ where: { id } });
  revalidatePath("/templates");
}
