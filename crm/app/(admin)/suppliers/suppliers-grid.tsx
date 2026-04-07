"use client";

import { FilterableList } from "@/components/filterable-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BulkActionsBar,
  makeDeleteAction,
  makeExportAction,
} from "@/components/bulk-actions-bar";
import { bulkDeleteSuppliers, bulkExportSuppliers } from "./bulk-actions";
import { Mail, Phone, Globe, User, CheckSquare, Square } from "lucide-react";
import Link from "next/link";

type SupplierRow = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  role: string | null;
};

export function SuppliersGrid({ suppliers }: { suppliers: SupplierRow[] }) {
  return (
    <FilterableList
      items={suppliers}
      searchFields={["name", "contactName", "email", "role"]}
      columns={[]}
      getId={(s) => s.id}
      layout="cards"
      cardsClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      renderCard={(s, selected, onToggle) => (
        <div className="relative">
          <button
            type="button"
            onClick={onToggle}
            className="filterable-checkbox absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground transition-colors"
          >
            {selected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
          <Link href={`/suppliers/${s.id}`}>
            <Card className={`hover:border-primary/50 transition-all cursor-pointer h-full ${selected ? "border-primary/30 bg-primary/5" : ""}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between gap-2 mb-2 pr-6">
                  <div className="font-semibold text-sm leading-tight">{s.name}</div>
                  {s.role && <Badge variant="secondary" className="text-xs shrink-0">{s.role}</Badge>}
                </div>
                {s.contactName && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <User className="h-3 w-3" /> {s.contactName}
                  </div>
                )}
                <div className="space-y-1 mt-3">
                  {s.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {s.email}
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {s.phone}
                    </div>
                  )}
                  {s.website && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" /> {s.website}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
      searchPlaceholder="Rechercher par nom ou contact..."
      emptyMessage="Aucun fournisseur trouvé."
      bulkActions={(ids) => (
        <BulkActionsBar
          selectedIds={ids}
          actions={[
            makeDeleteAction(bulkDeleteSuppliers, "fournisseur"),
            makeExportAction(bulkExportSuppliers, "fournisseurs"),
          ]}
        />
      )}
    />
  );
}
