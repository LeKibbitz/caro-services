#!/usr/bin/env python3
"""
Salonkee.lu Scraper — Extract salon listings for Caroline Finance prospection.

Launches a Playwright Chromium browser to scrape the Angular SPA.
Extracts: salon name, address, phone, rating, reviews, services, staff.

Usage:
  python3 tools/scrape-salonkee.py --debug                                    # Dump DOM structure
  python3 tools/scrape-salonkee.py --category hairdressers --city luxembourg   # One combo
  python3 tools/scrape-salonkee.py --all                                       # All combos
  python3 tools/scrape-salonkee.py --details-only                              # Enrich existing raw-salons.json with detail pages
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "salonkee-config.json"
OUTPUT_DIR = SCRIPT_DIR.parent / ".tmp" / "salonkee"
OUTPUT_PATH = OUTPUT_DIR / "raw-salons.json"
PROFILE_DIR = os.path.expanduser("~/.playwright-salonkee-profile")

with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

BASE_URL = CONFIG["base_url"]
DELAYS = CONFIG["delays"]


# ---------------------------------------------------------------------------
# Browser launch
# ---------------------------------------------------------------------------

def launch_browser(pw, headless=True):
    """Launch Chromium with persistent profile."""
    print("Lancement du navigateur...")
    ctx = pw.chromium.launch_persistent_context(
        PROFILE_DIR,
        headless=headless,
        viewport={"width": 1400, "height": 900},
        args=["--disable-blink-features=AutomationControlled"],
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ),
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    return ctx, page


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def wait_for_content(page, timeout=10000):
    """Wait for the SPA to finish rendering content."""
    page.wait_for_timeout(1500)
    try:
        # Wait for any salon card or list container to appear
        page.wait_for_selector(
            "[class*='salon'], [class*='Salon'], [class*='card'], [class*='result'], [class*='list']",
            timeout=timeout,
        )
    except PWTimeout:
        pass
    page.wait_for_timeout(1000)


def scroll_to_load_all(page, max_scrolls=20):
    """Scroll down to trigger lazy loading of all results."""
    prev_count = 0
    for i in range(max_scrolls):
        count = page.evaluate("""() => {
            var cards = document.querySelectorAll('a[href*="/salon/"]');
            return cards.length;
        }""")
        if count == prev_count and i > 0:
            break
        prev_count = count
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(1500)
    return prev_count


def dump_page_structure(page):
    """Dump useful DOM info for debugging selectors."""
    return page.evaluate("""() => {
        var r = {
            url: location.href,
            title: document.title,
            salonLinks: [],
            allLinks: [],
            headings: [],
            bodyPreview: '',
            classNames: []
        };

        // Find all links pointing to /salon/
        document.querySelectorAll('a[href*="/salon/"]').forEach(a => {
            r.salonLinks.push({
                href: a.getAttribute('href'),
                text: a.textContent.trim().substring(0, 200),
                classes: a.className,
                parentClasses: a.parentElement ? a.parentElement.className : '',
                innerHTML: a.innerHTML.substring(0, 500)
            });
        });

        // Headings
        document.querySelectorAll('h1,h2,h3,h4,h5').forEach(h => {
            r.headings.push(h.textContent.trim().substring(0, 120));
        });

        // Unique class names (for selector discovery)
        var classes = new Set();
        document.querySelectorAll('*').forEach(el => {
            el.classList.forEach(c => classes.add(c));
        });
        r.classNames = Array.from(classes).sort().slice(0, 200);

        r.bodyPreview = document.body.innerText.substring(0, 5000);
        return r;
    }""")


# ---------------------------------------------------------------------------
# Search page extraction
# ---------------------------------------------------------------------------

def extract_search_results(page):
    """Extract salon cards from a search results page.

    DOM structure (discovered via --debug on 2026-03-23):
      div.salon > a[href="/salon/{slug}"] > div.salon-card.row
        Text content pattern: "Nouveau? {Name} {reviewCount} {address} L-{postal} {description} {services...}"
        Address pattern: "N, Rue XYZ  Quartier L-XXXX"
    """
    return page.evaluate("""() => {
        var salons = [];
        var seen = new Set();

        // Salon cards are inside div.salon containers
        var cards = document.querySelectorAll('.salon');
        if (cards.length === 0) {
            // Fallback: find links to /salon/
            cards = document.querySelectorAll('a[href*="/salon/"]');
        }

        for (var card of cards) {
            var link = card.tagName === 'A' ? card : card.querySelector('a[href*="/salon/"]');
            if (!link) continue;

            var href = link.getAttribute('href') || '';
            // Extract slug: /salon/adikt-barber?search=hairdressers -> adikt-barber
            var slug = href.replace(/.*\\/salon\\//, '').replace(/[?#].*/, '');
            if (!slug || seen.has(slug)) continue;
            seen.add(slug);

            var text = card.innerText || '';
            var lines = text.split('\\n').map(l => l.trim()).filter(l => l.length > 0);

            // Name: first meaningful line (skip "Nouveau" badge)
            var name = '';
            for (var line of lines) {
                if (line === 'Nouveau' || line.length < 2) continue;
                name = line;
                break;
            }

            // Reviews count: standalone number after the name
            var reviewsCount = null;
            for (var j = 0; j < lines.length; j++) {
                if (/^\\d+$/.test(lines[j]) && parseInt(lines[j]) > 0) {
                    reviewsCount = parseInt(lines[j]);
                    break;
                }
            }

            // Address: line matching Luxembourg postal code pattern (L-XXXX)
            var address = '';
            var district = '';
            for (var line of lines) {
                if (/L-\\d{4}/.test(line)) {
                    address = line;
                    break;
                }
            }
            // Also look for district (line before L-XXXX that contains /)
            for (var line of lines) {
                if (line.includes('/') && !line.includes('http') && line.length < 60) {
                    district = line;
                    break;
                }
            }

            salons.push({
                name: name,
                slug: slug,
                href: href,
                address: address,
                district: district,
                reviews_count: reviewsCount,
                card_text: lines.slice(0, 8).join(' | ')
            });
        }
        return salons;
    }""")


# ---------------------------------------------------------------------------
# Salon detail page extraction
# ---------------------------------------------------------------------------

def extract_salon_details(page):
    """Extract detailed info from an individual salon page.

    DOM structure (discovered via --debug on 2026-03-23):
      h1 = salon name
      a[href^="tel:"] = phone number (e.g. +352621962520)
      .information section = address, hours, contact
      .description / .expandable-text = salon description
      .services-list = list of services with prices
      table rows with day + hours = opening hours
      Body text pattern: "N, Rue XYZ Quartier L-XXXX"
    """
    return page.evaluate("""() => {
        var details = {
            name: '',
            address: '',
            phone: '',
            staff: [],
            services: [],
            hours: '',
            description: ''
        };

        // Name — h1 on salon detail page
        var h1 = document.querySelector('h1');
        if (h1) details.name = h1.textContent.trim();

        // Phone — tel: link
        var phoneLink = document.querySelector('a[href^="tel:"]');
        if (phoneLink) {
            details.phone = phoneLink.getAttribute('href').replace('tel:', '').trim();
            // Format: add spaces for readability
            var p = details.phone.replace(/[^+\\d]/g, '');
            if (p.startsWith('+352') && p.length > 7) {
                details.phone = p;
            }
        }

        // Address — look for L-XXXX pattern in body text
        var bodyText = document.body.innerText;
        // Pattern: "N, Rue/Avenue/Boulevard XYZ  Quartier L-XXXX"
        var addrMatch = bodyText.match(/(\\d+[\\s,]+[\\w\\s''.éèêàùçîô-]+L-\\d{4})/i);
        if (addrMatch) {
            details.address = addrMatch[1].trim().replace(/\\s{2,}/g, ' ');
        }
        // Also try the .contact or .information section
        if (!details.address) {
            var contactSection = document.querySelector('.contact, .information');
            if (contactSection) {
                var ct = contactSection.innerText;
                var m = ct.match(/(\\d+[\\s,]+[\\w\\s''.éèêàùçîô-]+L-\\d{4})/i);
                if (m) details.address = m[1].trim().replace(/\\s{2,}/g, ' ');
            }
        }

        // Opening hours — table with day names
        var days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        var hourLines = [];
        document.querySelectorAll('table tr, .information div, .information p').forEach(el => {
            var t = el.textContent.trim();
            if (days.some(d => t.startsWith(d))) {
                hourLines.push(t.replace(/\\s+/g, ' '));
            }
        });
        // Also check for compact format "Mardi - Samedi 09:00 - 19:00"
        if (hourLines.length === 0) {
            var hoursMatch = bodyText.match(/((?:Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)[\\s\\S]{0,300}?(?:\\d{2}:\\d{2}|Fermé))/);
            if (hoursMatch) {
                hourLines = hoursMatch[0].split('\\n').map(l => l.trim()).filter(l => l);
            }
        }
        details.hours = hourLines.join(' | ');

        // Services — .item elements (not .category) contain service name + price
        // Structure: .item > div > p.text-standard.word-break (name) + price in €
        var seen = new Set();
        document.querySelectorAll('.item:not(.category)').forEach(el => {
            var nameEl = el.querySelector('p.text-standard, p.word-break');
            var name = nameEl ? nameEl.textContent.trim() : '';
            // Extract price: look for "N €" pattern
            var euroMatch = el.textContent.match(/((?:À partir de\\s+)?\\d+(?:[.,]\\d+)?\\s*€)/);
            var price = euroMatch ? euroMatch[1] : '';
            if (name && !seen.has(name) && name !== 'Sélectionner' && name !== 'Afficher plus') {
                seen.add(name);
                details.services.push({name: name, price: price});
            }
        });

        // Staff — profile photos with alt text, or staff section names
        document.querySelectorAll('.profile-photo img, [class*="staff"] img, [class*="team"] img').forEach(img => {
            var alt = (img.getAttribute('alt') || '').trim();
            if (alt && alt.length > 1 && alt.length < 50 && !/salonkee/i.test(alt)) {
                details.staff.push(alt);
            }
        });

        // Description — expandable text or description section
        var descEl = document.querySelector('.expandable-text, .description, [class*="about"]');
        if (descEl) details.description = descEl.textContent.trim().substring(0, 500);

        return details;
    }""")


# ---------------------------------------------------------------------------
# Main scraping logic
# ---------------------------------------------------------------------------

def load_existing():
    """Load existing raw-salons.json if present."""
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH) as f:
            return json.load(f)
    return []


def save_salons(salons):
    """Save salons to raw-salons.json."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(salons, f, ensure_ascii=False, indent=2)
    print(f"\n[OK] {len(salons)} salons sauvegardés dans {OUTPUT_PATH}")


def scrape_search(page, category, city):
    """Scrape one category/city search page."""
    url = f"{BASE_URL}/search/{category}/{city}"
    print(f"\n--- {category} / {city} ---")
    print(f"    {url}")

    page.goto(url, wait_until="domcontentloaded")
    wait_for_content(page)

    # Scroll to load all results
    total = scroll_to_load_all(page)
    print(f"    {total} liens salon détectés après scroll")

    results = extract_search_results(page)
    print(f"    {len(results)} salons extraits")

    # Tag each result with search context
    for r in results:
        r["search_category"] = category
        r["search_city"] = city
        r["source_url"] = f"{BASE_URL}/salon/{r['slug']}"
        r["scraped_at"] = datetime.now().isoformat()

    return results


def scrape_details(page, salon):
    """Visit a salon's detail page and enrich data."""
    url = salon.get("source_url") or f"{BASE_URL}/salon/{salon['slug']}"
    page.goto(url, wait_until="domcontentloaded")
    wait_for_content(page, timeout=8000)

    details = extract_salon_details(page)

    # Merge details into salon (don't overwrite existing non-empty fields)
    if details.get("name") and not salon.get("name"):
        salon["name"] = details["name"]
    if details.get("phone"):
        salon["phone"] = details["phone"]
    if details.get("address") and (not salon.get("address") or len(details["address"]) > len(salon.get("address", ""))):
        salon["address"] = details["address"]
    if details.get("staff"):
        salon["staff_names"] = details["staff"]
    if details.get("services"):
        salon["services"] = [s["name"] for s in details["services"]]
        salon["services_detail"] = details["services"]
    if details.get("hours"):
        salon["hours"] = details["hours"]
    if details.get("description"):
        salon["description"] = details["description"]

    salon["details_scraped"] = True
    return salon


def deduplicate(salons):
    """Deduplicate salons by slug."""
    seen = {}
    for s in salons:
        slug = s.get("slug", "")
        if slug not in seen:
            seen[slug] = s
        else:
            # Merge: keep the version with more data
            existing = seen[slug]
            for k, v in s.items():
                if v and not existing.get(k):
                    existing[k] = v
    result = list(seen.values())
    print(f"[OK] {len(salons)} → {len(result)} après déduplication")
    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Salonkee.lu Scraper — Prospection Caroline Finance")
    parser.add_argument("--category", "-c", help="Catégorie unique (ex: hairdressers)")
    parser.add_argument("--city", help="Ville unique (ex: luxembourg)")
    parser.add_argument("--all", action="store_true", help="Scraper toutes les combinaisons")
    parser.add_argument("--debug", "-d", action="store_true", help="Dump DOM structure et quitter")
    parser.add_argument("--details-only", action="store_true", help="Enrichir les salons existants avec les pages détail")
    parser.add_argument("--no-details", action="store_true", help="Ne pas visiter les pages détail individuelles")
    parser.add_argument("--headless", action="store_true", default=True, help="Mode headless (défaut)")
    parser.add_argument("--no-headless", action="store_true", help="Ouvrir le navigateur visible")
    parser.add_argument("--limit", type=int, help="Limiter le nombre de salons à enrichir en détail")
    args = parser.parse_args()

    headless = not args.no_headless

    # Determine category/city combos to scrape
    if args.all:
        combos = [(cat, city) for cat in CONFIG["categories"] for city in CONFIG["cities"]]
    elif args.category and args.city:
        combos = [(args.category, args.city)]
    elif args.category:
        combos = [(args.category, city) for city in CONFIG["cities"]]
    elif args.city:
        combos = [(cat, args.city) for cat in CONFIG["categories"]]
    elif not args.debug and not args.details_only:
        print("[ERREUR] Spécifie --category/--city, --all, --debug, ou --details-only")
        return 1

    pw = sync_playwright().start()
    ctx = None
    try:
        ctx, page = launch_browser(pw, headless=headless)

        # --- Debug mode ---
        if args.debug:
            url = f"{BASE_URL}/search/hairdressers/luxembourg"
            print(f"[DEBUG] Navigation vers {url}")
            page.goto(url, wait_until="domcontentloaded")
            wait_for_content(page)
            scroll_to_load_all(page, max_scrolls=3)

            info = dump_page_structure(page)
            print("\n=== PAGE STRUCTURE (recherche) ===")
            print(json.dumps(info, indent=2, ensure_ascii=False)[:8000])

            # Also debug a salon detail page
            if info.get("salonLinks"):
                first_href = info["salonLinks"][0]["href"]
                detail_url = first_href if first_href.startswith("http") else f"{BASE_URL}{first_href}"
                print(f"\n[DEBUG] Navigation vers détail : {detail_url}")
                page.goto(detail_url, wait_until="domcontentloaded")
                wait_for_content(page)
                detail_info = dump_page_structure(page)
                print("\n=== PAGE STRUCTURE (détail salon) ===")
                print(json.dumps(detail_info, indent=2, ensure_ascii=False)[:8000])
            print("\n=== FIN DEBUG ===")
            return 0

        # --- Details-only mode ---
        if args.details_only:
            salons = load_existing()
            if not salons:
                print("[ERREUR] Aucun salon dans raw-salons.json. Lance d'abord un scrape.")
                return 1
            to_enrich = [s for s in salons if not s.get("details_scraped")]
            if args.limit:
                to_enrich = to_enrich[:args.limit]
            print(f"[INFO] {len(to_enrich)} salons à enrichir sur {len(salons)} total")

            for i, salon in enumerate(to_enrich):
                print(f"  [{i+1}/{len(to_enrich)}] {salon.get('name', salon.get('slug', '?'))}")
                try:
                    scrape_details(page, salon)
                except Exception as e:
                    print(f"    [WARN] Erreur détail : {e}")
                time.sleep(DELAYS["between_salons"])

                # Save progress incrementally
                if (i + 1) % 10 == 0:
                    save_salons(salons)

            save_salons(salons)
            return 0

        # --- Normal scrape mode ---
        all_salons = load_existing()
        existing_slugs = {s.get("slug") for s in all_salons}

        for i, (cat, city) in enumerate(combos):
            try:
                results = scrape_search(page, cat, city)
                new_count = 0
                for r in results:
                    if r.get("slug") not in existing_slugs:
                        all_salons.append(r)
                        existing_slugs.add(r.get("slug"))
                        new_count += 1
                print(f"    {new_count} nouveaux salons ajoutés")
            except Exception as e:
                print(f"    [ERREUR] {e}")

            time.sleep(DELAYS["between_searches"])

            # Save progress every 5 combos
            if (i + 1) % 5 == 0:
                save_salons(all_salons)

        all_salons = deduplicate(all_salons)

        # Fetch details for new salons (unless --no-details)
        if not args.no_details:
            to_detail = [s for s in all_salons if not s.get("details_scraped")]
            if args.limit:
                to_detail = to_detail[:args.limit]
            if to_detail:
                print(f"\n--- Récupération des détails pour {len(to_detail)} salons ---")
                for i, salon in enumerate(to_detail):
                    print(f"  [{i+1}/{len(to_detail)}] {salon.get('name', salon.get('slug', '?'))}")
                    try:
                        scrape_details(page, salon)
                    except Exception as e:
                        print(f"    [WARN] Erreur détail : {e}")
                    time.sleep(DELAYS["between_salons"])

                    if (i + 1) % 10 == 0:
                        save_salons(all_salons)

        save_salons(all_salons)

        # Summary
        with_phone = sum(1 for s in all_salons if s.get("phone"))
        with_staff = sum(1 for s in all_salons if s.get("staff_names"))
        print(f"\n=== RÉSUMÉ ===")
        print(f"Total salons : {len(all_salons)}")
        print(f"Avec téléphone : {with_phone}")
        print(f"Avec staff : {with_staff}")
        return 0

    except KeyboardInterrupt:
        print("\n[INTERROMPU]")
        return 1
    except Exception as e:
        print(f"\n[ERREUR] {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    finally:
        if ctx:
            ctx.close()
        pw.stop()


if __name__ == "__main__":
    sys.exit(main())
