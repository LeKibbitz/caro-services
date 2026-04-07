# Session SEO — 6 avril 2026

## Contexte

Objectif : ameliorer le SEO de caroline-finance.com pour les requetes non-brandees, notamment "simulateur fiscal Luxembourg" et "fiduciaire Luxembourg". Le site etait invisible sur Google (zero resultat pour `site:caroline-finance.com`).

## Infrastructure decouverte

| Element | Detail |
|---------|--------|
| **VPS Caroline** | `187.124.44.10` (Hostinger KVM 1, Ubuntu + Docker + Traefik) |
| **VPS Thomas** | `148.230.117.35` (Hostinger KVM 2, Ubuntu + nginx) |
| **Site web** | Container Docker `caroline-finance` (nginx:alpine) derriere Traefik |
| **SSL** | Gere par Traefik + Let's Encrypt (certresolver) |
| **Fichiers** | `/var/www/caroline-finance/` sur le VPS 187.124.44.10 |
| **Docker compose** | `/docker/caroline-finance/docker-compose.yml` |
| **Acces SSH** | `ssh root@187.124.44.10` (cle depuis Mac 1) |
| **Dev local** | `/Users/thomasjoannes/projects/caro-services/website/` |
| **Copie Mac 2** | `~/projects/caro-services/website/` (sync rsync, pas de git) |

**IMPORTANT** : le VPS 148.230.117.35 n'heberge PAS caroline-finance.com. Le `/var/www/caro/` sur ce VPS est un ancien deploiement (probablement via `caro.lekibbitz.fr` redirect). Ne pas deployer la-bas.

## Audit SEO — problemes trouves et corriges

### Corriges (deployes en prod)

| # | Probleme | Correction | Impact |
|---|----------|------------|--------|
| 1 | Mot "fiduciaire" absent (1 mention sur 18 pages) | Meta keywords + meta descriptions + H1 + schema.org enrichis sur 18/18 pages | Signal semantique pour Google : Caroline = alternative fiduciaire |
| 2 | H1 homepage generique ("Une gestion claire et maitrisee") | Remplace par "Fiscalite et comptabilite au Luxembourg — l'alternative directe aux fiduciaires" | Cible les mots-cles primaires |
| 3 | H1 blog generique ("Articles et guides pratiques") | Remplace par "Blog fiscalite et comptabilite Luxembourg — guides et conseils" | Mots-cles dans le H1 |
| 4 | `/tva-luxembourg/` orpheline (zero liens internes) | 4 liens ajoutes au footer de 15 pages : Declaration, TVA, Comptes annuels, Simulateur | Plus aucune page orpheline |
| 5 | og:image manquante sur 17/18 pages | `og:image` + `og:image:alt` ajoutes partout | Vignette sur LinkedIn/WhatsApp/Facebook |
| 6 | og:site_name inconsistant ("Caroline" vs "Caro") | Unifie en "Caro Fiscalite & Comptabilite" | Branding coherent |
| 7 | og:locale inconsistant (fr_LU vs fr_FR) | Unifie en `fr_FR` | Coherence |
| 8 | CSS version mismatch (creation-entreprise) | Aligne sur `?v=1774950062` | Cache coherent |
| 9 | hreflang incomplet (1 tag sans x-default) | Supprime (pire qu'absent quand incomplet) | Evite signal confus |
| 10 | Schema.org homepage | `alternateName` + description enrichie "alternative aux fiduciaires" | Signal structured data |
| 11 | Meta keywords absentes sur 17/18 pages | Ajoutees avec termes cibles incluant "fiduciaire" | Signal pour Bing |

### NON corriges (a faire)

| # | Action | Priorite | Detail |
|---|--------|----------|--------|
| 1 | **Google Search Console** | CRITIQUE | Verifier si la propriete existe, soumettre le sitemap, demander indexation. Sans ca, Google ne voit rien. Compte Google a utiliser : probablement thomas.joannes@gmail.com |
| 2 | **Google Business Profile** | HAUTE | Fiche locale pour "Caroline Finance" a Luxembourg. Apparaitre dans le Knowledge Panel. Caroline doit creer (deja dans TODO.md) |
| 3 | **Page "Alternative fiduciaire Luxembourg"** | HAUTE | Page dediee `/alternative-fiduciaire-luxembourg/` — comparatif fiduciaire vs Caroline, prix, temoignages. Capterait "fiduciaire Luxembourg" (volume eleve) |
| 4 | **Simulateur fiscal generique** | MOYENNE | Etendre le simulateur frontalier aux residents/independants. "Simulateur fiscal Luxembourg" = requete tres populaire |
| 5 | **10-15 articles blog supplementaires** | MOYENNE | Autorite topique. Sujets : "fiduciaire vs comptable independant", "cout comptabilite Luxembourg", "teletravail frontalier 2026", etc. |
| 6 | **Backlinks** | BASSE | Inscription editus.lu, yellow.lu, guest posts lesfrontaliers.lu |
| 7 | **Cache-control nginx** | BASSE | Changer `no-cache, must-revalidate` → `public, max-age=3600` dans le nginx.conf du container Docker |
| 8 | **Bing Webmaster Tools** | BASSE | Soumettre sitemap a Bing aussi |

## Deploiement

**Commande de deploy (depuis Mac 1) :**
```bash
rsync -avz --exclude='.DS_Store' --exclude='backups/' --exclude='*.bak*' --exclude='v[0-9].html' --exclude='versions.html' --exclude='lk.html' --exclude='*.jpg' --exclude='style.css' \
  -e ssh /Users/thomasjoannes/projects/caro-services/website/ \
  root@187.124.44.10:/var/www/caroline-finance/
```

**Sync vers Mac 2 :**
```bash
rsync -avz -e ssh /Users/thomasjoannes/projects/caro-services/website/ mac2:~/projects/caro-services/website/
```

**Backup pre-SEO :** `/var/www/caroline-finance/backups/pre-seo-20260406/` sur le VPS Caroline

**Rollback si besoin :**
```bash
ssh root@187.124.44.10 "cp /var/www/caroline-finance/backups/pre-seo-20260406/index.html /var/www/caroline-finance/index.html"
```

## Rapports generes

- `docs/seo-audit-technique-2026-04-06.md` — rapport technique (Thomas)
- `docs/seo-rapport-caroline-2026-04-06.md` — rapport business (Caroline)
- `docs/session-seo-2026-04-06.md` — ce fichier (reprise session)

## Erreur de deploiement corrigee

En cours de session, le site a ete deploye par erreur sur le VPS Thomas (`148.230.117.35:/var/www/caro/`). Ce VPS sert `caro.lekibbitz.fr` qui redirige vers `caroline-finance.com`. Le deploiement errone a ete nettoye et l'ancien `index.html` restaure. La config nginx a aussi ete restauree (un agent avait ajoute un block `.well-known/acme-challenge`).

## Autre — Claw Mac 2

Pendant cette session, claw sur Mac 2 avait l'erreur "assistant stream produced no content". Cause : binaire obsolete (4 commits en retard). Fix : `git pull origin main` + `cargo build -p rusty-claude-cli`. Rebuild OK.
