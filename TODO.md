# TODO - caro-services

## Git
- [x] Commit website v1.0.0

## Qualite
- [x] Ajouter un .gitignore

## Taches
- [x] Site multi-pages déployé (13 URLs)
- [x] SEO : sitemap.xml, robots.txt, Schema.org, canonical, OG tags
- [x] Redirection www → non-www (Traefik)
- [x] Header unifié homepage + sous-pages
- [x] Traduction FR/EN complète (717 éléments)
- [x] Sticky CTA bar thématique par sous-page
- [x] Réseaux sociaux mis à jour (LinkedIn company, X, TikTok)
- [x] Branche CCServices n8n désactivée (sécurité)
- [x] SEO audit complet + corrections (session 2026-04-06) — voir docs/session-seo-2026-04-06.md
- [x] "fiduciaire" integre sur 18/18 pages (meta, keywords, H1, schema)
- [x] Maillage interne corrige (zero page orpheline)
- [x] og:image sur 18/18 pages
- [ ] Google Search Console — verifier propriete + soumettre sitemap (CRITIQUE)
- [x] Google Business Profile (existe déjà)
- [ ] Pages dédiées — en attente accord Caro
- [ ] Simulateurs fiscaux — MAJ existants ou nouveau pour référencement (accord Caro)
- [ ] 10-15 articles blog (cible : frontaliers FR-LU, indépendants, PME/TPE, résidents LU)
- [ ] Inscrire sur Bing Webmaster Tools
- [ ] Annuaires luxembourgeois (editus.lu, yellow.lu) — à faire, briefer Caro
- [x] Cache-control nginx dans le container Docker

## SOPs
- [x] Creer docs/sops/ avec index + 3 axes (services, marketing, technique)
- [x] 7 SOPs services : onboarding, IR frontalier, TVA, compta mensuelle, cloture, CCSS, creation entreprise
- [x] 5 SOPs marketing : TikTok/Instagram, SEO/blog, Google Ads, prospection Salonkee, LinkedIn
- [x] 4 SOPs technique : website update, CRM operations, deploy/maintenance, index technique
- [x] 7 ressources ICT (Quipment QMS) ajoutees dans docs/sops/ressources-ict/
- [x] Resume pour Caroline (resume-pour-caroline.md)

## Prospection Salonkee
- [x] Extension Chrome (salonkee-extension/) — scrape + enrichissement Perplexity + export CSV
- [x] Scripts CLI backup (tools/scrape-salonkee.py + enrich-prospects.py)
- [ ] Installer l'extension sur le Chrome de Caroline
- [ ] Configurer la clé API Perplexity dans l'extension
- [ ] Tester sur une recherche réelle avec Caroline
- [ ] Review CSV prospects avec Caroline
- [ ] Import prospects dans CRM

## Scraping & Multi-type Leads (2026-04-06)

- [x] Modèle Lead évolué : salonName → displayName, leadType (business/forum/annonce)
- [x] Champs forum : forumUsername, topicTitle, topicUrl, topicCategory, topicDate, replyCount, viewCount, aiSummary
- [x] Modèle ScrapeJob pour traquer les jobs de scraping
- [x] API import multi-type (déduplication par topicUrl pour forum, displayName+address pour business)
- [x] Dashboard /scrape dans le CRM (lancement, progression live, historique)
- [x] Scraper lesfrontaliers.lu (tools/scrape-frontaliers.py) — Playwright + CDP + pagination
- [x] Enrichissement conditionnel Perplexity (qualification forum vs recherche propriétaire business)
- [x] Docker scraper container (tools/Dockerfile.scraper)
- [x] 40 leads forum fiscalité importés en prod (test réussi)
- [x] Filtrage instantané + sélection en bloc sur toutes les listes CRM
- [x] Thème CSS inspiré caroline-finance.com (Inter Tight, accent orange)
- [x] Corriger pagination scraper (form POST wpForo + réutilisation onglet CDP — 0 doublons)
- [x] Endpoint enrichissement batch /api/leads/enrich-batch (Bearer token)
- [ ] Enrichir les 40 leads forum via Perplexity (BLOQUÉ — quota API épuisé, recharger sur perplexity.ai/settings/api)
- [ ] Scraper petites annonces lesfrontaliers.lu (sélecteurs à valider via CDP)
- [ ] Intégrer Salonkee scraper côté serveur (docker exec caro-scraper)
- [ ] Ajouter scheduling n8n pour scrapes automatiques
