import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";

export default function NewLeadPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau lead</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Saisie manuelle</p>
        </div>
      </div>

      <LeadForm />
    </div>
  );
}
