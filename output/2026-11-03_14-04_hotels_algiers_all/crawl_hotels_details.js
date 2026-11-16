// Playwright batch script: collect details for all hotels in Algiers from Google Maps
// Run: NODE_PATH=<temp node_modules> node crawl_hotels_details.js
const { chromium } = require('playwright');
const fs = require('fs');

const INPUT = './hotels_list.json';
const OUTPUT = './hotels_details.json';

function norm(s){ return (s||'').toLowerCase().replace(/\s+/g,' ').trim(); }

async function extract(page) {
  await page.waitForTimeout(4000 + Math.random()*2000);
  const data = await page.evaluate(() => {
    const root = document.querySelector('main') || document.body;
    const mainText = root.innerText || '';
    const name = (document.querySelector('h1') || {}).textContent ? document.querySelector('h1').textContent.trim() : null;
    let rating = null, reviews = null;
    const m = mainText.match(/(\d[,.]\d)\s*\n?\s*\((\d+)\)/);
    if (m) { rating = m[1].replace(',', '.'); reviews = m[2]; }
    const hc = mainText.match(/H.t.l\s*(\d+)\s*.toiles/i);
    const hotelClass = hc ? ('Hôtel ' + hc[1] + ' étoiles') : null;
    const stars = hc ? parseInt(hc[1]) : null;
    const addrBtn = document.querySelector('button[aria-label^="Adresse:"]');
    const address = addrBtn ? addrBtn.textContent.trim().replace(/^[\s\uE000-\uF8FF]+/, '').trim() : null;
    const webLink = document.querySelector('a[aria-label^="Site Web:"]');
    const website = webLink ? webLink.href : null;
    const phoneBtn = document.querySelector('button[aria-label^="Numéro de téléphone:"]');
    const phone = phoneBtn ? phoneBtn.textContent.trim().replace(/^[\s\uE000-\uF8FF]+/, '').trim() : null;
    const telLink = document.querySelector('a[href^="tel:"]');
    const phoneTel = telLink ? telLink.getAttribute('href') : null;
    const photoImg = document.querySelector('button[aria-label^="Photo de"] img');
    const picture = photoImg ? photoImg.src : null;
    return { name, rating, reviews_count: reviews, hotel_class: hotelClass, stars, address, website, phone, phone_tel: phoneTel, picture, url: location.href };
  });
  return data;
}

async function main() {
  const list = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const raw = list.hotels || [];
  // dedupe by normalized name
  const seen = new Set();
  const hotels = [];
  for (const h of raw) {
    const k = norm(h.name);
    if (seen.has(k)) continue;
    seen.add(k);
    hotels.push(h);
  }
  console.log('Hotels to process:', hotels.length);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  // resume support: load existing
  if (fs.existsSync(OUTPUT)) {
    try { results.push(...JSON.parse(fs.readFileSync(OUTPUT,'utf8')).hotels); } catch(e){}
  }
  const doneNames = new Set(results.map(r=>norm(r.name)));

  for (let i=0;i<hotels.length;i++) {
    const h = hotels[i];
    if (doneNames.has(norm(h.name))) { console.log('skip already done:', h.name); continue; }
    console.log(`[${i+1}/${hotels.length}] ${h.name}`);
    try {
      await page.goto(h.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const d = await extract(page);
      if (!d.name) d.name = h.name;
      d.source_link = h.url;
      results.push(d);
      doneNames.add(norm(d.name));
      fs.writeFileSync(OUTPUT, JSON.stringify({ collected_at: new Date().toISOString(), count: results.length, hotels: results }, null, 2));
      console.log('   ok:', d.rating, d.stars, d.phone);
    } catch (err) {
      console.log('   ERROR:', err.message);
      results.push({ name: h.name, error: err.message, source_link: h.url });
      fs.writeFileSync(OUTPUT, JSON.stringify({ collected_at: new Date().toISOString(), count: results.length, hotels: results }, null, 2));
    }
    await page.waitForTimeout(2000 + Math.random()*3000);
  }

  await browser.close();
  console.log('Done. Total:', results.length);
}

main().catch(err => { console.error(err); process.exit(1); });
