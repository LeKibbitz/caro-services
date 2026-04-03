# SOP : Onboarding Client

## Objectif

Transformer un prospect en client actif dans le CRM, du premier contact jusqu'a la signature du devis et la creation du dossier fiscal.

## Prerequis

- Acces CRM : crm.caroline-finance.com (role admin)
- WhatsApp Business : +352 661 521 101
- Email : contact@caroline-finance.com
- Grille tarifaire a jour (voir masterplan §Grille Tarifaire)

## Pipeline

### Etape 1 — Reception du lead

Le prospect arrive par l'un de ces canaux :

| Canal | Action |
|-------|--------|
| Formulaire site (caroline-finance.com) | Notification email → creer Contact dans CRM (source: `website`) |
| WhatsApp | Message direct → creer Contact dans CRM (source: `whatsapp`) |
| Telephone | Appel → creer Contact dans CRM (source: `phone`) |
| Google Ads | Click → formulaire site → meme pipeline (source: `google_ads`) |
| Reseaux sociaux | DM Instagram/TikTok/LinkedIn → rediriger vers WhatsApp |
| Referral | Contact recommande → creer Contact dans CRM (source: `referral`) |

**CRM** : Creer le Contact avec type `prospect`, renseigner nom, email, telephone, source.

### Etape 2 — Qualification (15 min max)

Appel decouverte gratuit ou echange WhatsApp. Questions cles :

1. **Situation** : Frontalier FR→LU ? Resident LU ? Independant ? Dirigeant SARL ?
2. **Besoins** : Declaration IR ? TVA ? Comptabilite complete ? Creation entreprise ?
3. **Historique** : Premier exercice ? Changement de fiduciaire ? Retard de declarations ?
4. **Volume** : Nombre d'employes ? CA approximatif ? Nombre de factures/mois ?
5. **Urgence** : Echeance fiscale proche ? Courrier de l'ACD ?

**Verifier le scope** : le client est-il dans les limites (bilan <= 2.3M EUR, CA <= 4.6M EUR) ? Si hors scope → orienter vers une fiduciaire certifiee.

### Etape 3 — Devis

1. Ouvrir le CRM → Contact → bouton "Nouveau devis"
2. Selectionner les prestations depuis la grille tarifaire :

| Prestation | Tarif Caroline | Fiduciaire LU |
|------------|---------------|---------------|
| Declaration IR (personne physique) | 220-320 EUR | 400-600 EUR |
| Declaration TVA mensuelle | 150-180 EUR | 250-300 EUR |
| Declaration TVA trimestrielle | 250-300 EUR | 400-500 EUR |
| Declaration TVA annuelle | 500-700 EUR | 800-1200 EUR |
| Declaration IS (societe) | 400-600 EUR | 600-1000 EUR |
| Tenue comptable mensuelle | 200-350 EUR/mois | 400-600 EUR/mois |
| Cloture annuelle + depot RCS | 1200-1800 EUR | 2000-3000 EUR |

3. Appliquer la reduction fidelite si applicable (-15% annee 2, -20% annee 3+)
4. Generer le devis (statut `draft`) → relire → passer en `sent`
5. Envoyer par email ou WhatsApp

### Etape 4 — Signature

1. Attendre la reponse du prospect (relance J+1, J+3, J+7 si pas de reponse)
2. Si accepte → passer le devis en `accepted`
3. Passer le Contact de `prospect` a `client`
4. Creer la facture d'acompte si applicable

### Etape 5 — Setup dossier

1. Creer le(s) Dossier(s) dans le CRM selon les prestations :
   - Type : `ir`, `tva_mensuelle`, `is`, `comptabilite`, `ccss`, `coordination`
   - Annee : exercice en cours
   - Statut initial : `todo`
2. Envoyer la liste de documents requis au client (voir SOP specifique du service)
3. Creer un RDV de lancement dans le CRM (type `consultation`, 30 min)
4. Passer le dossier en `docs_pending`

### Etape 6 — Message de bienvenue

Envoyer un message WhatsApp/email de bienvenue :
- Recapitulatif des prestations
- Liste des documents a fournir
- Date du prochain RDV
- Coordonnees de Caroline pour les questions

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Prospect hors scope (bilan > 2.3M EUR) | Refuser poliment, orienter vers fiduciaire certifiee. Ne pas creer de devis |
| Prospect ne repond plus | Relance J+1, J+3, J+7 par WhatsApp. Apres J+14, passer en `ancien` dans le CRM |
| Devis rejete | Demander le motif. Ajuster le tarif si justifie. Garder le contact dans le CRM pour relance future |
| Client veut un service interdit (audit, conseil fiscal strategique) | Expliquer le cadre legal. Proposer un partenaire expert-comptable agree |

## Checklist rapide

- [ ] Lead recu → Contact cree dans CRM (type `prospect`)
- [ ] Qualification effectuee (situation, besoins, scope verifie)
- [ ] Devis genere et envoye
- [ ] Devis accepte → Contact passe en `client`
- [ ] Dossier(s) cree(s) dans le CRM
- [ ] Liste de documents envoyee
- [ ] RDV de lancement planifie
- [ ] Message de bienvenue envoye
