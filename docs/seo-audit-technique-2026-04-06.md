# Audit SEO caroline-finance.com — Rapport technique

**Date :** 6 avril 2026
**Auditeur :** Thomas (via Claude)
**Scope :** 18 pages HTML statiques, infrastructure nginx/VPS

---

## Etat initial : problemes identifies

### CRITIQUE — Le site n'est pas indexe par Google

`site:caroline-finance.com` renvoie zero resultat dans Google. Le site existe (18 pages, sitemap correct, robots.txt OK, aucun noindex) mais n'apparait pas dans l'index.

**Cause probable :** site trop recent (premiere publication ~22 mars 2026), aucun backlink, pas de Google Search Console configuree.

**Action requise (hors scope de cet audit) :**
1. Creer un compte Google Search Console et verifier le domaine
2. Soumettre le sitemap manuellement
3. Demander l'indexation des pages prioritaires
4. Creer un Google Business Profile pour Caroline Finance

### CRITIQUE — Le mot "fiduciaire" absent du site

Le terme "fiduciaire" — mot-cle #1 des concurrents (cabexco.lu, fiduciaire-lpg.lu, fidlux.lu) — n'apparaissait que 1 seule fois sur tout le site (en mention generique sur la page TVA). Les gens qui cherchent "fiduciaire Luxembourg" ne pouvaient pas trouver Caroline.

### HAUTE — Pages orphelines (zero liens internes)

- `/tva-luxembourg/` : **zero** pages pointaient vers elle
- `/declaration-fiscale-luxembourg/` : seulement 3 liens entrants
- `/comptes-annuels-luxembourg/` : seulement 2 liens entrants
- `/outils/simulateur-frontalier/` : seulement 3 liens entrants

Ces pages ne recevaient aucune autorite PageRank du maillage interne.

### HAUTE — Balises Open Graph incompletes

17 pages sur 18 n'avaient pas de `og:image` — les partages sur LinkedIn, WhatsApp, Facebook affichaient une vignette vide.

### MOYENNE — H1 sans mots-cles

- Homepage H1 : "Une gestion fiscale et comptable claire et maitrisee" — zero mot-cle cible
- Blog index H1 : "Articles et guides pratiques" — completement generique

### MOYENNE — Inconsistances techniques

- `og:site_name` : "Caroline" sur la homepage vs "Caro" partout ailleurs
- `og:locale` : `fr_LU` sur la homepage vs `fr_FR` partout ailleurs
- CSS version mismatch : `creation-entreprise-luxembourg` chargeait `?v=1775000003`, toutes les autres `?v=1774950062`
- `hreflang` incomplet : seule la homepage avait un tag hreflang, sans `x-default` ni langue alternative

### BASSE — Pas de meta keywords sur 17/18 pages

Google ignore les meta keywords, mais Bing les utilise encore.

---

## Corrections appliquees (ce commit)

### 1. Meta keywords sur les 18 pages

Chaque page a maintenant un `<meta name="keywords">` avec des termes cibles incluant :
- Le mot "fiduciaire" et "alternative fiduciaire" sur CHAQUE page
- Des mots-cles specifiques au sujet de la page
- Des variantes de recherche longue traine

### 2. Meta descriptions enrichies avec "fiduciaire"

Chaque page de service a sa meta description enrichie avec une mention "fiduciaire" :
- "Alternative aux fiduciaires" (homepage)
- "Alternative personnalisee aux fiduciaires" (frontaliers)
- "Sans fiduciaire — assistance directe" (declaration, comptes annuels)
- "Alternative fiduciaire pour SARL et SA" (TPE/PME)

### 3. og:image sur les 18 pages

Toutes les pages ont maintenant `og:image` pointant vers `caro-profile.jpg` avec un `og:image:alt` contextuel.

### 4. og:site_name unifie

Toutes les pages utilisent maintenant "Caro Fiscalite & Comptabilite" et `fr_FR`.

### 5. Maillage interne : 4 liens ajoutes au footer de 15 pages

Le footer contient maintenant les liens vers :
- `/declaration-fiscale-luxembourg/`
- `/tva-luxembourg/`
- `/comptes-annuels-luxembourg/`
- `/outils/simulateur-frontalier/`

=> Zero page orpheline restante.

### 6. H1 optimises

- **Homepage** : "Fiscalite et comptabilite au Luxembourg — l'alternative directe aux fiduciaires"
  - Integre les mots-cles primaires + le positionnement anti-fiduciaire
- **Blog index** : "Blog fiscalite et comptabilite Luxembourg — guides et conseils"
  - Inclut les mots-cles au lieu d'un titre generique

### 7. Schema.org enrichi (homepage)

- `description` du schema AccountingService enrichie avec "alternative aux fiduciaires"
- `alternateName` ajoute : "Caro Fiscalite — Alternative fiduciaire Luxembourg"

### 8. Corrections techniques

- CSS version mismatch corrige (creation-entreprise)
- hreflang incomplet supprime (pire qu'absent quand incomplet)
- 5 pages blog manquaient `og:site_name` → corrige

---

## Reste a faire (hors scope actuel)

### Actions immediates (Thomas)
1. **Google Search Console** — creer, verifier, soumettre sitemap
2. **Google Business Profile** — creer pour "Caroline Finance" a Luxembourg
3. **Cache-control nginx** — changer `no-cache, must-revalidate` en `public, max-age=3600` pour HTML, `max-age=31536000, immutable` pour CSS/JS
4. **Security headers nginx** — ajouter `X-Content-Type-Options: nosniff`, `charset=utf-8`

### Nouvelles pages recommandees (voir rapport Caroline)
1. `/alternative-fiduciaire-luxembourg/` — page dedicace
2. Simulateur fiscal generique (pas que frontalier)
3. 10-15 articles de blog supplementaires pour l'autorite topique
4. Comparatif fiduciaire vs comptable independant

### Backlinks
1. Inscription editus.lu, yellow.lu
2. Profil Google Business
3. Guest posts lesfrontaliers.lu / frontaliers-grandest.eu

---

## Metriques a suivre

| Metrique | Outil | Objectif 3 mois |
|----------|-------|-----------------|
| Pages indexees | Search Console | 18/18 |
| Impressions "fiduciaire Luxembourg" | Search Console | >100/mois |
| Clics non-brandes | Search Console | >50/mois |
| Position "simulateur fiscal Luxembourg" | Search Console | Top 20 |
| Position "alternative fiduciaire Luxembourg" | Search Console | Top 10 |
