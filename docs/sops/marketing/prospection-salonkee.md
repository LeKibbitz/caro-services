# SOP : Prospection Salonkee

## Objectif

Generer des prospects qualifies parmi les salons de beaute/bien-etre au Luxembourg via scraping de salonkee.lu, enrichissement des donnees, et outreach cible. Ces salons sont des TPE qui ont besoin de comptabilite et declarations fiscales.

## Prerequis

- Extension Chrome "Salonkee Prospector" installee (dans `salonkee-extension/`)
- Cle API Perplexity (pour enrichissement)
- Acces CRM : crm.caroline-finance.com
- Scripts CLI backup : `tools/scrape-salonkee.py` + `tools/enrich-prospects.py`

## Configuration

**Categories ciblees** (7) : hairdressers, barbers, beauty-salons, nail-studios, massage, spa-wellness, tattoo-piercing

**Villes ciblees** (16) : Luxembourg, Esch-sur-Alzette, Differdange, Dudelange, Ettelbruck, Strassen, Bertrange, Hesperange, Mersch, Petange, Bettembourg, Remich, Diekirch, Grevenmacher, Echternach, Wiltz

**Fichier config** : `tools/salonkee-config.json`

## Pipeline

### Etape 1 — Scraping (extension Chrome)

1. Ouvrir Chrome avec l'extension Salonkee Prospector
2. Naviguer sur salonkee.lu
3. Selectionner une categorie + ville
4. L'extension extrait automatiquement :
   - Nom du salon
   - Adresse
   - Telephone
   - Note et nombre d'avis
   - Services proposes
   - Nombre d'employes (staff visible)
5. Exporter les donnees brutes

**Alternative CLI** (si l'extension ne fonctionne pas) :
```bash
cd tools/
python3 scrape-salonkee.py
```
Le script Playwright navigue les pages Angular, respecte les delais (`between_searches: 3s`, `between_salons: 1.5s`).

### Etape 2 — Enrichissement (Perplexity)

Pour chaque salon scrape, enrichir avec le nom du gerant/proprietaire :

**Via extension** : clic sur le bouton "Enrich" dans l'extension (appel API Perplexity en background)

**Via CLI** :
```bash
python3 enrich-prospects.py --input .tmp/salonkee/raw_results.json --output .tmp/salonkee/enriched.csv
```

Le script interroge Perplexity pour chaque salon : "Who is the owner/manager of [salon name] in [city], Luxembourg?"

**Delai** : 2s entre chaque enrichissement (config `between_enrichments: 2`).

### Etape 3 — Qualification CSV

Ouvrir le fichier CSV enrichi et filtrer les prospects :

| Critere | Garder | Exclure |
|---------|--------|---------|
| Proprietaire identifie | Oui | Pas de nom → non qualifie |
| Telephone disponible | Oui | Pas de tel → difficile a contacter |
| Avis > 10 | Prioritaire | Peu d'avis → salon peu actif |
| Plusieurs employes | Prioritaire | Solo → moins de besoins compta |
| Franchise/chaine | Non | Comptabilite deja centralisee |

Trier par priorite : salons avec le plus d'employes et d'avis en premier.

### Etape 4 — Import CRM

1. Ouvrir crm.caroline-finance.com
2. Pour chaque prospect qualifie, creer un Contact :
   - Type : `prospect`
   - Nom : proprietaire/gerant
   - Company name : nom du salon
   - Telephone : numero du salon
   - City : ville
   - Country : Luxembourg
   - Source : `salonkee`
   - Notes : categorie, nombre d'employes, note, avis

### Etape 5 — Outreach

**Canal principal** : WhatsApp ou appel telephonique (pas d'email froid — taux de reponse trop bas)

**Script d'approche (WhatsApp)** :
```
Bonjour [Prenom],

Je suis Caroline Charpentier, specialiste en fiscalite et comptabilite
pour les independants au Luxembourg.

Je vous contacte car je propose des services de tenue comptable et
declarations TVA adaptes aux salons de beaute, a des tarifs 40% moins
chers que les fiduciaires classiques.

Seriez-vous interesse(e) par un echange de 15 minutes pour voir si
je peux vous aider ?

Caroline — caroline-finance.com
```

**Script d'approche (appel)** :
1. Se presenter : nom + activite
2. Demander si le moment est opportun
3. Expliquer l'offre en 30 secondes (comptabilite + TVA, 40% moins cher)
4. Proposer un RDV de 15 min
5. Si interesse → envoyer le lien WhatsApp ou email

### Etape 6 — Suivi

1. Tracker les reponses dans le CRM (notes sur le Contact)
2. Si interesse → passer en pipeline onboarding (voir SOP onboarding-client.md)
3. Si pas de reponse → relance a J+7 (1 seule relance)
4. Si refus → noter la raison dans le CRM, ne pas relancer

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Salonkee bloque le scraping | Augmenter les delais dans salonkee-config.json. Utiliser l'extension Chrome plutot que le CLI |
| Perplexity ne trouve pas le proprietaire | Chercher manuellement sur LinkedIn ou pages jaunes luxembourgeoises (editus.lu) |
| Taux de reponse tres bas (< 5%) | Revoir le script d'approche, tester un autre canal (visite physique ?) |
| Prospect deja client d'une fiduciaire | Proposer un audit gratuit de ses frais actuels pour montrer les economies possibles |

## Checklist rapide

- [ ] Categorie + ville selectionnees
- [ ] Scraping effectue (extension ou CLI)
- [ ] Enrichissement Perplexity execute
- [ ] CSV filtre et prospects qualifies
- [ ] Prospects importes dans le CRM
- [ ] Messages d'approche envoyes
- [ ] Relances J+7 effectuees
- [ ] Resultats trackes dans le CRM
