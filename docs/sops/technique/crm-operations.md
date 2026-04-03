# SOP : CRM Operations

## Objectif

Utiliser crm.caroline-finance.com pour gerer le cycle de vie complet des clients — de la prospection a la facturation, en passant par les dossiers fiscaux.

## Prerequis

- Acces admin : crm.caroline-finance.com (magic link authentication)
- CRM deploye et fonctionnel (Next.js + PostgreSQL sur VPS)

## Architecture CRM

```
crm.caroline-finance.com
├── Auth : Magic Link (email → lien unique → session)
├── Admin : /admin (gestion complete)
└── Portal : /portal (acces client en lecture)
```

**Stack** : Next.js 16, React 19, Prisma 7.5, PostgreSQL 16, shadcn/ui, Tailwind v4

## Modele de donnees

### Contact (prospect → client → ancien)

| Champ | Description |
|-------|-------------|
| type | `prospect`, `client`, `ancien` |
| firstName / lastName | Nom complet |
| email | Email principal |
| phone | Telephone |
| companyName | Nom de la societe (si applicable) |
| address / city / country | Adresse (defaut: Luxembourg) |
| waId | WhatsApp ID (pour integration future) |
| source | Origine : `website`, `whatsapp`, `phone`, `google_ads`, `referral`, `salonkee`, `linkedin` |
| notes | Notes libres |

### Quote (devis)

| Statut | Signification |
|--------|--------------|
| `draft` | Brouillon en preparation |
| `sent` | Envoye au client |
| `accepted` | Accepte → creer facture + dossiers |
| `rejected` | Refuse (noter le motif) |
| `expired` | Expire (depasse validUntil) |

**Champs** : items (JSON — lignes de prestation), subtotal, taxRate, taxAmount, total, validUntil, notes

### Invoice (facture)

| Statut | Signification |
|--------|--------------|
| `draft` | Brouillon |
| `sent` | Envoyee au client |
| `paid` | Payee (paidAt + paymentMethod renseignes) |
| `overdue` | En retard (dueDate depassee) |
| `cancelled` | Annulee |

Liee a un Quote (optionnel). Memes champs financiers que Quote + dueDate, paidAt, paymentMethod.

### Dossier (dossier fiscal)

| Type | Description |
|------|-------------|
| `tva_mensuelle` | Declaration TVA mensuelle |
| `ir` | Declaration impot sur le revenu |
| `is` | Declaration impot sur les societes |
| `comptabilite` | Tenue comptable |
| `ccss` | Declarations sociales |
| `coordination` | Dossier multi-prestations |

**Workflow statut** :

```
todo → docs_pending → in_progress → review → done
```

| Statut | Signification |
|--------|--------------|
| `todo` | A traiter (prestation identifiee) |
| `docs_pending` | En attente de documents client |
| `in_progress` | Travail en cours par Caroline |
| `review` | En revue / validation client |
| `done` | Termine, livre |

**Champs** : year, period (ex: "M01", "Q1", "2026"), deadline, checklist (JSON), notes

### Document

Fichiers attaches aux dossiers et contacts. Champs : name, path, mimeType, size, uploadedBy.

### Appointment (rendez-vous)

| Type | Description |
|------|-------------|
| `consultation` | Premier RDV, decouverte |
| `suivi` | RDV de suivi recurrent |
| `admin` | RDV administratif |

Statuts : `scheduled`, `done`, `cancelled`.

### Message (inbox unifiee)

Canaux : `whatsapp`, `email`. Directions : `in`, `out`. Champs : fromAddr, toAddr, subject, body, read.

## Module Leads & Prospection (ajouté avril 2026)

Le CRM intègre un module complet de prospection pour les salons beauté luxembourgeois (source Salonkee).

### Structure Lead

| Champ | Description |
|-------|-------------|
| salonName | Nom du commerce |
| ownerName / ownerTitle | Gérant identifié + titre |
| ownerConfidence | `high`, `medium`, `low`, `none` |
| phones / emails | Tableaux (plusieurs numéros/adresses) |
| activityType | Type d'activité (coiffure, esthétique...) |
| sourceUrl | URL profil Salonkee |
| status | `new` → `contacted` → `replied` → `qualified` → `converted` / `lost` |

**Import** : via CSV ou scraping Salonkee (`/leads/import`). Enrichissement automatique via Claude (`/api/leads/[id]/enrich`).

### Outreach (messages sortants)

Depuis la fiche lead, section "Nouveau contact" :

1. **Canal** : WhatsApp, Email ou SMS
2. **Modèles** : sélectionner parmi les modèles enregistrés (variables `[Prénom]`, `[Nom]`, `[Salon]`)
3. **Carte de visite** : choisir une version (V1–V20) à joindre manuellement
4. **Envoyer maintenant** : envoi direct via bridge WhatsApp / SMTP

**Variables disponibles** : `[Prénom]` · `[Nom]` · `[Salon]`

### Modèles de messages (`/templates`)

Templates par canal (WhatsApp, Email, SMS). Modèles par défaut créés en seed :

| Canal | Modèle | Usage |
|-------|--------|-------|
| WhatsApp | Intro WhatsApp | Premier contact — naturel, sans répétition du prénom |
| WhatsApp | Relance WhatsApp | Relance après silence |
| Email | Intro Email | Premier contact professionnel |
| Email | Relance Email | Relance avec suivi |
| SMS | Intro SMS | Contact court, direct |

### Cartes de visite (`/business-cards`)

20 versions HTML disponibles. Pour envoyer via WhatsApp :
1. Aller sur `/business-cards` ou ouvrir `/cartes-de-visite.html`
2. Choisir une version et faire une capture d'écran
3. Joindre l'image dans le message WhatsApp

Le sélecteur dans le formulaire d'outreach rappelle quelle carte est prévue et note le choix dans l'historique.

### Convertir un Lead en Contact

Bouton "Convertir" sur la fiche lead → crée automatiquement un Contact avec les données du lead.

## Operations courantes

### Nouveau prospect

1. Menu → Contacts → Nouveau contact
2. Remplir : prenom, nom, email, telephone, source
3. Type : `prospect`
4. Sauvegarder

### Convertir prospect → client

1. Ouvrir le contact
2. Creer un devis (bouton "Nouveau devis")
3. Ajouter les lignes de prestation
4. Envoyer le devis → statut `sent`
5. Quand accepte → statut `accepted`
6. Modifier le type du contact : `prospect` → `client`
7. Creer les dossiers correspondants

### Creer un dossier fiscal

1. Contact → Dossiers → Nouveau dossier
2. Selectionner : type (`ir`, `tva_mensuelle`, `is`, `comptabilite`, `ccss`)
3. Renseigner : annee, periode, deadline
4. Ajouter la checklist de documents (JSON)
5. Statut initial : `todo` ou `docs_pending`

### Emettre une facture

1. Depuis le devis accepte → bouton "Creer facture"
2. Ou : Contact → Factures → Nouvelle facture
3. Renseigner les lignes, montants, date d'echeance
4. Statut `draft` → relire → `sent`
5. Quand payee : `paid` + renseigner paidAt et paymentMethod

### Suivre les echeances

Consulter les dossiers par statut :
- `docs_pending` : relancer les clients pour les documents
- `in_progress` : travail en cours, verifier les deadlines
- `review` : en attente de validation client
- Dossiers avec deadline proche : prioriser

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Magic link expire | Renvoyer un nouveau magic link depuis la page de login |
| Doublon de contact | Fusionner manuellement (garder le plus complet, supprimer le doublon) |
| Facture envoyee avec erreur | Annuler (`cancelled`), creer une nouvelle facture corrigee |
| Dossier bloque en `docs_pending` depuis > 2 semaines | Relancer le client par WhatsApp + appel. Proposer un RDV pour debloquer |

## Checklist rapide

- [ ] Contacts a jour (nouveaux prospects saisis, types corrects)
- [ ] Devis en attente traites (draft → sent, ou relances envoyees)
- [ ] Dossiers en `docs_pending` relances
- [ ] Factures `overdue` suivies
- [ ] RDV de la semaine prepares
