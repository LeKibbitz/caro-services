"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

type ScrapeJob = {
  id: string;
  source: string;
  config: Record<string, unknown>;
  status: string;
  progress: number;
  total: number;
  phase: string | null;
  resultCount: number | null;
  errorLog: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

const SOURCE_OPTIONS = [
  { value: "salonkee", label: "Salonkee", description: "Salons de beauté sur salonkee.lu" },
  { value: "frontaliers-forum", label: "Forum lesfrontaliers.lu", description: "Questions fiscalité / emploi" },
  { value: "frontaliers-annonces", label: "Petites annonces", description: "Annonces lesfrontaliers.lu" },
];

const FORUM_CATEGORIES = [
  { value: "fiscalite", label: "Fiscalité" },
  { value: "emploi", label: "Emploi" },
  { value: "vie-quotidienne", label: "Vie quotidienne" },
];

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "outline" },
  running: { label: "En cours", variant: "secondary" },
  done: { label: "Terminé", variant: "default" },
  failed: { label: "Échoué", variant: "destructive" },
};

export function ScrapeLauncher() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState("salonkee");
  const [maxPages, setMaxPages] = useState(10);
  const [forumCategory, setForumCategory] = useState("fiscalite");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    const res = await fetch("/api/scrape/jobs");
    if (res.ok) setJobs(await res.json());
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Poll active job
  useEffect(() => {
    if (!activeJobId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/scrape/${activeJobId}/status`);
      if (!res.ok) return;
      const job = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
      if (job.status === "done" || job.status === "failed") {
        setActiveJobId(null);
        fetchJobs();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeJobId, fetchJobs]);

  async function handleLaunch() {
    setLoading(true);
    const config: Record<string, unknown> = { maxPages };
    if (selectedSource.startsWith("frontaliers")) {
      config.category = forumCategory;
    }

    const res = await fetch("/api/scrape/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: selectedSource, config }),
    });

    if (res.ok) {
      const { id } = await res.json();
      setActiveJobId(id);
      await fetchJobs();
    }
    setLoading(false);
  }

  function formatDuration(start: string | null, end: string | null) {
    if (!start) return "—";
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const sec = Math.round((e - s) / 1000);
    if (sec < 60) return `${sec}s`;
    return `${Math.floor(sec / 60)}m${sec % 60}s`;
  }

  return (
    <div className="space-y-6">
      {/* Launcher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lancer un scrape</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedSource(opt.value)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selectedSource === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
              </button>
            ))}
          </div>

          <div className="flex items-end gap-4">
            {selectedSource.startsWith("frontaliers") && (
              <div className="space-y-1.5">
                <Label className="text-xs">Catégorie</Label>
                <select
                  value={forumCategory}
                  onChange={(e) => setForumCategory(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  {FORUM_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Pages max</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="h-9 w-24"
              />
            </div>
            <Button onClick={handleLaunch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Lancer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active job progress */}
      {activeJobId && (() => {
        const job = jobs.find((j) => j.id === activeJobId);
        if (!job || job.status === "done" || job.status === "failed") return null;
        const pct = job.total > 0 ? Math.round((job.progress / job.total) * 100) : 0;
        return (
          <Card className="border-primary/20">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Scrape en cours...</span>
                {job.phase && <span className="text-xs text-muted-foreground">{job.phase}</span>}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {job.progress} / {job.total} ({pct}%)
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Job history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Historique</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchJobs}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Aucun scrape effectué.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium text-center">Résultats</th>
                  <th className="px-4 py-3 font-medium">Durée</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const sb = STATUS_BADGE[job.status] ?? STATUS_BADGE.pending;
                  return (
                    <tr key={job.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{job.source}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {job.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                          {job.status === "done" && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          {job.status === "failed" && <XCircle className="h-3 w-3 text-destructive" />}
                          {job.status === "pending" && <Clock className="h-3 w-3 text-muted-foreground" />}
                          <Badge variant={sb.variant}>{sb.label}</Badge>
                        </div>
                        {job.phase && <span className="text-xs text-muted-foreground block mt-0.5">{job.phase}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-mono">
                        {job.resultCount ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDuration(job.startedAt, job.finishedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString("fr-FR")}{" "}
                        {new Date(job.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
