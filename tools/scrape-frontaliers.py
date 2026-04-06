#!/usr/bin/env python3
"""
lesfrontaliers.lu Scraper — Extract forum topics and classifieds for Caroline Finance.

Scrapes the forum (especially Fiscalité) and petites annonces from lesfrontaliers.lu.
Forum topics from people asking tax questions = potential leads for a Luxembourg tax consultant.

Usage:
  python3 tools/scrape-frontaliers.py --forum --category fiscalite --max-pages 10
  python3 tools/scrape-frontaliers.py --forum --category fiscalite --with-content --max-pages 5
  python3 tools/scrape-frontaliers.py --annonces
  python3 tools/scrape-frontaliers.py --push           # Push results to CRM API
  python3 tools/scrape-frontaliers.py --job-id XXXXX   # Called by CRM scrape system
"""

import argparse
import json
import os
import re
import sys
import time
import requests
from datetime import datetime, timedelta
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "frontaliers-config.json"
OUTPUT_DIR = SCRIPT_DIR.parent / ".tmp" / "frontaliers"
PROFILE_DIR = os.path.expanduser("~/.playwright-frontaliers-profile")

with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

BASE_URL = CONFIG["base_url"]
DELAYS = CONFIG["delays"]
SELECTORS = CONFIG["selectors"]

CRM_URL = os.environ.get("CRM_URL", "http://localhost:3001")
CRM_TOKEN = os.environ.get("CRM_TOKEN", os.environ.get("LEADS_IMPORT_TOKEN", ""))
JOB_ID = os.environ.get("JOB_ID", "")


# ---------------------------------------------------------------------------
# Browser
# ---------------------------------------------------------------------------

def launch_browser(pw, headless=True, use_chrome=False, cdp_url=None):
    """Launch browser or connect to existing Chrome via CDP.

    cdp_url: connect to a running Chrome (e.g. http://localhost:9222).
             Requires Chrome launched with: --remote-debugging-port=9222
             This is the best way to bypass Cloudflare — you solve the
             captcha once in your real Chrome, then the scraper reuses
             that session.

    use_chrome: use system Chrome with persistent profile.
    """
    print("Lancement du navigateur...")

    if cdp_url:
        # Connect to existing Chrome session — bypasses Cloudflare
        print(f"  Connexion au Chrome existant via CDP: {cdp_url}")
        browser = pw.chromium.connect_over_cdp(cdp_url)
        ctx = browser.contexts[0] if browser.contexts else browser.new_context()
        # Try to find a tab already on lesfrontaliers.lu
        page = None
        for p in ctx.pages:
            if "lesfrontaliers.lu" in p.url:
                page = p
                print(f"  Onglet trouvé: {p.url[:60]}")
                break
        if not page:
            page = ctx.new_page()
        return ctx, page

    kwargs = dict(
        user_data_dir=PROFILE_DIR,
        headless=headless,
        viewport={"width": 1400, "height": 900},
        args=["--disable-blink-features=AutomationControlled"],
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        ),
    )
    if use_chrome:
        ctx = pw.chromium.launch_persistent_context(
            channel="chrome",
            **kwargs,
        )
    else:
        ctx = pw.chromium.launch_persistent_context(
            **kwargs,
        )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    return ctx, page


# ---------------------------------------------------------------------------
# Progress reporting
# ---------------------------------------------------------------------------

def report_progress(status=None, progress=None, total=None, phase=None, result_count=None, error_log=None):
    """Report progress to CRM API if running as a job."""
    if not JOB_ID or not CRM_TOKEN:
        return
    data = {}
    if status: data["status"] = status
    if progress is not None: data["progress"] = progress
    if total is not None: data["total"] = total
    if phase: data["phase"] = phase
    if result_count is not None: data["resultCount"] = result_count
    if error_log: data["errorLog"] = error_log
    try:
        requests.post(
            f"{CRM_URL}/api/scrape/{JOB_ID}/progress",
            json=data,
            headers={"Authorization": f"Bearer {CRM_TOKEN}", "Content-Type": "application/json"},
            timeout=10,
        )
    except Exception as e:
        print(f"  [warn] Progress report failed: {e}")


# ---------------------------------------------------------------------------
# Date parsing
# ---------------------------------------------------------------------------

def parse_relative_date(text):
    """Parse 'Il y a X heures/jours/semaines' to ISO date string."""
    if not text:
        return None
    text = text.strip()
    now = datetime.now()
    m = re.search(r"Il y a\s+(\d+)\s+(minute|heure|jour|semaine|mois)", text, re.IGNORECASE)
    if not m:
        return now.isoformat()
    n = int(m.group(1))
    unit = m.group(2).lower()
    if unit == "minute":
        dt = now - timedelta(minutes=n)
    elif unit == "heure":
        dt = now - timedelta(hours=n)
    elif unit == "jour":
        dt = now - timedelta(days=n)
    elif unit == "semaine":
        dt = now - timedelta(weeks=n)
    elif unit == "mois":
        dt = now - timedelta(days=n * 30)
    else:
        dt = now
    return dt.isoformat()


def parse_view_count(text):
    """Parse '9.654' or '571' to int."""
    if not text:
        return None
    text = text.strip().replace(".", "").replace(" ", "")
    try:
        return int(text)
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# Forum scraper
# ---------------------------------------------------------------------------

def scrape_forum_page(page):
    """Extract topics from the current forum listing page."""
    sel = SELECTORS["forum"]
    topics = page.evaluate(f"""() => {{
        const items = document.querySelectorAll('{sel["topic_list"]}');
        return [...items].map(item => {{
            const titleEl = item.querySelector('{sel["topic_title"]}');
            const authorEl = item.querySelector('{sel["topic_author"]}');
            const statsWrappers = item.querySelectorAll('.stats-wrapper .stat-count');
            const repliesCount = statsWrappers[0]?.textContent?.trim() || null;
            const viewsCount = statsWrappers[1]?.textContent?.trim() || null;
            const categoryEl = item.querySelector('{sel["topic_category"]}');
            const postInfo = item.querySelector('{sel["topic_date"]}')?.textContent || '';
            const dateMatch = postInfo.match(/Il y a [^|&]*/);
            return {{
                title: titleEl?.textContent?.trim() || null,
                url: titleEl?.getAttribute('href') || null,
                author: authorEl?.textContent?.trim() || null,
                author_url: authorEl?.getAttribute('href') || null,
                category: categoryEl?.textContent?.trim() || null,
                replies_raw: repliesCount,
                views_raw: viewsCount,
                date_text: dateMatch ? dateMatch[0].trim() : null,
            }};
        }});
    }}""")
    return topics


def scrape_topic_content(page, url):
    """Navigate to a topic page and extract the first post content."""
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(2000)
        sel = SELECTORS["topic_page"]
        content = page.evaluate(f"""() => {{
            const post = document.querySelector('{sel["first_post"]}');
            return post ? post.textContent.trim().substring(0, 2000) : null;
        }}""")
        return content
    except Exception as e:
        print(f"  [warn] Cannot load topic: {e}")
        return None


def dismiss_overlays(page):
    """Close cookie consent, OneSignal, and other overlays that block clicks."""
    # Cookie consent (Fundingchoices / CMP)
    for sel in [
        'button.fc-cta-consent',          # "J'accepte" button
        'button[aria-label="Consent"]',
        '.fc-button.fc-cta-consent',
        '.fc-dialog .fc-cta-consent',
        'button.fc-primary-button',
    ]:
        try:
            btn = page.query_selector(sel)
            if btn and btn.is_visible():
                btn.click()
                page.wait_for_timeout(1000)
                print("  [info] Cookie consent dismissed")
                break
        except Exception:
            pass

    # OneSignal push notification popup
    for sel in [
        '#onesignal-slidedown-cancel-button',
        'button[id*="onesignal"][id*="cancel"]',
        '.onesignal-slidedown-dialog .secondary',
    ]:
        try:
            btn = page.query_selector(sel)
            if btn and btn.is_visible():
                btn.click()
                page.wait_for_timeout(500)
                print("  [info] OneSignal popup dismissed")
                break
        except Exception:
            pass

    # Generic close buttons on remaining overlays
    for sel in ['.fc-close', '[aria-label="close"]', '.popup-close']:
        try:
            btn = page.query_selector(sel)
            if btn and btn.is_visible():
                btn.click()
                page.wait_for_timeout(500)
        except Exception:
            pass


def navigate_to_page(page, base_url, page_num):
    """Navigate to forum page N.

    wpForo uses a hidden form POST with input[name='pageexeq'] to paginate.
    We submit it via JS, which is more reliable than URL params.
    """
    dismiss_overlays(page)
    try:
        # Get current first topic to detect change
        old_title = page.evaluate("""() => {
            const el = document.querySelector('.topic-listing-element a.topic-title');
            return el ? el.textContent.trim() : '';
        }""")

        # wpForo pagination: set hidden input + submit form
        submitted = page.evaluate(f"""() => {{
            const input = document.querySelector('input[name="pageexeq"]');
            const form = document.querySelector('#forum-home');
            if (input && form) {{
                input.value = '{page_num}';
                form.submit();
                return true;
            }}
            // Fallback: click the paginator link via JS
            const link = document.querySelector('.paginator-link.number[data-page="{page_num}"]');
            if (link) {{ link.click(); return true; }}
            return false;
        }}""")

        if not submitted:
            print(f"  [warn] Cannot find pagination form for page {page_num}")
            return False

        # Wait for page reload / AJAX refresh
        page.wait_for_timeout(2000)
        try:
            page.wait_for_selector(".topic-listing-element", timeout=15000)
        except Exception:
            # Context may have been destroyed by form submit — wait for new page
            page.wait_for_timeout(5000)
            try:
                page.wait_for_selector(".topic-listing-element", timeout=10000)
            except Exception:
                pass

        dismiss_overlays(page)

        # Verify content changed
        new_title = page.evaluate("""() => {
            const el = document.querySelector('.topic-listing-element a.topic-title');
            return el ? el.textContent.trim() : '';
        }""")
        if new_title != old_title:
            print(f"  ✓ Page {page_num} chargée")
        else:
            print(f"  [info] Page {page_num} — même contenu (peut-être dernière page)")

        return True
    except Exception as e:
        print(f"  [warn] Navigation page {page_num} failed: {e}")
        return False


def scrape_forum(category_slug, max_pages=10, with_content=False, headless=True, use_chrome=False, cdp_url=None):
    """Scrape forum topics for a given category."""
    url = f"{BASE_URL}/forum/?cat={category_slug}"
    print(f"\n{'='*60}")
    print(f"Forum: {category_slug} — max {max_pages} pages")
    print(f"URL: {url}")
    print(f"{'='*60}")

    all_topics = []
    report_progress(status="running", phase=f"Forum {category_slug}", total=max_pages)

    with sync_playwright() as pw:
        ctx, page = launch_browser(pw, headless=headless, use_chrome=use_chrome, cdp_url=cdp_url)

        try:
            # If already on the right page (CDP reuse), skip navigation
            current = page.url
            if url.rstrip("/") not in current:
                page.goto(url, timeout=120000)
            else:
                print(f"  Déjà sur la bonne page, pas de rechargement")

            # Wait for forum content or Cloudflare challenge
            for attempt in range(3):
                try:
                    page.wait_for_selector(".topic-listing-element", timeout=15000)
                    break
                except PWTimeout:
                    cf = page.query_selector("#challenge-running, #cf-challenge-running, .cf-browser-verification, iframe[src*='challenge']")
                    if cf or attempt == 0:
                        print("\n  ⏳ Cloudflare détecté — résous le captcha dans la fenêtre Chrome.")
                        print("     Le script attend que les topics apparaissent...")
                        page.wait_for_timeout(30000)
                    else:
                        print("  [warn] Topics non chargés, on continue...")
                        break
            dismiss_overlays(page)
            page.wait_for_timeout(1000)

            for page_num in range(1, max_pages + 1):
                print(f"\n--- Page {page_num}/{max_pages} ---")
                report_progress(progress=page_num, phase=f"Forum {category_slug} — page {page_num}/{max_pages}")

                topics = scrape_forum_page(page)
                print(f"  Trouvé {len(topics)} topics")

                if not topics:
                    print("  Aucun topic, arrêt.")
                    break

                for t in topics:
                    t["topic_date"] = parse_relative_date(t.pop("date_text", None))
                    t["reply_count"] = parse_view_count(t.pop("replies_raw", None))
                    t["view_count"] = parse_view_count(t.pop("views_raw", None))
                    t["lead_type"] = "forum"
                    t["source"] = "frontaliers-forum"

                all_topics.extend(topics)

                # Optionally fetch content of each topic
                if with_content:
                    for i, t in enumerate(topics):
                        if t.get("url"):
                            print(f"  Contenu topic {i+1}/{len(topics)}: {t['title'][:50]}...")
                            content = scrape_topic_content(page, t["url"])
                            t["summary"] = content
                            time.sleep(DELAYS["between_topics"])
                    # Navigate back to the correct page after fetching content
                    navigate_to_page(page, url, page_num)

                # Navigate to next page
                if page_num < max_pages:
                    if not navigate_to_page(page, url, page_num + 1):
                        print("  Pas de page suivante, arrêt.")
                        break
                    time.sleep(DELAYS["between_pages"])

        except Exception as e:
            print(f"ERREUR: {e}")
            report_progress(status="failed", error_log=str(e))
            raise
        finally:
            ctx.close()

    # Convert to CRM format
    leads = []
    for t in all_topics:
        leads.append({
            "name": t.get("title"),
            "display_name": t.get("title"),
            "lead_type": "forum",
            "source": "frontaliers-forum",
            "username": t.get("author"),
            "topic_title": t.get("title"),
            "topic_url": t.get("url"),
            "topic_category": t.get("category") or category_slug,
            "topic_date": t.get("topic_date"),
            "reply_count": t.get("reply_count"),
            "view_count": t.get("view_count"),
            "summary": t.get("summary"),
            "source_url": t.get("url"),
        })

    print(f"\n✓ Total: {len(leads)} topics extraits")
    report_progress(status="done", result_count=len(leads))
    return leads


# ---------------------------------------------------------------------------
# Annonces scraper
# ---------------------------------------------------------------------------

def scrape_annonces(max_pages=8, headless=True, use_chrome=False, cdp_url=None):
    """Scrape petites annonces."""
    url = f"{BASE_URL}{CONFIG['annonces_url']}"
    print(f"\n{'='*60}")
    print(f"Petites annonces — max {max_pages} pages")
    print(f"URL: {url}")
    print(f"{'='*60}")

    all_annonces = []
    report_progress(status="running", phase="Petites annonces", total=max_pages)

    with sync_playwright() as pw:
        ctx, page = launch_browser(pw, headless=headless, use_chrome=use_chrome, cdp_url=cdp_url)
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(3000)
            dismiss_overlays(page)

            for page_num in range(1, max_pages + 1):
                print(f"\n--- Page {page_num}/{max_pages} ---")
                report_progress(progress=page_num, phase=f"Annonces — page {page_num}/{max_pages}")

                # Extract annonces from the current page
                annonces = page.evaluate("""() => {
                    const items = document.querySelectorAll('.classifieds-item, .annonce-item, article.classified, .card-classified');
                    if (items.length === 0) {
                        // Fallback: try generic listing
                        const cards = document.querySelectorAll('.listing-item, .post-card, article');
                        return [...cards].slice(0, 30).map(el => ({
                            title: el.querySelector('h3 a, h2 a, .title a')?.textContent?.trim(),
                            url: el.querySelector('h3 a, h2 a, .title a')?.getAttribute('href'),
                            category: el.querySelector('.category, .badge')?.textContent?.trim(),
                            price: el.querySelector('.price, [class*="price"]')?.textContent?.trim(),
                            date: el.querySelector('time, .date, [class*="date"]')?.textContent?.trim(),
                            location: el.querySelector('.location, [class*="location"]')?.textContent?.trim(),
                            author: el.querySelector('.author, [class*="author"]')?.textContent?.trim(),
                        }));
                    }
                    return [...items].map(el => ({
                        title: el.querySelector('.title, h3, h2')?.textContent?.trim(),
                        url: el.querySelector('a')?.getAttribute('href'),
                        category: el.querySelector('.category')?.textContent?.trim(),
                        price: el.querySelector('.price')?.textContent?.trim(),
                        date: el.querySelector('.date, time')?.textContent?.trim(),
                        location: el.querySelector('.location')?.textContent?.trim(),
                        author: el.querySelector('.author')?.textContent?.trim(),
                    }));
                }""")

                print(f"  Trouvé {len(annonces)} annonces")
                if not annonces:
                    break

                for a in annonces:
                    a["lead_type"] = "annonce"
                    a["source"] = "frontaliers-annonces"
                all_annonces.extend(annonces)

                # Pagination
                if page_num < max_pages:
                    next_link = page.query_selector(f'a[href*="page/{page_num + 1}"], .pagination a:has-text("{page_num + 1}")')
                    if next_link:
                        next_link.click()
                        page.wait_for_timeout(DELAYS["between_pages"] * 1000)
                    else:
                        print("  Pas de page suivante, arrêt.")
                        break
        except Exception as e:
            print(f"ERREUR: {e}")
            report_progress(status="failed", error_log=str(e))
            raise
        finally:
            ctx.close()

    leads = []
    for a in all_annonces:
        if not a.get("title"):
            continue
        leads.append({
            "name": a.get("title"),
            "display_name": a.get("title"),
            "lead_type": "annonce",
            "source": "frontaliers-annonces",
            "topic_title": a.get("title"),
            "topic_url": a.get("url"),
            "topic_category": a.get("category"),
            "source_url": a.get("url"),
            "username": a.get("author"),
            "address": a.get("location"),
        })

    print(f"\n✓ Total: {len(leads)} annonces extraites")
    report_progress(status="done", result_count=len(leads))
    return leads


# ---------------------------------------------------------------------------
# Push to CRM
# ---------------------------------------------------------------------------

def push_to_crm(leads):
    """Send leads to CRM API."""
    if not CRM_TOKEN:
        print("⚠ CRM_TOKEN non défini, export JSON uniquement.")
        return False
    endpoint = f"{CRM_URL}/api/leads/import"
    print(f"\nPush vers CRM: {endpoint}")
    print(f"  {len(leads)} leads à envoyer...")
    try:
        resp = requests.post(
            endpoint,
            json=leads,
            headers={
                "Authorization": f"Bearer {CRM_TOKEN}",
                "Content-Type": "application/json",
            },
            timeout=60,
        )
        result = resp.json()
        print(f"  ✓ Créés: {result.get('created', 0)}, Mis à jour: {result.get('updated', 0)}, Ignorés: {result.get('skipped', 0)}")
        return True
    except Exception as e:
        print(f"  ✗ Erreur push CRM: {e}")
        return False


# ---------------------------------------------------------------------------
# Save JSON
# ---------------------------------------------------------------------------

def save_json(leads, suffix=""):
    """Save leads to JSON file."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    date = datetime.now().strftime("%Y-%m-%d")
    filename = f"frontaliers-{suffix}-{date}.json" if suffix else f"frontaliers-{date}.json"
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Sauvegardé: {path} ({len(leads)} leads)")
    return path


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="lesfrontaliers.lu scraper")
    parser.add_argument("--forum", action="store_true", help="Scrape forum topics")
    parser.add_argument("--annonces", action="store_true", help="Scrape petites annonces")
    parser.add_argument("--category", default="fiscalite", help="Forum category slug")
    parser.add_argument("--max-pages", type=int, default=10, help="Max pages to scrape")
    parser.add_argument("--with-content", action="store_true", help="Also fetch full topic content")
    parser.add_argument("--push", action="store_true", help="Push results to CRM API")
    parser.add_argument("--no-headless", action="store_true", help="Show browser window")
    parser.add_argument("--chrome", action="store_true", help="Use system Chrome (better for Cloudflare)")
    parser.add_argument("--cdp", default=None, help="Connect to running Chrome via CDP (e.g. http://localhost:9222)")
    parser.add_argument("--job-id", help="CRM ScrapeJob ID (for progress reporting)")
    parser.add_argument("--config", help="JSON config string from CRM")
    args = parser.parse_args()

    global JOB_ID
    if args.job_id:
        JOB_ID = args.job_id

    # Parse config from CRM job
    if args.config:
        try:
            job_config = json.loads(args.config)
            args.category = job_config.get("category", args.category)
            args.max_pages = job_config.get("maxPages", args.max_pages)
            if job_config.get("source", "").startswith("frontaliers-forum"):
                args.forum = True
            elif job_config.get("source", "").startswith("frontaliers-annonces"):
                args.annonces = True
        except json.JSONDecodeError:
            pass

    headless = not args.no_headless
    use_chrome = args.chrome
    cdp_url = args.cdp
    all_leads = []

    if args.forum:
        leads = scrape_forum(args.category, max_pages=args.max_pages, with_content=args.with_content, headless=headless, use_chrome=use_chrome, cdp_url=cdp_url)
        all_leads.extend(leads)
        save_json(leads, suffix=f"forum-{args.category}")

    if args.annonces:
        leads = scrape_annonces(max_pages=args.max_pages, headless=headless, use_chrome=use_chrome, cdp_url=cdp_url)
        all_leads.extend(leads)
        save_json(leads, suffix="annonces")

    if not args.forum and not args.annonces:
        print("Spécifiez --forum et/ou --annonces")
        parser.print_help()
        sys.exit(1)

    if args.push and all_leads:
        push_to_crm(all_leads)

    print(f"\n{'='*60}")
    print(f"TERMINÉ — {len(all_leads)} leads au total")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
