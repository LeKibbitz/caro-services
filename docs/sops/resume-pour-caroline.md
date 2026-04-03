# Resume des SOPs — Caroline Fiscalite & Comptabilite

> Document prepare par Thomas Joannes — 1er avril 2026
> Ce document resume l'ensemble des procedures operationnelles standard (SOPs) creees pour caroline-finance.com et ses activites.

---

## Pourquoi des SOPs ?

Les SOPs (Standard Operating Procedures) sont des guides etape par etape pour chaque operation recurrente de ton activite. Objectifs :

- **Fiabilite** : chaque prestation suit le meme processus, rien n'est oublie
- **Autonomie** : tu peux deleguer une tache a quelqu'un en lui donnant la SOP correspondante
- **Tracabilite** : les checklists permettent de verifier que tout est fait
- **Amelioration continue** : quand un probleme survient, on met a jour la SOP

Tes SOPs sont organisees en 3 axes : **Services** (ce que tu vends), **Marketing** (comment tu te fais connaitre), et **Technique** (comment l'infra fonctionne).

---

## Axe 1 — Livraison des Services (7 SOPs)

C'est le coeur de ton activite : les prestations que tu delivres a tes clients.

### 1. Onboarding client

**Fichier** : `services/onboarding-client.md`

Couvre tout le parcours d'un nouveau prospect : reception du contact (formulaire site, WhatsApp, telephone, Google Ads, recommandation, Salonkee), qualification en 15 minutes (type de client, services necessaires, budget), creation du devis dans le CRM, envoi et signature, puis mise en place des dossiers.

Inclut la grille tarifaire complete :
- Declaration IR frontalier : 220-320 EUR
- Declarations TVA : 80-200 EUR/mois
- Comptabilite mensuelle : 200-400 EUR/mois
- Cloture annuelle : 1 200-1 800 EUR
- Creation entreprise : 500-800 EUR

### 2. Declaration IR frontalier

**Fichier** : `services/declaration-ir-frontalier.md`

Ton service phare (125 000 frontaliers FR→LU). Pipeline complet :
1. Collecte des documents (certificat de salaire, modele 101bis, releves bancaires, preuve assurance complementaire, justificatifs deductions)
2. Verification et pre-analyse
3. Preparation du modele 100 (revenu luxembourgeois + mondial)
4. Soumission via MyGuichet.lu
5. Suivi aupres de l'ACD jusqu'a l'avis d'imposition

Calendrier : deadline 31 mars (annee N+1). Periode intense janvier-mars.

### 3. Declarations TVA

**Fichier** : `services/declarations-tva.md`

Gestion des declarations TVA pour les entreprises assujetties. 3 regimes selon le chiffre d'affaires :
- Mensuel (CA > 620 000 EUR) — deadline le 15 du mois suivant
- Trimestriel (112 000 < CA < 620 000 EUR) — deadline le 15 du mois suivant le trimestre
- Annuel (CA < 112 000 EUR) — deadline 1er mars N+1

Soumission via eCDF. Inclut VIES (echanges intra-UE) et Intrastat (> 200 000 EUR expeditions ou > 150 000 EUR arrivees).

### 4. Comptabilite mensuelle

**Fichier** : `services/comptabilite-mensuelle.md`

Tenue comptable recurrente : reception des pieces (factures, releves, notes de frais), saisie dans les journaux (ventes, achats, banque, operations diverses), rapprochement bancaire, et reporting mensuel au client.

Livrable : situation mensuelle avec CA, charges, resultat, tresorerie, points d'attention.

### 5. Cloture annuelle

**Fichier** : `services/cloture-annuelle.md`

Cycle annuel de cloture : inventaire des immobilisations, ecritures de cloture (amortissements, provisions, CCA/PCA), elaboration des comptes annuels (bilan, compte de resultat, annexe), depot au RCS via eCDF, et mise a jour du RBE (Registre des Beneficiaires Effectifs).

Seuils d'audit a surveiller : total bilan > 4,4M EUR, CA > 8,8M EUR, effectif > 50.

### 6. Declarations CCSS

**Fichier** : `services/declarations-ccss.md`

Gestion sociale et paie : etablissement des bulletins de salaire, declarations mensuelles a la CCSS via SECUline, gestion des evenements (embauche, depart, conge parental, maladie), declaration annuelle des salaires.

Taux de reference : cotisations salariales ~12,45%, patronales ~12,67%.

### 7. Creation d'entreprise

**Fichier** : `services/creation-entreprise.md`

Accompagnement a la creation d'une societe au Luxembourg. Comparaison des formes juridiques (SARL-S a 1 EUR de capital, SARL a 12 000 EUR, SA a 30 000 EUR), obtention de l'autorisation d'etablissement, constitution devant notaire, inscription au RC/TVA/CCSS, et mise en place comptable initiale (plan comptable PCN).

---

## Axe 2 — Marketing & Acquisition (5 SOPs)

Les procedures pour developper ta visibilite et attirer de nouveaux clients.

### 8. Contenu TikTok / Instagram

**Fichier** : `marketing/contenu-tiktok-instagram.md`

Pipeline de creation de contenu video (objectif 3-5/semaine). 8 formats definis : astuce fiscale rapide (30-60s), storytime client, POV comptable, Q&A, avant/apres, behind-the-scenes, tendance sonore, collaboration. Hooks valides inclus. Workflow batch : ideation lundi → tournage mardi/mercredi → edition jeudi → publication vendredi-dimanche. Reutilisation TikTok → Instagram Reels.

### 9. SEO & Blog

**Fichier** : `marketing/seo-blog.md`

Maintenance du referencement naturel + pipeline de publication d'articles blog. Mots-cles cibles : "declaration fiscale Luxembourg" (590 rech/mois), "comptable Luxembourg frontalier" (320), "creation entreprise Luxembourg" (880), etc. Pipeline : recherche mot-cle → redaction article → publication → mise a jour sitemap → suivi positions Google Search Console.

### 10. Google Ads

**Fichier** : `marketing/google-ads.md`

Gestion de la campagne Google Ads existante. Contient les 10 titres valides, les 3 variantes d'annonces, le ciblage geographique (Luxembourg + villes frontalieres FR : Thionville, Metz, Longwy, etc.), et le process de suivi : budget → CTR → conversions → optimisation encheres → A/B test.

### 11. Prospection Salonkee

**Fichier** : `marketing/prospection-salonkee.md`

Pipeline d'acquisition de clients parmi les salons de beaute au Luxembourg. Utilise l'extension Chrome + scripts CLI pour scraper salonkee.com, enrichir les donnees via Perplexity (gerant, email, forme juridique), qualifier les prospects, et les importer dans le CRM. 7 categories (coiffeurs, beaute, barbiers, ongles, spa, tatouage, epilation) x 16 villes.

### 12. LinkedIn branding

**Fichier** : `marketing/linkedin-branding.md`

Strategie de personal branding sur LinkedIn. Planning hebdomadaire : 2-3 posts/semaine (parcours, expertise fiscale, actualite fiscale LU, temoignages clients). Engagement : commenter 5-10 posts/jour dans le reseau cible. Connexions ciblees : frontaliers, entrepreneurs, experts-comptables, avocats fiscalistes.

---

## Axe 3 — Technique & Plateforme (4 SOPs)

La documentation technique de l'infrastructure. Principalement pour Thomas, mais utile pour comprendre comment tout fonctionne.

### 13. Website update

**Fichier** : `technique/website-update.md`

Comment modifier le contenu du site caroline-finance.com. Le site est un ensemble de pages HTML statiques servies par Nginx. Deux systemes CSS distincts (homepage en CSS inline, sous-pages en CSS partage) — ne jamais les fusionner. Modification : edit local → verification → rsync vers le serveur → verification post-deploy.

### 14. CRM operations

**Fichier** : `technique/crm-operations.md`

Mode d'emploi du CRM (crm.caroline-finance.com). Documente le modele de donnees complet : contacts (prospect → client → ancien), devis (draft → sent → accepted/rejected), factures (draft → sent → paid/overdue), dossiers fiscaux (todo → docs_pending → in_progress → review → done), documents, rendez-vous, messages.

### 15. Deploy & maintenance

**Fichier** : `technique/deploy-maintenance.md`

Architecture serveur (VPS dedie, Docker, Traefik reverse proxy, SSL automatique), procedures de deploiement (site + CRM), maintenance recurrente (hebdomadaire : verifier services + logs ; mensuelle : espace disque, mises a jour, backups BDD), et guide de depannage.

### 16. Index technique

**Fichier** : `technique/index.md`

Reference centralisee : serveurs (IP, SSH), services (URLs, ports, stack), comptes et acces, domaines DNS, contacts, et liens vers les autres SOPs techniques.

---

## Ressources ICT (7 documents de reference)

En complement des SOPs caroline-finance, un ensemble de 7 procedures ICT formelles issues du systeme qualite Quipment (2016-2017) a ete ajoute comme reference. Ces documents suivent un format professionnel QMS (Quality Management System) et couvrent le cycle de vie complet d'une infrastructure informatique.

Ces SOPs sont des modeles de reference — elles ne s'appliquent pas directement a caroline-finance.com mais servent d'inspiration pour structurer les pratiques IT.

| Ref. | Titre | Pages | Resume |
|------|-------|-------|--------|
| ICT-001 | Gestion d'inventaire ICT | 6 | Cycle de vie du materiel : achat, inventaire, installation, mise hors service |
| ICT-002 | Maintenance, support et reparation | 5 | Maintenance preventive, helpdesk, gestion des tickets et incidents |
| ICT-003 | Gestion des backups et tests de restauration | 9 | Strategies de sauvegarde par criticite serveur, tests de restauration periodiques |
| ICT-004 | Monitoring ICT | 5 | Surveillance des serveurs et des sauvegardes, detection des anomalies |
| ICT-005 | Securite ICT | 7 | Securite physique (locaux, acces) et logique (mots de passe, VPN, firewall, antivirus) |
| ICT-006 | Developpement et validation de systemes | 14 | SDLC complet : vision produit, specs, analyse de risque, architecture, programmation, tests fonctionnels, UAT, tracabilite, release |
| ICT-007 | Gestion des changements logiciels | 10 | Change requests, evaluation risque/impact, priorite, versionnement, tests, mise en production |

**Emplacement** : `docs/sops/ressources-ict/` (fichiers PDF originaux)

---

## Comment utiliser ces SOPs

1. **Avant une prestation** : ouvre la SOP correspondante et suis la checklist
2. **En cas de probleme** : consulte le tableau "Gestion d'erreurs" de la SOP
3. **Pour deleguer** : donne la SOP + les acces necessaires a la personne
4. **Pour ameliorer** : note ce qui a change ou manque, et demande la mise a jour

---

## Emplacement des fichiers

Tous les fichiers sont dans le dossier `caro-services/docs/sops/` :

```
docs/sops/
├── index.md                          ← Index general avec liens
├── resume-pour-caroline.md           ← Ce document
├── services/
│   ├── onboarding-client.md
│   ├── declaration-ir-frontalier.md
│   ├── declarations-tva.md
│   ├── comptabilite-mensuelle.md
│   ├── cloture-annuelle.md
│   ├── declarations-ccss.md
│   └── creation-entreprise.md
├── marketing/
│   ├── contenu-tiktok-instagram.md
│   ├── seo-blog.md
│   ├── google-ads.md
│   ├── prospection-salonkee.md
│   └── linkedin-branding.md
├── technique/
│   ├── index.md
│   ├── website-update.md
│   ├── crm-operations.md
│   └── deploy-maintenance.md
└── ressources-ict/
    ├── SOP_ICT-001 ... .pdf
    ├── SOP_ICT-002 ... .pdf
    ├── SOP_ICT-003 ... .pdf
    ├── SOP_ICT-004 ... .pdf
    ├── SOP_ICT-005 ... .pdf
    ├── SOP_ICT-006 ... .pdf
    └── SOP_ICT-007 ... .pdf
```

---

*16 SOPs operationnelles + 7 references ICT = couverture complete de l'activite.*
