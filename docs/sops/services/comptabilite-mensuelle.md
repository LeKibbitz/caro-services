# SOP : Comptabilite Mensuelle

## Objectif

Assurer la tenue comptable recurrente des clients independants et TPE/PME — saisie des ecritures, rapprochement bancaire et reporting mensuel.

## Prerequis

- Logiciel comptable (plan comptable normalise PCN luxembourgeois)
- Acces CRM : crm.caroline-finance.com
- Dossier CRM du client (type `comptabilite`)
- Releves bancaires et pieces comptables du client

## Tarifs

| Volume | Tarif Caroline | Marche |
|--------|---------------|--------|
| Tenue comptable simplifiee | 200-350 EUR/mois | 400-600 EUR/mois |
| Tenue comptable complete (PME) | Sur devis | 600-1500 EUR/mois |

## Pipeline

### Etape 1 — Reception des pieces (avant le 10 du mois M+1)

Collecter aupres du client :

- [ ] Releves bancaires du mois M
- [ ] Factures de vente emises (numerotation sequentielle)
- [ ] Factures d'achat recues
- [ ] Notes de frais avec justificatifs
- [ ] Bulletins de paie (si gestion sociale externalisee)
- [ ] Contrats ou engagements nouveaux (bail, pret, leasing)
- [ ] Ecritures de caisse (si applicable)

**Canal de reception** : Email, WhatsApp, ou upload dans le CRM.

**CRM** : Mettre le dossier en `in_progress` des reception des pieces.

### Etape 2 — Saisie des ecritures

Saisir dans le logiciel comptable, par journal :

**Journal des ventes (VE)** :
- Chaque facture de vente → compte client (411xxx) + produit (7xxxxx) + TVA collectee (451xxx)

**Journal des achats (AC)** :
- Chaque facture d'achat → compte fournisseur (401xxx) + charge (6xxxxx) + TVA deductible (451xxx)

**Journal de banque (BQ)** :
- Chaque mouvement bancaire → compte banque (512xxx) + contrepartie

**Journal des OD (OD)** :
- Ecritures de paie, amortissements mensuels, provisions, regularisations

**Regles de saisie** :
- Libelles clairs et normalises (date + fournisseur/client + nature)
- Piece justificative numerotee pour chaque ecriture
- Pas de saisie sans justificatif

### Etape 3 — Rapprochement bancaire

1. Comparer le solde comptable du compte 512 avec le releve bancaire
2. Identifier les ecarts :
   - Cheques emis non debites
   - Virements recus non saisis
   - Frais bancaires non comptabilises
3. Saisir les ecritures manquantes
4. Le solde doit etre a l'equilibre a la fin du rapprochement

### Etape 4 — Controles mensuels

1. **Balance des comptes** : verifier les soldes anormaux (comptes de charges crediteurs, comptes de produits debiteurs)
2. **Lettrage** : lettrer les comptes clients et fournisseurs (factures <> paiements)
3. **TVA** : verifier la coherence avec la declaration TVA du mois (voir SOP declarations-tva.md)
4. **Tresorerie** : position de tresorerie actuelle

### Etape 5 — Reporting client

Envoyer au client un reporting mensuel (avant le 20 du mois M+1) :

1. Balance generale simplifiee
2. Compte de resultat cumule (produits - charges = resultat)
3. Position de tresorerie
4. Points d'attention (factures impayees, echeances a venir)

**Format** : PDF par email ou message WhatsApp avec les chiffres cles.

**CRM** : Passer le dossier en `done` pour le mois. Creer le dossier du mois suivant.

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Client en retard sur les pieces | Relance WhatsApp le 10. Si le 15 toujours rien → appel. Reporter la saisie au mois suivant si necessaire |
| Facture sans TVA (fournisseur etranger) | Verifier si autoliquidation applicable. Saisir en HT + OD de TVA |
| Ecart de rapprochement non identifie | Ne pas forcer. Mettre en suspens et investiguer. Demander un releve bancaire detaille |
| Erreur de saisie decouverte | Passer une ecriture de contrepassation (jamais supprimer) |
| Client veut des ecritures sans justificatif | Refuser. Expliquer l'obligation legale de justification |

## Checklist rapide

- [ ] Pieces du mois recues (releves, factures, notes de frais)
- [ ] Saisie des ecritures par journal (VE, AC, BQ, OD)
- [ ] Rapprochement bancaire a l'equilibre
- [ ] Lettrage clients/fournisseurs effectue
- [ ] Coherence TVA verifiee
- [ ] Reporting mensuel envoye au client
- [ ] Dossier CRM passe en `done` pour le mois
- [ ] Facture de prestation emise
