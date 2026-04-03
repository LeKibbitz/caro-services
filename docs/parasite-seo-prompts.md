# Parasite SEO — Prompts Claude Artifacts pour caroline-finance.com

> **Mode d'emploi** : Copier chaque prompt dans une conversation Claude.ai (chat web).
> Claude va generer un artifact HTML interactif. Cliquer "Publish" pour le rendre public.
> Partager l'URL sur LinkedIn/X pour accelerer l'indexation Google.

---

## Prompt 1 — Calculateur Impot Frontalier France-Luxembourg

**Mots-cles cibles** : "calcul impot frontalier luxembourg", "simulateur fiscal frontalier", "impot frontalier france luxembourg"
**Lien retour** : https://caroline-finance.com/frontaliers-france-luxembourg/

```
Cree un artifact HTML interactif : un simulateur d'estimation fiscale pour les travailleurs frontaliers France-Luxembourg.

## Fonctionnalites du calculateur

L'utilisateur remplit un formulaire avec :
- Salaire brut annuel au Luxembourg (en EUR)
- Situation familiale (celibataire, marie/pacse, marie avec conjoint travaillant en France)
- Nombre d'enfants a charge
- Frais de deplacement (distance domicile-travail en km, bouton "Calculer les frais FD")
- Interets d'emprunt immobilier (optionnel)
- Cotisations epargne-prevoyance (optionnel)

Au clic sur "Estimer mes impots", afficher :
- Classe d'impot probable au Luxembourg (1, 1a, 2)
- Estimation de l'impot luxembourgeois (retenue a la source)
- Estimation du complement d'impot francais (methode du taux effectif, formulaire 2047)
- Total estime des impots (Luxembourg + France)
- Taux d'imposition effectif global
- Un encart "Attention" precisant que c'est une estimation indicative et non un avis fiscal

## Bareme Luxembourg 2026

Utilise le bareme d'imposition luxembourgeois 2026 simplifie :
- 0 a 11 265 EUR : 0%
- 11 265 a 13 173 EUR : 8%
- 13 173 a 15 081 EUR : 10%
- 15 081 a 16 989 EUR : 12%
- 16 989 a 18 897 EUR : 14%
- 18 897 a 20 805 EUR : 16%
- 20 805 a 22 713 EUR : 18%
- 22 713 a 24 621 EUR : 20%
- 24 621 a 26 529 EUR : 22%
- 26 529 a 28 437 EUR : 24%
- 28 437 a 30 345 EUR : 26%
- 30 345 a 32 253 EUR : 28%
- 32 253 a 34 161 EUR : 30%
- 34 161 a 36 069 EUR : 32%
- 36 069 a 37 977 EUR : 34%
- 37 977 a 39 885 EUR : 36%
- 39 885 a 41 793 EUR : 38%
- 41 793 a 100 002 EUR : 39%
- 100 002 a 150 000 EUR : 40%
- 150 000 a 200 004 EUR : 41%
- Au-dela de 200 004 EUR : 42%

Deductions luxembourgeoises a appliquer :
- Cotisations sociales : ~12.45% du brut (maladie 3.05%, retraite 8%, dependance 1.4%)
- Abattement forfaitaire (FD) : 540 EUR minimum, ou frais reels si superieurs (0.30 EUR/km * distance * jours travailles)
- Credit d'impot pour salaries (CIS) : 696 EUR/an
- Deduction interets d'emprunt : jusqu'a 672 EUR (celibataire) ou 1 344 EUR (couple)
- Classe 2 si marie : bareme applique sur la moitie du revenu, impot double

Pour le complement francais, appliquer la methode du taux effectif simplifiee :
- Revenu mondial = salaire LU + revenus FR du foyer
- Calculer l'impot theorique francais sur le revenu mondial
- Taux effectif = impot theorique / revenu mondial
- Complement = taux effectif * revenus de source francaise uniquement
- Si pas de revenus francais, complement = 0

## Design

- Titre H1 : "Simulateur Fiscal Frontalier France-Luxembourg 2026"
- Sous-titre : "Estimez vos impots en tant que travailleur frontalier"
- Police : Inter Tight (Google Fonts)
- Couleur accent : #FA5D29 (orange)
- Fond clair : #F8F8F8, texte : #222
- Boutons : fond #FA5D29, texte blanc, border-radius 72px
- Cards avec border-radius 8px, ombres subtiles
- Responsive mobile-first
- Les resultats s'affichent dans une card avec un fond legerement colore
- Animation douce a l'affichage des resultats

## CTA et liens obligatoires

En bas des resultats, ajouter un encart bien visible :
"Cette estimation est indicative. Pour une analyse precise de votre situation fiscale de frontalier, consultez Caroline Charpentier — specialiste fiscalite Luxembourg avec 30 ans d'experience."
Bouton CTA : "Demander un devis gratuit" → lien vers https://caroline-finance.com/frontaliers-france-luxembourg/
Et un texte : "Declarations frontaliers a partir de 220 EUR — Reponse sous 24h"

En footer de la page :
"Un outil propose par Caroline Charpentier — caroline-finance.com — Fiscalite & Comptabilite Luxembourg"
Avec lien cliquable vers https://caroline-finance.com/

## SEO dans la page

- La page doit contenir un paragraphe d'introduction de 150 mots expliquant la fiscalite des frontaliers France-Luxembourg, les points cles (convention fiscale 1958, double imposition, classes d'impot) et pourquoi utiliser ce simulateur.
- Ajouter une section FAQ avec 3-4 questions/reponses courtes sur la fiscalite des frontaliers (format details/summary pour l'accessibilite).
```

---

## Prompt 2 — Checklist Documents Declaration Fiscale Frontalier

**Mots-cles cibles** : "documents declaration fiscale frontalier luxembourg", "checklist impots frontalier", "pieces justificatives declaration luxembourg"
**Lien retour** : https://caroline-finance.com/blog/documents-declaration-fiscale-frontalier/

```
Cree un artifact HTML interactif : une checklist des documents necessaires pour la declaration fiscale d'un travailleur frontalier France-Luxembourg.

## Fonctionnalites

Une checklist interactive ou l'utilisateur peut cocher chaque document au fur et a mesure qu'il le rassemble. Afficher une barre de progression en haut (ex: "12/18 documents reunis — 67%").

Les documents sont organises par categorie, avec pour chacun :
- Une case a cocher
- Le nom du document
- Une courte description (ou le trouver, format attendu)
- Un badge de priorite (Obligatoire / Recommande / Si applicable)

## Categories et documents

### 1. Revenus luxembourgeois (Obligatoire)
- Certificat de remuneration annuel (du patron luxembourgeois, envoye en janvier/fevrier)
- Certificats de revenus de remplacement (maladie, conge parental, chomage — si applicable)
- Attestation de retenue d'impot RTS (retenue a la source)

### 2. Situation familiale (Obligatoire)
- Certificat de residence (commune de residence en France)
- Livret de famille ou acte de mariage/PACS
- Attestation de revenus du conjoint (si demande de classe 2)
- Certificats de naissance des enfants (allocations familiales)

### 3. Deductions et charges (Recommande)
- Attestation interets emprunt immobilier (residence principale)
- Contrats d'assurance prevoyance / vie (deduction CE)
- Justificatifs dons et liberalites (recus fiscaux)
- Attestation cotisations epargne-logement
- Frais de deplacement : adresse domicile + adresse lieu de travail (calcul km)
- Justificatifs frais de garde d'enfants

### 4. Patrimoine et revenus complementaires (Si applicable)
- Revenus fonciers (loyers percus, en France ou Luxembourg)
- Revenus de capitaux mobiliers (dividendes, interets)
- Plus-values immobilieres ou mobilieres
- Revenus d'activite independante complementaire

### 5. Formulaires a remplir (Obligatoire)
- Modele 100 (declaration luxembourgeoise)
- Formulaire 2042 (declaration francaise)
- Formulaire 2047 (revenus de source etrangere, annexe 2042)
- Formulaire 3916 (declaration de comptes a l'etranger — compte bancaire LU)

### 6. Documents supplementaires classe 2
- Attestation de non-revenu du conjoint OU declaration de revenus du conjoint
- Demande de taxation individuelle ou collective

## Fonctionnalites interactives

- Les coches sont sauvegardees en localStorage (l'utilisateur peut revenir plus tard)
- Bouton "Reinitialiser" pour tout decocher
- Bouton "Exporter en PDF" (ou "Imprimer") qui genere une version imprimable
- Filtrer par priorite (Obligatoire / Recommande / Si applicable)
- La barre de progression se met a jour en temps reel

## Design

- Titre H1 : "Checklist Declaration Fiscale Frontalier Luxembourg 2026"
- Sous-titre : "Tous les documents a reunir pour votre declaration"
- Police : Inter Tight (Google Fonts)
- Couleur accent : #FA5D29 (orange)
- Fond clair : #F8F8F8, texte : #222
- Cases a cocher stylisees (accent orange quand cochees)
- Cards par categorie, border-radius 8px
- Badges colores : Obligatoire (orange #FA5D29), Recommande (bleu #3B82F6), Si applicable (gris #6B7280)
- Responsive mobile-first
- Animation subtile quand on coche un element

## CTA et liens obligatoires

Apres la checklist, un encart :
"Vous avez reuni tous vos documents ? Caroline Charpentier peut preparer votre declaration fiscale de frontalier de A a Z."
Bouton : "Confier ma declaration a Caroline" → https://caroline-finance.com/blog/documents-declaration-fiscale-frontalier/
Texte : "A partir de 220 EUR — 30 ans d'experience — Reponse sous 24h"

Footer :
"Propose par Caroline Charpentier — caroline-finance.com — Specialiste fiscalite frontaliers France-Luxembourg"
Lien vers https://caroline-finance.com/

## SEO dans la page

- Introduction de 150 mots sur l'importance de bien preparer ses documents avant la deadline (31 mars pour la declaration luxembourgeoise, puis declaration francaise).
- Section FAQ : "Quand dois-je deposer ma declaration ?", "Puis-je faire ma declaration en ligne ?", "Faut-il declarer mon compte bancaire luxembourgeois en France ?" (reponse : oui, formulaire 3916).
```

---

## Prompt 3 — Guide Complet Frontalier France-Luxembourg 2026

**Mots-cles cibles** : "frontalier france luxembourg 2026", "guide fiscal frontalier luxembourg", "travailleur frontalier luxembourg impots"
**Lien retour** : https://caroline-finance.com/frontaliers-france-luxembourg/

```
Cree un artifact HTML : un guide complet et detaille sur la fiscalite des travailleurs frontaliers France-Luxembourg en 2026. Ce n'est PAS un outil interactif, c'est un article de reference long et approfondi.

## Structure du guide

### Titre H1 : "Guide Complet : Frontalier France-Luxembourg — Fiscalite, Impots et Demarches 2026"

### Introduction (200 mots)
Presenter la situation des ~120 000 frontaliers francais travaillant au Luxembourg. Expliquer pourquoi la fiscalite est complexe (2 pays, convention fiscale, double declaration). Annoncer le plan du guide.

### 1. Qui est considere comme frontalier ?
- Definition legale (convention fiscale France-Luxembourg de 1958, avenant 2006)
- Difference entre frontalier et resident
- Zone frontaliere et ses implications
- Cas particuliers : teletravail (accord amiable, 34 jours depuis 2023), detachements

### 2. Ou payer ses impots ?
- Principe : salaires imposes au Luxembourg (retenue a la source)
- Exception : revenus de source francaise (fonciers, capitaux) imposes en France
- Methode du taux effectif pour eviter la double imposition
- Revenus de remplacement (maladie, chomage) : ou sont-ils imposes ?

### 3. Le systeme fiscal luxembourgeois pour les frontaliers
- Les 3 classes d'impot (1, 1a, 2)
- Comment obtenir la classe 2 (couple, conditions)
- Bareme progressif 2026 (tranches simplifiees)
- Credit d'impot pour salaries (CIS)
- Cotisations sociales (~12.45% : maladie, retraite, dependance)

### 4. Deductions et optimisations fiscales
- Frais de deplacement (FD) — 0.30 EUR/km, forfait 540 EUR minimum
- Interets d'emprunt immobilier (672 EUR / 1 344 EUR couple)
- Depenses speciales (DS) : assurances, prevoyance, dons
- Charges extraordinaires (CE) : frais medicaux, garde d'enfants
- Epargne-logement et epargne-prevoyance

### 5. La declaration au Luxembourg (Modele 100)
- Qui doit la remplir ? (revenu > 100 000 EUR, classe 2, revenus multiples)
- Deadline : 31 mars de l'annee suivante
- Comment la remplir (MyGuichet.lu ou papier)
- Documents necessaires (renvoyer vers la checklist)

### 6. La declaration en France (2042 + 2047)
- Pourquoi declarer en France meme si les revenus sont luxembourgeois
- Formulaire 2047 : comment reporter les revenus de source etrangere
- Methode du taux effectif expliquee simplement (avec un exemple chiffre)
- Formulaire 3916 : obligation de declarer les comptes bancaires luxembourgeois

### 7. Cas pratiques et exemples chiffres
- Exemple 1 : Celibataire, 55 000 EUR brut, classe 1, locataire — calcul complet
- Exemple 2 : Couple, 75 000 EUR brut, conjoint sans revenu, classe 2, proprietaire — calcul complet
- Exemple 3 : Couple bi-actif (1 LU + 1 FR), revenus mixtes — methode du taux effectif

### 8. Erreurs frequentes a eviter
- Top 5 erreurs des frontaliers (oublier le 3916, mauvaise classe, ne pas demander la classe 2, oublier les deductions FD, ne pas declarer en France)

### 9. FAQ (5-6 questions)
- "Dois-je payer des impots dans les deux pays ?"
- "Comment obtenir la classe 2 ?"
- "Le teletravail change-t-il ma fiscalite ?"
- "Puis-je deduire mes frais de deplacement ?"
- "Quand dois-je deposer mes declarations ?"
- "Un comptable est-il obligatoire ?"

## Design

- Police : Inter Tight (Google Fonts)
- Couleur accent : #FA5D29 (orange) pour les titres, liens, highlights
- Fond : blanc #FFFFFF, texte : #222
- Table des matieres cliquable en haut (liens ancres vers chaque section)
- Sections bien separees avec des lignes horizontales subtiles
- Les exemples chiffres dans des cards avec fond #FFF7ED (orange tres pale)
- Les points importants dans des encarts avec bordure gauche orange
- Responsive mobile-first
- Pas de sidebar, format article long colonne unique (max-width 720px centre)

## CTA et liens obligatoires

Apres chaque section majeure, un petit encart discret :
"Besoin d'aide ? Caroline Charpentier accompagne les frontaliers depuis 30 ans."
Lien vers https://caroline-finance.com/frontaliers-france-luxembourg/

En fin d'article, CTA principal :
"Ne laissez pas la complexite fiscale vous couter de l'argent. Caroline Charpentier prend en charge votre declaration de frontalier de A a Z."
Bouton : "Demander un devis gratuit" → https://caroline-finance.com/frontaliers-france-luxembourg/
"Declarations frontaliers a partir de 220 EUR — Reponse sous 24h"
Telephone : +352 661 521 101 | WhatsApp : wa.me/352661521101

Footer :
"Guide redige par Caroline Charpentier — caroline-finance.com — Specialiste fiscalite & comptabilite Luxembourg"
Lien vers https://caroline-finance.com/

## SEO dans la page

- Le texte doit naturellement inclure les mots-cles : "frontalier france luxembourg", "declaration fiscale frontalier", "impots frontalier luxembourg", "classe 2 luxembourg", "convention fiscale france luxembourg", "formulaire 2047 frontalier"
- Utiliser des balises H2/H3 bien structurees
- Les exemples chiffres aident au SEO longue traine ("combien d'impots frontalier 55 000 euros")
```

---

## Apres publication

1. **Partager** chaque artifact sur LinkedIn (compte Caroline) et X (@Caro_Finance)
2. **Verifier l'indexation** apres 24-48h : chercher `site:claude.ai frontalier luxembourg` sur Google
3. **Tracker** le trafic entrant sur caroline-finance.com depuis les artifacts (Google Analytics referrer)
4. **Si ca marche** : creer les artifacts suivants (simulateur TVA, quiz creation entreprise, guide erreurs fiscales)
