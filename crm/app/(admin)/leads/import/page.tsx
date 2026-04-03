"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileJson, CheckCircle, AlertCircle, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { importLeadsAction, type ImportResult } from "./import-action";

interface SalonRow {
  name?: string;
  address?: string;
  phone?: string;
  owner_name?: string;
  owner_title?: string;
  owner_confidence?: string;
  owner_source?: string;
  rcs_number?: string;
  linkedin_url?: string;
  owner_notes?: string;
  source_url?: string;
  reviews_count?: number;
}

export default function LeadsImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<SalonRow[] | null>(null);

  function parseFile(file: File) {
    setError(null);
    setResult(null);
    setParsed(null);

    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setError("Seuls les fichiers JSON sont acceptés (export extension Salonkee).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) {
          setError("Le fichier doit contenir un tableau JSON d'objets.");
          return;
        }
        setParsed(data as SalonRow[]);
      } catch {
        setError("Fichier JSON invalide ou corrompu.");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await importLeadsAction(parsed);
      setResult(res);
      setParsed(null);
      setTimeout(() => router.push("/leads"), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const preview = parsed?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Importer des leads</h1>
          <p className="text-muted-foreground mt-1">
            Importez l&apos;export JSON de l&apos;extension Salonkee Prospector
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Comment faire</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>
            1. Dans l&apos;extension <strong className="text-foreground">Salonkee Prospector</strong>,
            cliquez <strong className="text-foreground">Envoyer au CRM</strong> — import automatique.
          </p>
          <p>
            2. Ou téléchargez l&apos;export JSON depuis l&apos;extension et déposez-le ci-dessous.
          </p>
          <p className="text-xs pt-1">
            Doublon détecté (même salon + adresse) → mise à jour, pas de doublon créé.
          </p>
        </CardContent>
      </Card>

      {/* Drop zone */}
      {!result && (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/40"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) parseFile(f);
          }}
          onClick={() => !parsed && fileInputRef.current?.click()}
        >
          <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FileJson className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Déposez le fichier JSON ici</p>
              <p className="text-sm text-muted-foreground mt-0.5">ou cliquez pour parcourir</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) parseFile(f);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Preview + confirm */}
      {parsed && !result && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Aperçu — {parsed.length} salons à importer</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setParsed(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              >
                Changer
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {preview.map((s, i) => (
              <div
                key={i}
                className="flex items-start justify-between text-sm gap-3 py-2 border-b last:border-0"
              >
                <div>
                  <span className="font-medium">{s.name ?? "—"}</span>
                  {s.address && (
                    <span className="text-muted-foreground ml-2 text-xs">{s.address}</span>
                  )}
                  {s.phone && (
                    <span className="text-muted-foreground ml-2 text-xs font-mono">{s.phone}</span>
                  )}
                </div>
                {s.owner_name && (
                  <div className="text-right shrink-0">
                    <span className="text-xs">{s.owner_name}</span>
                    {s.owner_confidence && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {s.owner_confidence}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
            {parsed.length > 5 && (
              <p className="text-xs text-muted-foreground pt-1">
                … et {parsed.length - 5} autres
              </p>
            )}
            <div className="pt-4">
              <Button onClick={handleImport} disabled={loading} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {loading ? "Import en cours..." : `Importer ${parsed.length} leads`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {result && (
        <Card>
          <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">Import réussi !</p>
              <p className="text-muted-foreground text-sm mt-1">
                {result.created} créés · {result.updated} mis à jour · {result.skipped} ignorés
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Redirection vers les leads...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
