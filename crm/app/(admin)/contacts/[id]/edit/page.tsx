import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { ContactForm } from "@/components/contact-form";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const contact = await db.contact.findUnique({ where: { id } });
  if (!contact) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Modifier {contact.firstName} {contact.lastName}
        </h1>
      </div>
      <ContactForm contact={contact} />
    </div>
  );
}
