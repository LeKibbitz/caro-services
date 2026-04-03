# SOP : Declarations CCSS & Gestion de Paie

## Objectif

Gerer la paie et les declarations sociales aupres du Centre Commun de la Securite Sociale (CCSS) pour les clients employeurs au Luxembourg.

## Prerequis

- Acces CCSS (SECUline — portail employeur)
- Acces CRM : crm.caroline-finance.com
- Dossier CRM du client (type `ccss`)
- Matricule employeur CCSS du client
- Convention collective applicable (si existante)

## Pipeline

### Etape 1 — Setup initial (nouveau client employeur)

Pour chaque nouveau client avec salaries :

1. Obtenir le matricule employeur CCSS
2. Collecter les informations de chaque salarie :
   - Matricule CNS (13 chiffres)
   - Contrat de travail (type, duree, salaire brut, avantages)
   - Classe d'impot (1, 1a, ou 2) + fiche de retenue d'impot
   - Coordonnees bancaires (IBAN)
3. Parametrer dans le logiciel de paie :
   - Taux de cotisations sociales (patronales + salariales)
   - Bareme fiscal applicable
   - Conges legaux (26 jours ouvrables minimum)

### Etape 2 — Bulletins de salaire mensuels

A realiser avant le 15 du mois M+1 :

1. Collecter les elements variables du mois :
   - [ ] Heures supplementaires
   - [ ] Absences (maladie, conge, sans solde)
   - [ ] Primes et commissions
   - [ ] Avantages en nature
   - [ ] Indemnites de deplacement
2. Calculer le bulletin de paie :
   - Salaire brut
   - Cotisations salariales CCSS (~12.45% : maladie 2.8%, pension 8%, dependance 1.4%, sante au travail 0.25%)
   - Retenue d'impot a la source (bareme RTS)
   - Salaire net
3. Calculer les charges patronales :
   - ~12.67% : maladie 2.8%, pension 8%, accidents 0.87%, dependance 0%, sante au travail 0.25%, mutualite 0.75%
4. Generer le bulletin PDF → envoyer au client pour distribution

### Etape 3 — Declaration CCSS mensuelle

1. Se connecter a SECUline
2. Soumettre la declaration mensuelle :
   - Masse salariale brute
   - Cotisations patronales et salariales
   - Detail par salarie
3. Verifier le montant des cotisations a payer
4. Rappeler au client l'echeance de paiement CCSS (le 10 du mois M+2)
5. Telecharger l'accuse de reception

### Etape 4 — Declarations annuelles

**Declaration annuelle des salaires (avant le 1er mars N+1)** :
1. Recapitulatif annuel par salarie (salaire brut, cotisations, retenue impot)
2. Soumission a l'ACD (Administration des Contributions Directes)
3. Fournir a chaque salarie son certificat de remuneration annuel

**Declaration annuelle CCSS** :
1. Recapitulatif annuel des cotisations versees
2. Regularisation eventuelle (trop-percu ou complement)

### Etape 5 — Evenements exceptionnels

| Evenement | Action |
|-----------|--------|
| Embauche | Declaration d'entree CCSS (sous 8 jours), mise a jour paie |
| Depart | Declaration de sortie CCSS, solde de tout compte, certificat de travail |
| Maladie longue duree | Declaration CCSS, suivi indemnites journalieres CNS |
| Accident de travail | Declaration AAA (Association d'Assurance Accident), suivi |
| Conge parental | Declaration CCSS, ajustement cotisations |
| Augmentation de salaire | Avenant contrat, mise a jour parametres paie |

## Calendrier recurrent

| Echeance | Date |
|----------|------|
| Bulletins de paie | Avant le 15 du mois M+1 |
| Declaration CCSS mensuelle | Avant le 15 du mois M+1 |
| Paiement cotisations CCSS | Le 10 du mois M+2 |
| Declaration annuelle des salaires | Avant le 1er mars N+1 |
| Certificats annuels aux salaries | Avant le 1er mars N+1 |

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Elements variables recus en retard | Emettre un bulletin provisoire, regulariser le mois suivant |
| Erreur sur un bulletin emis | Emettre un bulletin rectificatif le mois suivant (contrepassation + correction) |
| Cotisations CCSS impayees | Alerter le client immediatement — penalites de retard + risque de poursuites |
| Salarie conteste son bulletin | Verifier les calculs, expliquer au client, corriger si erreur avere |
| Changement de convention collective | Mettre a jour les parametres (salaire minimum, primes, conges) |

## Checklist rapide

- [ ] Elements variables du mois collectes
- [ ] Bulletins de paie calcules et generes
- [ ] Bulletins envoyes au client
- [ ] Declaration CCSS mensuelle soumise sur SECUline
- [ ] Client informe du montant et de l'echeance de paiement
- [ ] Ecritures de paie saisies en comptabilite (si tenue comptable)
- [ ] Facture de prestation emise
