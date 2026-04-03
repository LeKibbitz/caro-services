# SOP : Cloture Annuelle & Comptes Annuels

## Objectif

Realiser la cloture comptable de l'exercice, preparer les comptes annuels et effectuer les depots legaux (RCS, RBE) pour les independants et TPE/PME au Luxembourg.

## Prerequis

- Comptabilite mensuelle a jour sur l'exercice complet (voir SOP comptabilite-mensuelle.md)
- Acces eCDF (depot electronique des comptes)
- Acces RCS Luxembourg (Registre de Commerce et des Societes)
- Acces RBE (Registre des Beneficiaires Effectifs)
- Acces CRM : crm.caroline-finance.com
- Dossier CRM du client (type `comptabilite` ou `coordination`)

## Tarifs

| Prestation | Tarif Caroline | Marche |
|------------|---------------|--------|
| Cloture annuelle + comptes annuels + depot RCS | 1200-1800 EUR | 2000-3000 EUR |

## Seuils d'applicabilite

Les comptes annuels non certifies sont autorises pour les entreprises sous les seuils suivants (2 des 3 criteres) :

| Critere | Seuil |
|---------|-------|
| Total bilan | <= 2 305 000 EUR |
| Chiffre d'affaires net | <= 4 610 000 EUR |
| Effectif moyen | <= 25 salaries |

**Si le client depasse ces seuils** → orienter vers un expert-comptable agree pour audit legal.

## Pipeline

### Etape 1 — Pre-cloture (decembre N ou janvier N+1)

1. Verifier que toutes les ecritures mensuelles sont saisies (12 mois complets)
2. Demander au client les elements complementaires :
   - [ ] Inventaire physique des stocks (si applicable)
   - [ ] Liste des immobilisations (acquisitions/cessions de l'annee)
   - [ ] Etat des creances clients (pour provisions)
   - [ ] Etat des dettes fournisseurs
   - [ ] Contrats en cours (prets, leasings, baux)
   - [ ] Evenements post-cloture significatifs

### Etape 2 — Ecritures de cloture (janvier-fevrier N+1)

1. **Amortissements** : calculer et saisir les dotations annuelles (lineaire ou degressif selon les immobilisations)
2. **Provisions** : creances douteuses, risques identifies, charges a payer
3. **Regularisations** :
   - Charges constatees d'avance (CCA)
   - Produits constates d'avance (PCA)
   - Charges a payer (CAP)
   - Produits a recevoir (PAR)
4. **Stocks** : variation de stocks (inventaire initial vs final)
5. **Impots** : provision pour impot sur les societes (IS + ICC)
6. **Rapprochement final** : tous les comptes de banque, clients, fournisseurs

### Etape 3 — Preparation des comptes annuels

Selon le schema eCDF (abreviations autorisees sous seuils) :

**Bilan** :
- Actif immobilise (immobilisations incorporelles, corporelles, financieres)
- Actif circulant (stocks, creances, tresorerie)
- Capitaux propres (capital social, reserves, resultat de l'exercice)
- Dettes (emprunts, fournisseurs, fiscales et sociales)

**Compte de resultat** :
- Produits d'exploitation
- Charges d'exploitation
- Resultat d'exploitation
- Resultat financier
- Resultat exceptionnel
- Impots sur les benefices
- Resultat net

**Annexe** (simplifiee sous seuils) :
- Methodes comptables appliquees
- Engagements hors bilan
- Informations complementaires significatives

### Etape 4 — Revue et validation

1. **CRM** : Passer le dossier en `review`
2. Presenter les comptes au client :
   - Bilan resume
   - Compte de resultat avec comparatif N-1
   - Resultat net et impot estime
   - Points d'attention
3. Obtenir la validation ecrite du client (email ou signature)

### Etape 5 — Depots legaux

**Depot des comptes annuels au RCS via eCDF** :
1. Se connecter a eCDF avec le certificat LuxTrust
2. Remplir les formulaires de depot (bilan abrege ou complet)
3. Soumettre les comptes annuels
4. Payer les frais de depot (en ligne)
5. Telecharger l'accuse de depot

**Registre des Beneficiaires Effectifs (RBE)** :
1. Verifier si une mise a jour est necessaire (changement de structure, nouveaux associes)
2. Si oui → soumettre la declaration RBE sur le portail dedie

**Echeance depot RCS** : dans les 7 mois suivant la cloture de l'exercice (soit avant le 31 juillet N+1 pour un exercice au 31 decembre).

### Etape 6 — Declarations fiscales associees

1. Declaration IS (impot sur les societes) → voir tarification specifique
2. Declaration ICC (impot commercial communal)
3. Declaration IF (impot sur la fortune) → **hors scope si > 500K EUR**

Ces declarations peuvent etre faites dans la foulee ou separement selon le contrat.

### Etape 7 — Archivage

1. **CRM** : Passer le dossier en `done`
2. Archiver dans le dossier CRM :
   - Comptes annuels signes (PDF)
   - Accuse de depot RCS
   - Declaration RBE (si applicable)
   - Declarations fiscales soumises
3. Envoyer au client une copie complete de son dossier

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Comptabilite mensuelle incomplete | Bloquer la cloture. Rattraper les mois manquants avant de proceder |
| Client ne fournit pas l'inventaire | Relancer. Si impossible, estimer sur base de l'exercice precedent (documenter l'estimation) |
| Depassement des seuils | Arreter le processus. Informer le client qu'un audit legal est requis. Orienter vers un reviseur d'entreprises |
| Echeance RCS depassee | Deposer immediatement. Penalite de retard possible (amende forfaitaire) |
| Erreur dans les comptes deposes | Deposer des comptes annuels rectificatifs sur eCDF |

## Checklist rapide

- [ ] Comptabilite des 12 mois complete et rapprochee
- [ ] Elements complementaires recus (stocks, immobilisations, creances)
- [ ] Ecritures de cloture passees (amortissements, provisions, regularisations)
- [ ] Bilan, compte de resultat et annexe prepares
- [ ] Comptes presentes au client et valides
- [ ] Depot RCS effectue via eCDF, accuse archive
- [ ] RBE mis a jour si necessaire
- [ ] Declarations IS/ICC/IF soumises
- [ ] Dossier complet archive dans le CRM
- [ ] Facture emise pour la prestation
