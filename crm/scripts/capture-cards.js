#!/usr/bin/env node
/**
 * Capture les 20 cartes de visite (recto) en PNG 425×275 px
 * Output : public/cards/v1.png … v20.png
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const HTML_FILE = path.resolve(__dirname, "../public/cartes-de-visite.html");
const OUTPUT_DIR = path.resolve(__dirname, "../public/cards");

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const fileUrl = `file://${HTML_FILE}`;
  await page.goto(fileUrl, { waitUntil: "networkidle" });

  // Each version has a .card-pair div; we capture the first .card (recto) of each pair
  const cardPairs = await page.locator(".card-pair").all();
  console.log(`Found ${cardPairs.length} card pairs`);

  for (let i = 0; i < cardPairs.length; i++) {
    const version = i + 1;
    // First .card in the pair = recto
    const card = cardPairs[i].locator(".card").first();
    const outPath = path.join(OUTPUT_DIR, `v${version}.png`);

    await card.screenshot({ path: outPath });
    console.log(`✓ v${version}.png`);
  }

  await browser.close();
  console.log(`\n✅ ${cardPairs.length} cards captured → ${OUTPUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
