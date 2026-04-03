# SOP : SEO & Blog

## Objectif

Maintenir et ameliorer le referencement naturel de caroline-finance.com, et alimenter le blog avec des articles optimises pour generer du trafic organique long terme.

## Prerequis

- Acces Google Search Console (propriete : caroline-finance.com)
- Acces Google Business Profile (caroline.charpentier.fessmann@gmail.com)
- Acces SSH au serveur (ssh caro-root → /var/www/caroline-finance/)
- Fichiers source locaux : `caro-services/website/`

## Etat actuel

### Fait

- sitemap.xml (16 URLs) + robots.txt
- HTTPS + canonical + hreflang (fr/en/x-default)
- Meta title/description/keywords optimises (mis a jour 2026-03-19)
- Schema.org : AccountingService, FAQPage (8 questions), AggregateRating (4.8/5, 6 avis)
- Open Graph + Twitter Cards
- Google Search Console verifie, sitemap soumise, URL indexee
- Google Business Profile cree
- Google Ads campagne active (3 variantes)
- 7 pages de services + 4 articles blog + 3 outils interactifs

### A faire

- Transferer Search Console + GBP a l'email de Caroline
- Collecter des avis Google reels (objectif : 15+)
- Bing Webmaster Tools
- Annuaires luxembourgeois (editus.lu, yellow.lu)
- Core Web Vitals (LCP, CLS, INP)
- Compression images

## Pipeline — Maintenance SEO mensuelle

### Etape 1 — Audit Search Console (1er du mois, 30 min)

1. Se connecter a Google Search Console
2. Verifier :
   - **Performances** : impressions, clics, CTR, position moyenne (vs mois precedent)
   - **Top requetes** : quelles requetes generent du trafic ?
   - **Couverture** : pages indexees, erreurs d'indexation
   - **Core Web Vitals** : LCP, CLS, INP — des pages en rouge ?
   - **Liens** : nouveaux backlinks ?
3. Noter les opportunites : requetes avec beaucoup d'impressions mais peu de clics (= CTR a ameliorer via meta description)

### Etape 2 — Suivi positions cles (1er du mois)

Verifier la position sur ces requetes cibles :

| Requete | Page ciblee | Objectif |
|---------|-------------|----------|
| declaration fiscale frontalier luxembourg | /declaration-fiscale-luxembourg/ | Top 5 |
| comptable frontalier france luxembourg | / | Top 10 |
| tva luxembourg independant | /tva-luxembourg/ | Top 10 |
| creation entreprise luxembourg | /creation-entreprise-luxembourg/ | Top 10 |
| comptes annuels luxembourg | /comptes-annuels-luxembourg/ | Top 10 |
| convention fiscale france luxembourg | /blog/convention-fiscale-france-luxembourg/ | Top 10 |
| calendrier fiscal luxembourg 2026 | /blog/calendrier-fiscal-luxembourg-2026/ | Top 5 |

### Etape 3 — Corrections techniques (si necessaire)

- Images non compressees → compresser avec `squoosh.app` ou `tinypng.com`
- Pages non indexees → verifier le robots.txt et le sitemap
- Erreurs 404 → creer des redirections
- Liens casses → corriger
- Cache-busting CSS → mettre a jour le query string (voir README deploy)

## Pipeline — Nouvel article blog

### Etape 1 — Recherche de sujet (mensuel)

Sources d'idees :
- Questions des clients (WhatsApp, formulaire)
- Questions frequentes Search Console (requetes sans page dediee)
- Actualite fiscale luxembourgeoise (ACD, Memorial)
- Forums frontaliers (frontaliers-magazine.lu, expatica.com)
- Commentaires TikTok/Instagram

Criteres de selection :
- Volume de recherche (verifier avec Google Trends ou Ubersuggest)
- Pertinence pour le public cible (frontaliers, independants, TPE)
- Concurrence (eviter les sujets deja tres bien couverts)

### Etape 2 — Redaction (2-4h par article)

**Structure standard** :

```html
<!-- Dans website/blog/titre-article/index.html -->
<article>
  <h1>Titre optimise (60 chars, mot-cle principal en debut)</h1>
  <p class="meta">Publie le JJ/MM/AAAA par Caroline Charpentier</p>

  <h2>Introduction</h2>
  <p>Contexte + promesse de l'article (2-3 phrases)</p>

  <h2>Section 1 — [Mot-cle secondaire]</h2>
  <p>Contenu detaille, listes, tableaux</p>

  <h2>Section 2 — [Mot-cle secondaire]</h2>
  <p>Contenu detaille</p>

  <h2>FAQ</h2>
  <!-- Schema FAQPage JSON-LD -->

  <h2>Conclusion</h2>
  <p>Resume + CTA ("Besoin d'aide ? Contactez Caroline")</p>
</article>
```

**Regles SEO** :
- Titre H1 unique, mot-cle principal en debut
- Meta description 150-160 chars avec mot-cle + benefice
- URL courte et descriptive (/blog/titre-sans-mots-inutiles/)
- Liens internes vers les pages de services concernees
- Schema FAQPage JSON-LD (3-5 questions)
- Traduction FR/EN (data-fr/data-en)
- Alt text descriptif sur les images

### Etape 3 — Publication

1. Creer le dossier `website/blog/titre-article/`
2. Creer `index.html` avec le template des sous-pages (utiliser `css/style.css`)
3. Mettre a jour `website/blog/index.html` (ajouter le lien vers le nouvel article)
4. Mettre a jour `website/sitemap.xml` (ajouter l'URL + date)
5. Deploy :
   ```bash
   rsync -avz --exclude='.DS_Store' website/ caro-root:/var/www/caroline-finance/
   ssh caro-root "chown -R www-data:www-data /var/www/caroline-finance/"
   ```
6. Verifier dans Google Search Console : demander l'indexation de la nouvelle URL

### Etape 4 — Promotion

1. Partager sur LinkedIn (post + lien article)
2. Story Instagram avec lien vers l'article
3. Video TikTok resumant l'article (30-60s)
4. Envoyer par WhatsApp aux clients concernes

## Prompts SEO tools (Claude Artifacts)

Des prompts pre-rediges existent pour generer des outils interactifs SEO (voir `docs/parasite-seo-prompts.md`) :
- Simulateur fiscal frontalier
- Checklist declaration fiscale
- Guide complet frontalier 2026

Ces outils generent du trafic qualifie et des backlinks.

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Position en baisse sur une requete cle | Verifier la concurrence, enrichir le contenu, ajouter des liens internes |
| Page non indexee | Verifier robots.txt, canonical, noindex accidentel. Forcer l'indexation dans Search Console |
| Core Web Vitals en rouge | Compresser images, supprimer JS inutile, optimiser le CSS |
| Contenu duplique detecte | Verifier les canonical, fusionner si deux pages couvrent le meme sujet |

## Checklist rapide mensuelle

- [ ] Audit Search Console effectue (performances, couverture, CWV)
- [ ] Positions requetes cles verifiees
- [ ] Corrections techniques appliquees (si necessaire)
- [ ] Nouvel article blog redige et publie (si planifie)
- [ ] Sitemap mis a jour
- [ ] Article promu (LinkedIn, Instagram, TikTok)
