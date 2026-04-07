#!/usr/bin/env python3
"""
Enrich Salonkee prospects — Find salon owners/managers via Perplexity API.

Reads raw-salons.json, queries Perplexity for each salon's gérant/propriétaire,
and outputs enriched-salons.json + prospects.csv.

Usage:
  python3 tools/enrich-prospects.py --dry-run --limit 3    # Test sans appel API
  python3 tools/enrich-prospects.py --limit 10              # 10 premiers
  python3 tools/enrich-prospects.py                          # Tous
  python3 tools/enrich-prospects.py --salon "Adikt Barber"  # Un seul
  python3 tools/enrich-prospects.py --csv-only               # Regénérer le CSV sans enrichir
"""

import argparse
import csv
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    print("[ERREUR] pip install requests")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "salonkee-config.json"
TMP_DIR = SCRIPT_DIR.parent / ".tmp" / "salonkee"
RAW_PATH = TMP_DIR / "raw-salons.json"
ENRICHED_PATH = TMP_DIR / "enriched-salons.json"
CSV_PATH = TMP_DIR / "prospects.csv"

with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

DELAYS = CONFIG["delays"]

# Load .env from lk-hq (contains PERPLEXITY_API_KEY)
ENV_PATHS = [
    Path.home() / "projects" / "lk-hq" / ".env",
    SCRIPT_DIR.parent / ".env",
    Path(".env"),
]
if load_dotenv:
    for p in ENV_PATHS:
        if p.exists():
            load_dotenv(p)
            break

PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions"


# ---------------------------------------------------------------------------
# Perplexity API
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """Tu es un assistant de recherche business spécialisé dans le Luxembourg.
Tu dois trouver le gérant, propriétaire ou dirigeant d'un salon de beauté/coiffure au Luxembourg.

Sources prioritaires :
1. RCS Luxembourg (rcsl.lu) — Registre de Commerce et des Sociétés
2. LinkedIn
3. Editus.lu (annuaire professionnel)
4. Paperjam.lu (business news)
5. LBR.lu (Luxembourg Business Registers)
6. Google Business / sites web des salons

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks :
{
  "owner_name": "Prénom Nom ou null si introuvable",
  "owner_title": "Gérant|Propriétaire|Associé|Dirigeant|null",
  "rcs_number": "B123456 ou null",
  "linkedin_url": "URL ou null",
  "source": "rcsl.lu|linkedin.com|editus.lu|etc ou null",
  "confidence": "high|medium|low|none",
  "notes": "Détails additionnels utiles"
}

Si tu ne trouves pas d'information fiable, mets confidence à "none" et owner_name à null."""


def query_perplexity(salon_name, address, city):
    """Query Perplexity to find salon owner."""
    if not PERPLEXITY_API_KEY:
        return {"error": "PERPLEXITY_API_KEY non définie"}

    user_query = (
        f'Qui est le gérant ou propriétaire du salon "{salon_name}" '
        f'situé à {address}, {city}, Luxembourg ? '
        f'Cherche dans le RCS Luxembourg (rcsl.lu), LinkedIn, Editus.lu, Paperjam.lu.'
    )

    try:
        resp = requests.post(
            PERPLEXITY_URL,
            headers={
                "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "sonar",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_query},
                ],
                "temperature": 0.1,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return parse_perplexity_response(content)

    except requests.exceptions.RequestException as e:
        return {"error": str(e), "confidence": "none"}
    except (KeyError, IndexError) as e:
        return {"error": f"Réponse inattendue: {e}", "confidence": "none"}


def query_perplexity_fallback(salon_name, city):
    """Fallback query focusing on RCS Luxembourg."""
    if not PERPLEXITY_API_KEY:
        return {"error": "PERPLEXITY_API_KEY non définie"}

    user_query = (
        f'Recherche RCS Luxembourg pour "{salon_name}" {city}. '
        f'Trouve le numéro RCS et le nom du gérant sur rcsl.lu ou lbr.lu.'
    )

    try:
        resp = requests.post(
            PERPLEXITY_URL,
            headers={
                "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "sonar",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_query},
                ],
                "temperature": 0.1,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return parse_perplexity_response(content)

    except Exception as e:
        return {"error": str(e), "confidence": "none"}


def parse_perplexity_response(content):
    """Parse JSON from Perplexity response (handles markdown wrapping)."""
    # Strip markdown code block if present
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Try to find JSON in the text
        match = re.search(r"\{[^{}]+\}", content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return {
            "owner_name": None,
            "confidence": "none",
            "notes": f"Réponse non parsable: {content[:200]}",
            "raw_response": content[:500],
        }


# ---------------------------------------------------------------------------
# Enrichment logic
# ---------------------------------------------------------------------------

def enrich_salon(salon, dry_run=False):
    """Enrich a single salon with owner information."""
    name = salon.get("name", "")
    address = salon.get("address", "")
    city = salon.get("search_city", salon.get("city", "Luxembourg"))

    if dry_run:
        print(f"    [DRY-RUN] Query: \"{name}\" {address}, {city}")
        return {
            "owner_name": None,
            "confidence": "dry_run",
            "enriched_at": datetime.now().isoformat(),
        }

    # Primary query
    result = query_perplexity(name, address, city)

    # Fallback if no owner found
    if not result.get("owner_name") and result.get("confidence") != "high":
        print(f"    → Fallback RCS query...")
        time.sleep(1)
        fallback = query_perplexity_fallback(name, city)
        if fallback.get("owner_name"):
            result = fallback

    result["enriched_at"] = datetime.now().isoformat()
    return result


# ---------------------------------------------------------------------------
# CSV export
# ---------------------------------------------------------------------------

def generate_csv(salons):
    """Generate prospects.csv from enriched salons."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    # Sort: high confidence first, then medium, then low, then none
    confidence_order = {"high": 0, "medium": 1, "low": 2, "none": 3, "dry_run": 4}
    salons_sorted = sorted(
        salons,
        key=lambda s: confidence_order.get(s.get("owner_confidence", "none"), 4),
    )

    with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow([
            "Salon",
            "Adresse",
            "Ville",
            "Téléphone",
            "Note",
            "Avis",
            "Gérant",
            "Titre",
            "Confiance",
            "Source Gérant",
            "RCS",
            "LinkedIn",
            "URL Salonkee",
            "Notes",
        ])

        for s in salons_sorted:
            writer.writerow([
                s.get("name", ""),
                s.get("address", ""),
                s.get("search_city", s.get("city", "")),
                s.get("phone", ""),
                s.get("rating", ""),
                s.get("reviews_count", ""),
                s.get("owner_name", ""),
                s.get("owner_title", ""),
                s.get("owner_confidence", ""),
                s.get("owner_source", ""),
                s.get("rcs_number", ""),
                s.get("linkedin_url", ""),
                s.get("source_url", ""),
                s.get("owner_notes", ""),
            ])

    print(f"[OK] CSV exporté : {CSV_PATH}")
    print(f"     {len(salons_sorted)} lignes")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Enrichissement prospects Salonkee — Perplexity API")
    parser.add_argument("--dry-run", action="store_true", help="Simuler sans appeler l'API")
    parser.add_argument("--limit", type=int, help="Limiter le nombre de salons à enrichir")
    parser.add_argument("--salon", help="Enrichir un seul salon par nom")
    parser.add_argument("--csv-only", action="store_true", help="Regénérer le CSV sans enrichir")
    parser.add_argument("--force", action="store_true", help="Ré-enrichir même les salons déjà traités")
    args = parser.parse_args()

    # Check API key
    if not args.dry_run and not args.csv_only and not PERPLEXITY_API_KEY:
        print("[ERREUR] PERPLEXITY_API_KEY non trouvée.")
        print("         Vérifie ~/projects/lk-hq/.env ou caro-services/.env")
        return 1

    # Load raw salons
    if not RAW_PATH.exists():
        print(f"[ERREUR] {RAW_PATH} introuvable.")
        print("         Lance d'abord : python3 tools/scrape-salonkee.py")
        return 1

    with open(RAW_PATH) as f:
        salons = json.load(f)
    print(f"[INFO] {len(salons)} salons chargés depuis {RAW_PATH}")

    # Load existing enrichment data
    enriched_data = {}
    if ENRICHED_PATH.exists():
        with open(ENRICHED_PATH) as f:
            existing = json.load(f)
        for s in existing:
            slug = s.get("slug", "")
            if slug:
                enriched_data[slug] = s
        print(f"[INFO] {len(enriched_data)} salons déjà enrichis")

    # Merge existing enrichment into salons
    for s in salons:
        slug = s.get("slug", "")
        if slug in enriched_data:
            existing = enriched_data[slug]
            for key in ["owner_name", "owner_title", "owner_source", "owner_confidence",
                        "rcs_number", "linkedin_url", "owner_notes", "enriched_at"]:
                if existing.get(key):
                    s[key] = existing[key]

    # CSV-only mode
    if args.csv_only:
        generate_csv(salons)
        return 0

    # Filter salons to enrich
    if args.salon:
        to_enrich = [s for s in salons if args.salon.lower() in s.get("name", "").lower()]
        if not to_enrich:
            print(f"[ERREUR] Aucun salon trouvé contenant '{args.salon}'")
            return 1
    elif args.force:
        to_enrich = salons
    else:
        to_enrich = [s for s in salons if not s.get("owner_confidence") or s.get("owner_confidence") == "none"]

    if args.limit:
        to_enrich = to_enrich[:args.limit]

    if not to_enrich:
        print("[INFO] Tous les salons sont déjà enrichis. Utilise --force pour recommencer.")
        generate_csv(salons)
        return 0

    print(f"\n[INFO] {len(to_enrich)} salons à enrichir")
    if not args.dry_run:
        cost = len(to_enrich) * 0.002  # ~$0.001-0.002 par query avec fallback
        print(f"[INFO] Coût estimé : ~${cost:.2f}")

    # Enrich
    success = 0
    found = 0
    for i, salon in enumerate(to_enrich):
        name = salon.get("name", salon.get("slug", "?"))
        print(f"\n[{i+1}/{len(to_enrich)}] {name}")

        try:
            result = enrich_salon(salon, dry_run=args.dry_run)

            # Apply enrichment to salon
            salon["owner_name"] = result.get("owner_name")
            salon["owner_title"] = result.get("owner_title")
            salon["owner_source"] = result.get("source")
            salon["owner_confidence"] = result.get("confidence", "none")
            salon["rcs_number"] = result.get("rcs_number")
            salon["linkedin_url"] = result.get("linkedin_url")
            salon["owner_notes"] = result.get("notes", "")
            salon["enriched_at"] = result.get("enriched_at")

            success += 1
            if result.get("owner_name"):
                found += 1
                print(f"    ✓ {result['owner_name']} ({result.get('confidence', '?')})")
            else:
                print(f"    ✗ Aucun gérant trouvé ({result.get('confidence', '?')})")

        except Exception as e:
            print(f"    [ERREUR] {e}")
            salon["owner_confidence"] = "error"
            salon["owner_notes"] = str(e)

        # Rate limiting
        if not args.dry_run:
            time.sleep(DELAYS["between_enrichments"])

        # Save progress every 10 salons
        if (i + 1) % 10 == 0:
            save_enriched(salons)

    # Final save
    save_enriched(salons)
    generate_csv(salons)

    # Summary
    print(f"\n=== RÉSUMÉ ENRICHISSEMENT ===")
    print(f"Traités : {success}/{len(to_enrich)}")
    print(f"Gérants trouvés : {found}")
    print(f"Taux de succès : {found/max(success,1)*100:.0f}%")
    conf_counts = {}
    for s in salons:
        c = s.get("owner_confidence", "non traité")
        conf_counts[c] = conf_counts.get(c, 0) + 1
    for c, n in sorted(conf_counts.items()):
        print(f"  {c}: {n}")

    return 0


def save_enriched(salons):
    """Save enriched data."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    with open(ENRICHED_PATH, "w", encoding="utf-8") as f:
        json.dump(salons, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    sys.exit(main())
