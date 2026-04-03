import { ExternalLink, CreditCard } from "lucide-react";

const CARD_VERSIONS = [
  { id: "v1", name: "V1 — Signature minimale", style: "Épurée blanc, typographie fine, bande orange" },
  { id: "v2", name: "V2 — Bande latérale", style: "Barre orange gauche, grille contacts 2 colonnes" },
  { id: "v3", name: "V3 — Dark élégante", style: "Fond noir, accent orange, liseré supérieur" },
  { id: "v4", name: "V4 — Bicolore split", style: "Blanc + gris clair, grand chiffre watermark" },
  { id: "v5", name: "V5 — Orange bold", style: "Recto orange vif, nom blanc grand format" },
  { id: "v6", name: "V6 — Géométrique", style: "Formes géométriques, contraste fort" },
  { id: "v7", name: "V7 — Minimaliste ligne", style: "Trait fin séparateur, sobriété maximale" },
  { id: "v8", name: "V8 — Card shadow", style: "Ombre portée, effet carte en relief" },
  { id: "v9", name: "V9 — Gradient discret", style: "Gradient gris→blanc, subtil" },
  { id: "v10", name: "V10 — Typographique", style: "Jeu de tailles typographiques, hiérarchie marquée" },
  { id: "v11", name: "V11 — Coins arrondis XL", style: "Border-radius large, style app moderne" },
  { id: "v12", name: "V12 — Dégradé orange", style: "Fond dégradé orange→corail" },
  { id: "v13", name: "V13 — Sombre + orange", style: "Fond anthracite, détails orange" },
  { id: "v14", name: "V14 — Bordure fine", style: "Border fine orange tout autour" },
  { id: "v15", name: "V15 — Fond texturé", style: "Texture subtile, effet papier" },
  { id: "v16", name: "V16 — Split diagonal", style: "Diagonale orange/blanc, dynamique" },
  { id: "v17", name: "V17 — Initiales", style: "Grandes initiales CC en watermark" },
  { id: "v18", name: "V18 — Carré central", style: "Bloc central cadré, équilibré" },
  { id: "v19", name: "V19 — Compact dense", style: "Infos condensées, all-in-one" },
  { id: "v20", name: "V20 — Premium noir", style: "Full noir mat, QR blanc, prestige" },
];

export default function BusinessCardsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Cartes de visite
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            20 versions générées — choisissez-en une à joindre à vos messages
          </p>
        </div>
        <a
          href="/cartes-de-visite.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Voir toutes les cartes
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CARD_VERSIONS.map((card) => (
          <a
            key={card.id}
            href={`/cartes-de-visite.html#${card.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <div className="shrink-0 w-8 h-8 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
              {card.id.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">{card.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.style}</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Comment utiliser une carte ?</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Cliquez sur une version pour l'afficher dans le navigateur</li>
          <li>Faites une capture d'écran de la carte recto</li>
          <li>Joignez l'image dans votre message WhatsApp ou email</li>
        </ol>
      </div>
    </div>
  );
}
