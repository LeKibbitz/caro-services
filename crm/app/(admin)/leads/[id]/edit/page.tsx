import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const lead = await db.lead.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      activityType: true,
      address: true,
      phone: true,
      email: true,
      ownerName: true,
      ownerTitle: true,
      notes: true,
    },
  });

  if (!lead) notFound();

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href={`/leads/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modifier le lead</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{lead.displayName}</p>
        </div>
      </div>

      <LeadForm lead={lead} />
    </div>
  );
}
