"use client";

import { useState, useEffect } from "react";
import { CreditCard, ExternalLink, Star } from "lucide-react";

const CARD_VERSIONS = [
  { id: "v1", name: "V1 Signature" },
  { id: "v2", name: "V2 Bande latérale" },
  { id: "v3", name: "V3 Dark élégante" },
  { id: "v4", name: "V4 Bicolore" },
  { id: "v5", name: "V5 Orange bold" },
  { id: "v6", name: "V6 Géométrique" },
  { id: "v7", name: "V7 Ligne fine" },
  { id: "v8", name: "V8 Shadow" },
  { id: "v9", name: "V9 Gradient" },
  { id: "v10", name: "V10 Typo" },
  { id: "v11", name: "V11 Arrondi XL" },
  { id: "v12", name: "V12 Dégradé orange" },
  { id: "v13", name: "V13 Sombre orange" },
  { id: "v14", name: "V14 Bordure" },
  { id: "v15", name: "V15 Texturée" },
  { id: "v16", name: "V16 Diagonal" },
  { id: "v17", name: "V17 Initiales" },
  { id: "v18", name: "V18 Carré central" },
  { id: "v19", name: "V19 Compact" },
  { id: "v20", name: "V20 Premium noir" },
];

const LS_KEY = "cardFavorites";
const MAX_FAVORITES = 3;

export default function BusinessCardsPage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((f) => f !== id);
      } else if (prev.length < MAX_FAVORITES) {
        next = [...prev, id];
      } else {
        next = [...prev.slice(0, MAX_FAVORITES - 1), id];
      }
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Cartes de visite
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sélectionnez jusqu&apos;à {MAX_FAVORITES} favorites — elles apparaîtront en accès rapide dans vos messages
          </p>
        </div>
        <a
          href="/cartes-de-visite.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <ExternalLink className="h-4 w-4" />
          Galerie complète
        </a>
      </div>

      {favorites.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-medium text-primary mb-3 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-current" />
            Favorites ({favorites.length}/{MAX_FAVORITES}) — accès rapide dans les formulaires de message
          </p>
          <div className="flex gap-4 flex-wrap">
            {favorites.map((id) => {
              const card = CARD_VERSIONS.find((c) => c.id === id);
              return (
                <div key={id} className="text-center">
                  <img
                    src={`/cards/${id}.png`}
                    alt={card?.name}
                    className="w-44 h-auto rounded-md border-2 border-primary shadow-md"
                  />
                  <p className="text-xs text-primary font-medium mt-1.5">{card?.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CARD_VERSIONS.map((card) => {
          const isFav = favorites.includes(card.id);
          const favIndex = favorites.indexOf(card.id);
          return (
            <div
              key={card.id}
              onClick={() => toggleFavorite(card.id)}
              className={`group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                isFav
                  ? "border-primary shadow-md shadow-primary/20"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <img
                src={`/cards/${card.id}.png`}
                alt={card.name}
                className="w-full h-auto block"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {isFav && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow">
                  {favIndex + 1}
                </div>
              )}
              <div
                className={`absolute bottom-0 left-0 right-0 py-1.5 px-2 text-xs font-medium text-center transition-colors ${
                  isFav
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/90 text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {card.name}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center pb-4">
        Cliquez sur une carte pour l&apos;ajouter ou retirer des favorites · Max {MAX_FAVORITES} sélections
      </p>
    </div>
  );
}
