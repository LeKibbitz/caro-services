# SOP : Declarations TVA

## Objectif

Gerer le cycle complet des declarations TVA pour les independants et TPE/PME au Luxembourg — mensuelle, trimestrielle ou annuelle selon le regime du client.

## Prerequis

- Acces eCDF (plateforme electronique de collecte des donnees financieres)
- Acces MyGuichet.lu
- Acces CRM : crm.caroline-finance.com
- Dossier CRM du client (type `tva_mensuelle` ou equivalent)
- Numero TVA du client (LU + 8 chiffres)

## Tarifs

| Regime | Tarif Caroline | Marche |
|--------|---------------|--------|
| TVA mensuelle | 150-180 EUR/declaration | 250-300 EUR |
| TVA trimestrielle | 250-300 EUR/declaration | 400-500 EUR |
| TVA annuelle | 500-700 EUR | 800-1200 EUR |
| Etat recapitulatif VIES | Inclus | — |
| Intrastat | 150-250 EUR | — |

## Regimes TVA Luxembourg

| Regime | Seuil CA annuel | Frequence |
|--------|----------------|-----------|
| Mensuel | > 112 000 EUR | Chaque mois, avant le 15 du mois suivant |
| Trimestriel | <= 112 000 EUR | Chaque trimestre, avant le 15 du mois suivant |
| Annuel | < 30 000 EUR (simplifie) | Une fois par an |

**Taux TVA Luxembourg :**
- Normal : 17%
- Intermediaire : 14%
- Reduit : 8%
- Super-reduit : 3%

## Pipeline

### Etape 1 — Collecte des pieces (recurrente)

A chaque periode (mois/trimestre) :

1. Demander au client les pieces suivantes :
   - Factures de vente emises sur la periode
   - Factures d'achat recues sur la periode
   - Releves bancaires de la periode
   - Notes de frais
2. Verifier la reception dans un delai raisonnable :
   - TVA mensuelle : documents avant le 5 du mois suivant
   - TVA trimestrielle : documents avant le 5 du mois suivant le trimestre

**CRM** : Creer ou mettre a jour le dossier pour la periode. Statut `docs_pending`.

### Etape 2 — Saisie et calcul

1. Saisir les factures de vente (TVA collectee) :
   - Ventiler par taux de TVA (17%, 14%, 8%, 3%)
   - Identifier les operations intracommunautaires (autoliquidation)
   - Identifier les exportations (exonerees)
2. Saisir les factures d'achat (TVA deductible) :
   - Verifier que chaque facture respecte les mentions obligatoires
   - Ventiler par taux
3. Calculer :
   - TVA collectee totale
   - TVA deductible totale
   - Solde (a payer ou credit)
4. Rapprocher avec le releve bancaire

**CRM** : Passer en `in_progress`.

### Etape 3 — Declaration eCDF

1. Se connecter a eCDF avec le certificat LuxTrust
2. Remplir la declaration TVA (formulaire TVA_DECM / TVA_DECT / TVA_DECA)
3. Verifier les totaux (coherence avec la saisie)
4. Generer le PDF de la declaration

**CRM** : Passer en `review`.

### Etape 4 — Validation et soumission

1. Envoyer le recapitulatif au client :
   - TVA collectee / deductible / solde
   - Montant a payer (ou credit a reporter)
2. Apres validation client → soumettre sur eCDF
3. Si solde a payer → rappeler au client l'echeance de paiement
4. Telecharger l'accuse de reception

**CRM** : Passer en `done`. Archiver l'accuse.

### Etape 5 — Declarations annexes

**Etat recapitulatif VIES** (si operations intracommunautaires) :
- Frequence : meme que la TVA
- Contenu : liste des clients UE avec montants HT
- Soumission : eCDF

**Intrastat** (si echanges de biens > seuils) :
- Seuil d'expedition : 150 000 EUR/an
- Seuil d'introduction : 200 000 EUR/an
- Declaration mensuelle au STATEC

## Calendrier recurrent

| Regime | Echeance declaration | Echeance paiement |
|--------|---------------------|-------------------|
| Mensuel | 15 du mois M+1 | 15 du mois M+1 |
| Trimestriel | 15 du mois suivant le trimestre | 15 du mois suivant le trimestre |
| Annuel | 1er mai N+1 | 1er mai N+1 |

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Client en retard sur les pieces | Relance WhatsApp J+3. Si J+10 → appel + avertir du risque d'amende |
| Facture sans mentions obligatoires | Demander au client de corriger ou obtenir une facture conforme du fournisseur |
| Ecart de rapprochement bancaire | Identifier la source (facture manquante, double saisie). Ne jamais forcer le rapprochement |
| Declaration en retard | Soumettre immediatement. Informer le client du risque de penalite (10% de majoration + interets) |
| Credit TVA important | Verifier si demande de remboursement possible ou report sur periode suivante |

## Checklist rapide

- [ ] Pieces de la periode recues (factures vente/achat, releves)
- [ ] Saisie effectuee, ventilation par taux
- [ ] Calcul TVA collectee / deductible / solde
- [ ] Declaration remplie sur eCDF
- [ ] Recapitulatif envoye au client pour validation
- [ ] Declaration soumise, accuse archive
- [ ] Client informe du montant a payer et de l'echeance
- [ ] VIES / Intrastat soumis si applicable
- [ ] Facture emise pour la prestation
