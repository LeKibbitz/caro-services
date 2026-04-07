"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2, Eye, EyeOff } from "lucide-react";
import { saveEmailSettings, testSmtp, testImap } from "./actions";

type TestState = "idle" | "loading" | "ok" | "error";

function TestButton({
  label,
  onTest,
}: {
  label: string;
  onTest: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const [state, setState] = useState<TestState>("idle");
  const [msg, setMsg] = useState("");

  async function run() {
    setState("loading");
    const r = await onTest();
    if (r.ok) {
      setState("ok");
      setMsg("Connexion OK");
    } else {
      setState("error");
      setMsg(r.error ?? "Erreur");
    }
    setTimeout(() => setState("idle"), 6000);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={run}
        disabled={state === "loading"}
      >
        {state === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
        ) : state === "ok" ? (
          <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
        ) : state === "error" ? (
          <X className="h-3.5 w-3.5 mr-1 text-destructive" />
        ) : null}
        {label}
      </Button>
      {msg && (
        <span className={`text-xs ${state === "ok" ? "text-emerald-600" : "text-destructive"}`}>
          {msg}
        </span>
      )}
    </div>
  );
}

function PasswordField({ name, placeholder }: { name: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder ?? "Nouveau mot de passe..."}
        className="text-sm pr-9"
        autoComplete="new-password"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

type PassSource = "db" | "env" | null;

function PassIndicator({ source }: { source: PassSource }) {
  if (source === "db") return <span className="ml-2 text-emerald-600 font-normal">● configuré</span>;
  if (source === "env") return <span className="ml-2 text-amber-600 font-normal">● par défaut (.env)</span>;
  return null;
}

export function EmailSettingsForm({
  smtpHost,
  smtpPort,
  smtpUser,
  imapHost,
  imapPort,
  smtpPassSource,
  imapPassSource,
}: {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  imapHost: string;
  imapPort: number;
  smtpPassSource: PassSource;
  imapPassSource: PassSource;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    await saveEmailSettings(fd);
    setSaved(true);
    setPending(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SMTP */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            SMTP — Envoi d&apos;emails
            <TestButton label="Tester SMTP" onTest={testSmtp} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hôte</Label>
              <Input value={smtpHost} disabled className="text-sm bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Port / Chiffrement</Label>
              <Input value={`${smtpPort} — SSL`} disabled className="text-sm bg-muted" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Adresse email (expéditeur)</Label>
            <Input
              name="smtpUser"
              defaultValue={smtpUser}
              placeholder="contact@caroline-finance.com"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Mot de passe SMTP
              <PassIndicator source={smtpPassSource} />
            </Label>
            <PasswordField name="smtpPass" />
          </div>
        </CardContent>
      </Card>

      {/* IMAP */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            IMAP — Réception / Sync emails
            <TestButton label="Tester IMAP" onTest={testImap} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hôte</Label>
              <Input value={imapHost} disabled className="text-sm bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Port / Chiffrement</Label>
              <Input value={`${imapPort} — SSL`} disabled className="text-sm bg-muted" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Mot de passe IMAP
              <PassIndicator source={imapPassSource} />
            </Label>
            <PasswordField name="imapPass" placeholder="Identique au SMTP en général" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {saved ? (
            <><Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Enregistré</>
          ) : pending ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Enregistrement…</>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </form>
  );
}
