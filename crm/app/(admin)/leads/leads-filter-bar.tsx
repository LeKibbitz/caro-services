"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

const STORAGE_KEY = "leads_filters";

interface LeadsFilterBarProps {
  q: string | undefined;
  status: string | undefined;
  statuses: Array<{ value: string; label: string }>;
}

export function LeadsFilterBar({ q, status, statuses }: LeadsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialised = useRef(false);

  // On mount: if no URL params, restore from localStorage
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    if (searchParams.get("q") || searchParams.get("status")) return; // URL has params, use them
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const { q: sq, status: ss } = JSON.parse(saved) as { q?: string; status?: string };
      if (!sq && !ss) return;
      const params = new URLSearchParams();
      if (sq) params.set("q", sq);
      if (ss && ss !== "all") params.set("status", ss);
      const qs = params.toString();
      if (qs) router.replace(`/leads?${qs}`);
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage whenever filters change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ q, status }));
    } catch {}
  }, [q, status]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newQ = (fd.get("q") as string) || undefined;
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (status && status !== "all") params.set("status", status);
    router.push(`/leads?${params.toString()}`);
  }

  function setStatus(newStatus: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (newStatus && newStatus !== "all") params.set("status", newStatus);
    router.push(`/leads?${params.toString()}`);
  }

  const activeStatus = status || "all";

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="q" placeholder="Salon, gérant, adresse..." defaultValue={q} className="pl-9" />
            </div>
            <button type="submit" className="sr-only">Rechercher</button>
          </form>
          <div className="flex flex-wrap gap-1">
            {statuses.map((s) => (
              <Badge
                key={s.value}
                variant={activeStatus === s.value ? "default" : "secondary"}
                className="cursor-pointer text-xs"
                onClick={() => setStatus(s.value)}
              >
                {s.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
