import { getDb } from "@/lib/db";
import { AppointmentForm } from "@/components/appointment-form";

export default async function NewAppointmentPage() {
  const db = getDb();
  const contacts = await db.contact.findMany({
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau rendez-vous</h1>
      </div>
      <AppointmentForm contacts={contacts} />
    </div>
  );
}
