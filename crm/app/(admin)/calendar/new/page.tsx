import { getDb } from "@/lib/db";
import { AppointmentForm } from "@/components/appointment-form";

export default async function NewAppointmentPage() {
  const db = getDb();
  const [contacts, suppliers] = await Promise.all([
    db.contact.findMany({ orderBy: { lastName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
    db.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, contactName: true } }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau rendez-vous</h1>
      </div>
      <AppointmentForm contacts={contacts} suppliers={suppliers} />
    </div>
  );
}
