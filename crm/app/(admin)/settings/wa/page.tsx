"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

type Status = { connected: boolean; user: string | null; phone: string | null };

function QrImage() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    function refresh() {
      if (imgRef.current) {
        setError(false);
        imgRef.current.src = `/api/wa?path=qr-image&t=${Date.now()}`;
      }
    }
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <img
        ref={imgRef}
        src={`/api/wa?path=qr-image&t=${Date.now()}`}
        alt="WhatsApp QR Code"
        className={`rounded-xl border ${error ? "hidden" : ""}`}
        style={{ width: 280, height: 280 }}
        onError={() => setError(true)}
      />
      {error && (
        <div className="flex flex-col items-center justify-center w-[280px] h-[280px] rounded-xl border bg-muted/30 text-center gap-2">
          <p className="text-sm text-muted-foreground">QR non disponible</p>
          <p className="text-xs text-muted-foreground">Rafraîchissement dans quelques secondes…</p>
        </div>
      )}
    </div>
  );
}

export default function WaSettingsPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/wa?path=status", { cache: "no-store" });
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp — Connexion</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Compte WhatsApp de Caro pour l&apos;envoi depuis le CRM.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Statut
            <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.connected ? (
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="font-medium text-emerald-700">Connecté</div>
                <div className="text-sm text-muted-foreground">
                  {status.user} · +{status.phone}
                </div>
              </div>
              <Badge variant="outline" className="ml-auto text-emerald-600 border-emerald-300">
                Actif
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-amber-500" />
              <div>
                <div className="font-medium text-amber-700">
                  {status === null ? "Bridge inaccessible" : "Non connecté — scanner le QR"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {status === null
                    ? "Vérifiez que le service est démarré."
                    : "Ouvrez WhatsApp → Appareils liés → Lier un appareil"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {status !== null && !status.connected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-2">
              <QrImage />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              WhatsApp → Paramètres → Appareils liés → Lier un appareil
            </p>
            <p className="text-xs text-muted-foreground text-center">
              L&apos;image et le statut se rafraîchissent automatiquement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
