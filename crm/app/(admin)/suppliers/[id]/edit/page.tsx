import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { SupplierForm } from "@/components/supplier-form";
import { updateSupplier } from "../../actions";

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const supplier = await db.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Modifier — {supplier.name}</h1>
      <SupplierForm supplier={supplier} action={updateSupplier.bind(null, id)} />
    </div>
  );
}
