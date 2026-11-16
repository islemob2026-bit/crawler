// Kiabi Algeria product crawl: first 3 pages of each main category.
// Browser-only (Playwright DOM reads). One tab, sequential, random 2-6 s pacing.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://kiabi.dz';
const OUT = path.join(__dirname, 'kiabi_products.json');
const CATEGORIES = [
  '/collections/unv1000001-femme',
  '/collections/unv1000002-homme',
  '/collections/unv1000003-fille',
  '/collections/unv1000004-garcon',
  '/collections/unv1000005-bebe',
];
const MAX_PAGES = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pause = () => sleep(2000 + Math.floor(Math.random() * 4000));
const log = (m) => console.log(`[${new Date().toISOString()}] ${m}`);

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Users\\nour-elislem_hassini\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe',
  });
  const page = await browser.newPage();
  const seen = new Set();
  const products = [];

  // robots.txt check (rendered in browser)
  await page.goto(`${BASE}/robots.txt`, { waitUntil: 'domcontentloaded' });
  const robots = await page.evaluate(() => document.body.innerText);
  log(`robots.txt length ${robots.length}; disallow lines: ${(robots.match(/Disallow:.*/g) || []).join(' | ')}`);
  await pause();

  for (const cat of CATEGORIES) {
    for (let p = 1; p <= MAX_PAGES; p++) {
      const url = `${BASE}${cat}${p > 1 ? `?page=${p}` : ''}`;
      log(`open ${url}`);
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded' });
      const status = resp ? resp.status() : 0;
      if (status === 403 || status === 429 || status >= 500) {
        log(`STOP: HTTP ${status} at ${url}`);
        await browser.close();
        process.exit(2);
      }
      await page.waitForTimeout(2000);
      for (let y = 0; y < 6; y++) {
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(600);
      }
      const items = await page.evaluate((base) => {
        const out = [];
        document.querySelectorAll('a[href*="/products/"]').forEach((a) => {
          const card = a.closest('li') || a.closest('article') || a.parentElement;
          if (!card) return;
          const text = card.innerText || '';
          const priceMatch = text.match(/([\d][\d\s.,]*)\s?DA/);
          const img = card.querySelector('img');
          out.push({
            name: a.textContent.trim(),
            url: new URL(a.getAttribute('href'), base).href,
            price_da: priceMatch ? priceMatch[1].replace(/\s/g, '') : null,
            image_url: img ? (img.currentSrc || img.src || img.getAttribute('data-src') || null) : null,
          });
        });
        return out;
      }, BASE);
      let added = 0;
      for (const it of items) {
        if (!it.name || seen.has(it.url)) continue;
        seen.add(it.url);
        products.push({ category: cat.split('/').pop(), page: p, ...it });
        added++;
      }
      log(`page ${p} of ${cat}: ${items.length} cards, ${added} new`);
      fs.writeFileSync(OUT, JSON.stringify(products, null, 2), 'utf8');
      await pause();
    }
  }
  log(`done: ${products.length} products -> ${OUT}`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
