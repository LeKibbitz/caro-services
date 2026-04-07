"use client";

import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  entity: string;
  filters?: Record<string, string | undefined>;
  label?: string;
}

export function ExportButton({
  entity,
  filters,
  label = "Exporter",
}: ExportButtonProps) {
  function buildUrl(format: "csv" | "xlsx"): string {
    const params = new URLSearchParams({ format });
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    }
    return `/api/export/${entity}?${params.toString()}`;
  }

  function handleExport(format: "csv" | "xlsx") {
    window.location.href = buildUrl(format);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        <Download />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleExport("csv")}>
          <FileText />
          Exporter CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleExport("xlsx")}>
          <FileSpreadsheet />
          Exporter Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
