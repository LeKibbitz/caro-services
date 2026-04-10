# Caroline Fiscalité & Comptabilité

Site vitrine multi-pages pour **Caroline Charpentier** — spécialiste en fiscalité et comptabilité au Luxembourg, accompagnement des frontaliers France-Luxembourg, résidents, indépendants et TPE/PME.

**[caroline-finance.com](https://caroline-finance.com)**

---

## Architecture

Site statique HTML/CSS servi par **nginx:alpine** derrière **Traefik** (SSL Let's Encrypt).

```
VPS Caro (187.124.44.10)
├── Traefik (reverse proxy, SSL, HTTP→HTTPS, www→non-www)
└── Container nginx:alpine "caroline-finance"
    └── /var/www/caroline-finance/
```

## Pages

| URL | Description |
|-----|-------------|
| `/` | Page d'accueil — hero, services, tarifs, avis, contact |
| `/frontaliers-france-luxembourg/` | Obligations fiscales des frontaliers France-Luxembourg |
| `/residents-luxembourg/` | Obligations fiscales des résidents luxembourgeois |
| `/comptabilite-independants-luxembourg/` | Obligations comptables et fiscales des indépendants |
| `/creation-entreprise-luxembourg/` | Obligations comptables et fiscales des TPE/PME |
| `/declaration-fiscale-luxembourg/` | Déclaration fiscale Luxembourg (modèle 100) |
| `/tva-luxembourg/` | TVA Luxembourg — taux, déclaration, immatriculation |
| `/comptes-annuels-luxembourg/` | Comptes annuels — bilan, dépôt RCS |
| `/blog/` | Index des articles |
| `/blog/calendrier-fiscal-luxembourg-2026/` | Calendrier fiscal 2026 |
| `/blog/convention-fiscale-france-luxembourg/` | Convention fiscale bilatérale en détail |
| `/blog/documents-declaration-fiscale-frontalier/` | Checklist documents frontalier |
| `/blog/tva-intracom-luxembourg/` | TVA intracommunautaire |

## Stack technique

- **HTML/CSS** statique (pas de framework JS)
- **Inter Tight** (Google Fonts) — design Awwwards-inspired
- **Dark mode** + **traduction FR/EN** (`data-fr`/`data-en` + `setLang()`)
- **Schema.org** (AccountingService, FAQPage, BreadcrumbList)
- **SEO** : sitemap.xml, robots.txt, canonical, Open Graph, Twitter Cards

## Design system

| Élément | Valeur |
|---------|--------|
| Police | Inter Tight (fw300 default) |
| Couleur primaire | `#222` |
| Couleur accent | `#FA5D29` (orange) |
| Background | `#F8F8F8` |
| Border radius | `8px` (cards), `72px` (pills) |

### CSS : deux systèmes

- **Homepage** (`index.html`) : CSS inline complet (~1300 lignes), classes `header-*`, `hero-*`, `section`, `reveal`
- **Sous-pages** : CSS partagé `css/style.css`, classes `hd`, `sc`, `rv`, `w`

> **Ne pas remplacer le CSS inline de la homepage par le CSS partagé** — les deux systèmes utilisent des noms de classes et des variables différents. Trois tentatives ont cassé la page.

## Déploiement

```bash
# Copier les fichiers sur le VPS
scp -r website/* caro-root:/var/www/caroline-finance/

# Ou via rsync
rsync -avz --exclude='.DS_Store' website/ caro-root:/var/www/caroline-finance/

# Fixer les permissions
ssh caro-root "chown -R www-data:www-data /var/www/caroline-finance/"
```

Le container nginx sert les fichiers depuis `/var/www/caroline-finance/` (volume monté en read-only).

## Cache-busting

Le CSS partagé est chargé avec un query string de version :

```html
<link rel="stylesheet" href="/css/style.css?v=1774190078">
```

Après modification du CSS, mettre à jour le timestamp sur toutes les pages :

```bash
BUST=$(date +%s)
ssh caro-root "find /var/www/caroline-finance -name 'index.html' \
  -exec sed -i 's|/css/style.css?v=[0-9]*|/css/style.css?v=${BUST}|g' {} \;"
```

## Workflow n8n (CCServices)

Le workflow LK-HQ Inbox (`K8hViG1lVtQqfJw6` sur lkhq.lekibbitz.fr) contient une branche CCServices qui permettait à Caroline de modifier le site via WhatsApp + Claude Haiku.

**Statut actuel : désactivé** (node `CCS Handler` disabled) — Claude Haiku avait tronqué le fichier HTML, causant une page blanche.

## Contact

- **Email** : contact@caroline-finance.com
- **WhatsApp** : +352 661 521 101
- **LinkedIn** : [Caroline Fiscalité & Comptabilité](https://www.linkedin.com/company/112325253/)
- **X** : [@Caro_Finance](https://x.com/Caro_Finance)
- **TikTok** : [@caroline_finance](https://www.tiktok.com/@caroline_finance)

---

*Projet géré par [Le Kibbitz](https://lekibbitz.fr) — Thomas Joannès*
