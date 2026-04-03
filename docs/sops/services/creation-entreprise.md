# SOP : Creation d'Entreprise au Luxembourg

## Objectif

Accompagner un client dans la creation de son entreprise au Luxembourg — du choix de la forme juridique jusqu'au setup comptable initial. Prestation one-shot.

## Prerequis

- Acces CRM : crm.caroline-finance.com
- Connaissance des formes juridiques luxembourgeoises (SARL, SARL-S, SA)
- Contacts notaire (pour acte constitutif SARL/SA)
- Acces Guichet.lu (portail des formalites entreprises)

## Scope

**Caroline peut accompagner :**
- Choix de la forme juridique
- Preparation du business plan simplifie
- Coordination avec le notaire
- Inscription au RC (Registre de Commerce)
- Immatriculation TVA
- Affiliation CCSS
- Setup comptable initial
- Premiere declaration TVA

**Caroline ne peut PAS :**
- Rediger l'acte constitutif (reserve au notaire)
- Donner un conseil juridique sur la structure holding
- Realiser l'evaluation d'apports en nature (reserve au reviseur)

## Formes juridiques les plus courantes

| Forme | Capital min. | Nb associes | Responsabilite | Recommande pour |
|-------|-------------|-------------|----------------|-----------------|
| **SARL-S** | 1 EUR | 1-100 | Limitee aux apports | Freelances, micro-entreprises |
| **SARL** | 12 000 EUR | 1-100 | Limitee aux apports | TPE/PME classiques |
| **SA** | 30 000 EUR | 1+ | Limitee aux apports | PME structurees |

**Recommandation par defaut** : SARL-S pour les independants et petits projets (capital minimum 1 EUR, formalites simplifiees).

## Pipeline

### Etape 1 — Qualification du projet

1. RDV de consultation (1h-1h30) avec le futur createur :
   - Nature de l'activite
   - Estimation du CA previsionnel
   - Nombre d'associes
   - Capital disponible
   - Besoins en salaries
   - Activite reglementee ? (autorisation d'etablissement requise ?)
2. Recommander la forme juridique adaptee
3. Estimer le budget de creation :

| Poste | Cout estime |
|-------|-------------|
| Frais de notaire (SARL) | 1500-2500 EUR |
| Frais de notaire (SARL-S) | 500-800 EUR (acte sous seing prive possible) |
| Publication au Memorial | ~200 EUR |
| Inscription RC | ~75 EUR |
| Autorisation d'etablissement | ~50-100 EUR |
| Accompagnement Caroline | Sur devis |

### Etape 2 — Autorisation d'etablissement

Si l'activite est reglementee (artisanat, commerce, industrie, professions liberales) :

1. Verifier si une qualification professionnelle est requise
2. Preparer la demande d'autorisation d'etablissement aupres de la Direction generale PME et Entrepreneuriat
3. Documents requis :
   - [ ] Copie piece d'identite
   - [ ] Diplomes / qualifications professionnelles
   - [ ] Extrait de casier judiciaire (< 3 mois)
   - [ ] Certificat de non-faillite (pays de residence)
4. Delai : 4-8 semaines

### Etape 3 — Constitution de la societe

**Pour une SARL-S (simplifie)** :
1. Rediger les statuts (modele standard disponible)
2. Possibilite d'acte sous seing prive (pas de notaire obligatoire si capital <= 5000 EUR)
3. Ouvrir un compte bancaire au nom de la societe en formation
4. Deposer le capital social

**Pour une SARL/SA** :
1. Coordonner avec le notaire :
   - Fournir les informations pour l'acte constitutif (denomination, siege, objet social, capital, associes, gerant)
   - Fixer la date du rendez-vous chez le notaire
2. Ouvrir le compte bancaire bloque (capital minimum)
3. Signer l'acte constitutif chez le notaire
4. Le notaire procede a la publication au Memorial

### Etape 4 — Inscriptions et immatriculations

1. **Registre de Commerce (RC)** :
   - Demande d'immatriculation via Guichet.lu
   - Obtenir le numero RC (B + numero)
   - Delai : 1-2 semaines

2. **Immatriculation TVA** :
   - Demande aupres de l'Administration de l'Enregistrement et des Domaines (AED)
   - Formulaire 803 + justificatifs
   - Obtenir le numero TVA (LU + 8 chiffres)
   - Delai : 2-4 semaines

3. **Affiliation CCSS** :
   - Declaration d'affiliation employeur (si salaries prevus)
   - Declaration d'affiliation travailleur independant
   - Obtenir le matricule employeur
   - Delai : 1-2 semaines

### Etape 5 — Setup comptable initial

1. Parametrer le plan comptable (PCN luxembourgeois)
2. Saisir l'ecriture de constitution :
   - Debit : Banque (512) — montant du capital verse
   - Credit : Capital social (101) — montant du capital
3. Saisir les frais de constitution (comptes 6xxx)
4. Parametrer les journaux (VE, AC, BQ, OD)
5. Si TVA : parametrer le regime (mensuel/trimestriel selon CA previsionnel)

### Etape 6 — Livraison et transition

1. Remettre au client un dossier complet :
   - [ ] Copie des statuts
   - [ ] Numero RC
   - [ ] Numero TVA
   - [ ] Matricule CCSS
   - [ ] Acces au logiciel comptable (si applicable)
   - [ ] Calendrier des obligations (TVA, CCSS, IS, RCS)
2. Proposer un contrat de suivi comptable mensuel (voir SOP comptabilite-mensuelle.md)
3. Planifier la premiere declaration TVA

**CRM** : Creer le Contact en `client`, creer les dossiers recurrents (TVA, comptabilite, etc.)

## Calendrier type (SARL-S)

| Semaine | Etape |
|---------|-------|
| S1 | Consultation + choix forme juridique |
| S2-S3 | Autorisation d'etablissement (si reglemente) |
| S3-S4 | Redaction statuts + ouverture compte bancaire |
| S4-S5 | Acte constitutif + publication |
| S5-S6 | Inscription RC + immatriculation TVA |
| S6-S7 | Affiliation CCSS + setup comptable |
| S7-S8 | Livraison dossier + transition suivi mensuel |

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Activite reglementee sans qualification | Orienter vers une formation ou VAE. Bloquer la creation jusqu'a obtention de l'autorisation |
| Denomination sociale deja prise | Verifier sur le site du RC avant constitution. Proposer des alternatives |
| Banque refuse l'ouverture de compte | Essayer une autre banque. Les neobanques (Revolut Business, Qonto) acceptent souvent plus facilement |
| Capital non libere dans les delais | Relancer le client. La constitution est bloquee tant que le capital n'est pas verse |
| Client depasse les seuils (> 2.3M EUR bilan previsionnel) | Orienter vers un expert-comptable agree des le depart |

## Checklist rapide

- [ ] Consultation initiale effectuee, forme juridique choisie
- [ ] Autorisation d'etablissement obtenue (si applicable)
- [ ] Statuts rediges / acte constitutif signe
- [ ] Compte bancaire ouvert, capital verse
- [ ] Publication au Memorial effectuee
- [ ] Inscription au RC obtenue (numero B)
- [ ] Immatriculation TVA obtenue (numero LU)
- [ ] Affiliation CCSS effectuee
- [ ] Setup comptable realise
- [ ] Dossier complet remis au client
- [ ] Contrat de suivi mensuel propose
