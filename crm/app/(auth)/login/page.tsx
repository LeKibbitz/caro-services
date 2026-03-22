"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      if (data.devLink) setDevLink(data.devLink);
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.15_0.04_260)] via-[oklch(0.13_0.03_260)] to-[oklch(0.11_0.02_260)] p-4">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Caroline Finance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Accédez à votre espace client
          </p>
        </CardHeader>
        <CardContent className="pt-4 pb-8 px-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Vérifiez votre boîte mail
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Un lien de connexion a été envoyé à{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  <br />
                  Il expire dans 15 minutes.
                </p>
              </div>
              {devLink && (
                <a
                  href={devLink}
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Se connecter directement →
                </a>
              )}
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => { setSent(false); setDevLink(""); }}
              >
                Utiliser une autre adresse
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    Recevoir mon lien de connexion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Pas de mot de passe — un lien sécurisé vous est envoyé par
                email.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
