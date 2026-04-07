# caro-services

## Description

Monorepo pour les services de Caroline Charpentier (caroline-finance.com) — site vitrine multi-pages (fiscalité et comptabilité Luxembourg), CRM clients, et landing pages historiques.

## Stack

- **website/** : HTML/CSS statique, Inter Tight, dark mode, i18n FR/EN, Schema.org
- **crm/** : Next.js + Prisma + Tailwind (a son propre CLAUDE.md)
- **landing/** / **landing-v2/** / **landing-v4/** : Next.js (versions historiques, exports statiques)

## Structure

```
website/               # Site prod caroline-finance.com (HTML/CSS statique)
crm/                   # CRM Next.js (voir crm/CLAUDE.md)
landing/               # Landing page v1 (Next.js, archivée)
landing-v2/            # Landing page v2 (archivée)
landing-v4/            # Landing page v4 (archivée)
livrables/             # Fichiers livrés au client
docs/                  # Documentation
bmad/                  # Specs BMAD
```

## Déploiement (website)

```bash
# VPS Caro (187.124.44.10) — nginx:alpine derrière Traefik
rsync -avz --exclude='.DS_Store' website/ caro-root:/var/www/caroline-finance/
ssh caro-root "chown -R www-data:www-data /var/www/caroline-finance/"
```

## Conventions

- Code en anglais, docs en français
- Accents français obligatoires sur tous les textes visibles
- Ne pas remplacer le CSS inline de la homepage par le CSS partagé

## Règles

- Tu éxécutes les commandes bsh/terminal
- Tu travailles en SSH sur le VPS Caro
- Pour utiliser Playwright, tu ouvres une session et je prends en charge les captchas et login/pwd. Tu ne tentes pas de te connecter
