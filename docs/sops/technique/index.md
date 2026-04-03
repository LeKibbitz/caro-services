# Index Technique — caroline-finance.com

## Serveurs

| Serveur | IP | SSH | Role |
|---------|-----|-----|------|
| **VPS Caro** | 187.124.44.10 | `caro-root` / `caro-user` | Site + CRM + PostgreSQL |
| **VPS Hostinger (lk-hq)** | 148.230.117.35 | `vps-root` | caro-writer (3102), ancien — **NE PAS deployer le site ici** |

## Services

| Service | URL | Port | Stack |
|---------|-----|------|-------|
| Site statique | https://caroline-finance.com | 80/443 (Traefik) | nginx:alpine |
| CRM | https://crm.caroline-finance.com | 80/443 (Traefik) | Next.js 16 + PostgreSQL 16 |
| caro-writer (ancien) | http://148.230.117.35:3102 | 3102 | Flask (desactive pour le site prod) |

## Comptes et acces

| Service | Compte | Notes |
|---------|--------|-------|
| Google Search Console | caroline.charpentier.fessmann@gmail.com | A transferer a Caroline |
| Google Business Profile | caroline.charpentier.fessmann@gmail.com | A transferer a Caroline |
| Google Ads | caroline.charpentier.fessmann@gmail.com | Campagne active |
| CRM admin | Magic link → email admin | — |

## Domaines et DNS

| Domaine | Registrar | Pointe vers |
|---------|-----------|-------------|
| caroline-finance.com | (a verifier) | 187.124.44.10 |
| crm.caroline-finance.com | (sous-domaine) | 187.124.44.10 |

## Contact

| Personne | Role | Contact |
|----------|------|---------|
| Caroline Charpentier | Fondatrice | +352 661 521 101 / contact@caroline-finance.com |
| Thomas Joannes | Dev / Ops | (interne) |

## SOPs techniques

| SOP | Description |
|-----|-------------|
| [Website update](website-update.md) | Modifier le contenu du site — edit local + rsync |
| [CRM operations](crm-operations.md) | Gerer contacts, devis, dossiers, factures |
| [Deploy & maintenance](deploy-maintenance.md) | VPS, Docker, SSL, backups, monitoring |

## Fichiers source

| Composant | Chemin local |
|-----------|-------------|
| Site statique | `caro-services/website/` |
| CRM | `caro-services/crm/` |
| Tools (scraping, enrichment) | `caro-services/tools/` |
| Extension Chrome | `caro-services/salonkee-extension/` |
| Docs business | `caro-services/docs/` |
| SOPs | `caro-services/docs/sops/` |
