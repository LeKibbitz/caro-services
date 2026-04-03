# SOP : Declaration IR Frontalier

## Objectif

Preparer et soumettre la declaration d'impot sur le revenu (modele 100) pour les personnes physiques — frontaliers FR→LU et residents luxembourgeois. Service phare, marche de ~125 000 frontaliers francais.

## Prerequis

- Acces MyGuichet.lu (compte professionnel Caroline)
- Acces CRM : crm.caroline-finance.com
- Formulaire modele 100 (Administration des Contributions Directes)
- Dossier CRM du client (type `ir`, statut `docs_pending`)

## Tarifs

| Situation | Tarif Caroline | Marche |
|-----------|---------------|--------|
| Frontalier standard | 220-320 EUR | 400-600 EUR |
| Situation complexe (multi-pays, revenus mixtes) | 400-650 EUR | 600-1000 EUR |
| Consultation strategique (1h30) | 350 EUR | — |

## Pipeline

### Etape 1 — Collecte des documents

Envoyer au client la checklist suivante (par WhatsApp ou email) :

**Documents obligatoires :**
- [ ] Certificat de salaire annuel (employeur LU)
- [ ] Formulaire 101bis (certificat de non-resident)
- [ ] Releves bancaires LU et FR (interets, dividendes)
- [ ] Attestation d'assurance maladie (CNS ou mutuelle)
- [ ] Avis d'imposition francais N-1
- [ ] Justificatif de domicile (taxe fonciere ou quittance de loyer)

**Documents optionnels (selon situation) :**
- [ ] Contrat de pret immobilier + tableau d'amortissement (interets deductibles)
- [ ] Factures de frais de deplacement (si > forfait)
- [ ] Justificatifs de dons (organismes agrees LU)
- [ ] Attestation de garde d'enfants
- [ ] Certificat d'epargne-logement
- [ ] Revenus fonciers (le cas echeant)

**CRM** : Passer le dossier en `docs_pending`. Joindre chaque document recu au dossier.

### Etape 2 — Verification des documents

1. Verifier que tous les documents obligatoires sont recus
2. Controler la coherence : montants du certificat de salaire vs fiches de paie
3. Identifier les deductions possibles :
   - Frais de deplacement (forfait ou reels)
   - Interets d'emprunt immobilier (plafond LU)
   - Assurances deductibles
   - Dons a des organismes agrees
   - Charges extraordinaires
4. Si documents manquants → relancer le client (WhatsApp + email)

**CRM** : Passer le dossier en `in_progress` quand tous les documents sont la.

### Etape 3 — Preparation de la declaration

1. Remplir le modele 100 sur MyGuichet.lu :
   - Page 1 : Etat civil, adresse, situation familiale
   - Revenus salariaux (case 101 → certificat de salaire)
   - Revenus fonciers (si applicable)
   - Revenus de capitaux mobiliers
   - Deductions et charges
   - Credits d'impot
2. Calculer l'impot estime
3. Verifier les taux (bareme progressif LU, classe d'impot 1/1a/2)
4. Preparer un recapitulatif pour le client

### Etape 4 — Revue client

1. **CRM** : Passer le dossier en `review`
2. Envoyer au client :
   - Recapitulatif des revenus declares
   - Montant estime de l'impot (ou du remboursement)
   - Deductions appliquees
3. Attendre la validation du client (WhatsApp ou email)
4. Si corrections demandees → modifier et renvoyer

### Etape 5 — Soumission

1. Soumettre la declaration sur MyGuichet.lu
2. Telecharger l'accuse de reception
3. Joindre l'accuse au dossier CRM
4. **CRM** : Passer le dossier en `done`
5. Envoyer confirmation au client avec :
   - Copie de la declaration soumise
   - Accuse de reception
   - Delai estime de traitement par l'ACD (4-8 semaines)

### Etape 6 — Suivi post-soumission

1. Si courrier de l'ACD (demande de complements) → repondre sous 30 jours
2. Si bulletin d'imposition recu → verifier la conformite avec la declaration
3. Si ecart significatif → preparer reclamation si justifie
4. Archiver le dossier complet

## Calendrier fiscal

| Echeance | Date |
|----------|------|
| Date limite declaration IR (personnes physiques) | 31 mars N+1 |
| Prolongation possible (sur demande) | 30 juin N+1 |
| Delai traitement ACD | 4-8 semaines apres soumission |

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Client ne fournit pas les documents | Relance J+3, J+7, J+14. Si toujours incomplet → proposer un RDV pour debloquer |
| Formulaire 101bis non signe par l'employeur | Fournir un modele vierge, expliquer la demarche au client |
| Echeance depassee | Soumettre des que possible. Informer le client du risque d'amende (jusqu'a 25 000 EUR theorique, rarement applique pour les particuliers) |
| Situation hors scope (revenus > seuils, fortune > 500K EUR) | Orienter vers expert-comptable agree. Ne pas facturer le temps de qualification |
| Erreur dans la declaration soumise | Deposer une declaration rectificative sur MyGuichet |

## Checklist rapide

- [ ] Dossier CRM cree (type `ir`, annee fiscale)
- [ ] Checklist documents envoyee au client
- [ ] Tous les documents obligatoires recus et verifies
- [ ] Declaration modele 100 preparee sur MyGuichet
- [ ] Recapitulatif envoye au client pour validation
- [ ] Client a valide → declaration soumise
- [ ] Accuse de reception archive dans le dossier CRM
- [ ] Confirmation envoyee au client
- [ ] Facture emise
