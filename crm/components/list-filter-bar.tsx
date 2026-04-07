"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusOption = { value: string; label: string; color?: string };

type Props = {
  basePath: string;
  searchPlaceholder?: string;
  statusOptions?: StatusOption[];
  currentQ?: string;
  currentStatus?: string;
  className?: string;
};

export function ListFilterBar({
  basePath,
  searchPlaceholder = "Rechercher...",
  statusOptions,
  currentQ,
  currentStatus,
  className,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const storageKey = `filter_${basePath}`;

  // Input value is initialised from the server-provided prop (hydration safe).
  const [inputValue, setInputValue] = useState(currentQ ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialised = useRef(false);

  // On mount: if URL has no params, restore from localStorage and redirect.
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    if (searchParams.get("q") || searchParams.get("status")) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const { q: sq, status: ss } = JSON.parse(saved) as {
        q?: string;
        status?: string;
      };
      if (!sq && !ss) return;
      const params = new URLSearchParams();
      if (sq) params.set("q", sq);
      if (ss) params.set("status", ss);
      const qs = params.toString();
      if (qs) router.replace(`${pathname}?${qs}`);
    } catch {
      // ignore localStorage errors
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage whenever filters change.
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ q: currentQ, status: currentStatus })
      );
    } catch {
      // ignore localStorage errors
    }
  }, [currentQ, currentStatus, storageKey]);

  // Keep input in sync when navigating back/forward (currentQ changes).
  useEffect(() => {
    setInputValue(currentQ ?? "");
  }, [currentQ]);

  function buildParams(overrides: {
    q?: string | null;
    status?: string | null;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    if (overrides.q !== undefined) {
      if (overrides.q) params.set("q", overrides.q);
      else params.delete("q");
    }
    if (overrides.status !== undefined) {
      if (overrides.status) params.set("status", overrides.status);
      else params.delete("status");
    }
    return params;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Searching resets status filter.
      const params = buildParams({ q: value || null, status: null });
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  function handleStatusClick(value: string) {
    // Clicking the active badge clears it.
    const next = currentStatus === value ? null : value;
    const params = buildParams({ status: next });
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputValue("");
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    router.push(pathname);
  }

  const hasActiveFilters = Boolean(currentQ || currentStatus);

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={searchPlaceholder}
          className="h-9 pl-8 w-56"
        />
      </div>

      {/* Status badges */}
      {statusOptions && statusOptions.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {statusOptions.map((opt) => {
            const isActive = currentStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusClick(opt.value)}
                className={cn(
                  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Clear button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X />
          Effacer
        </Button>
      )}
    </div>
  );
}
