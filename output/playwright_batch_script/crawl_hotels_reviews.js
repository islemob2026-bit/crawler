// Playwright batch script for checking hotel reviews on Google Maps
// Usage: node crawl_hotels_reviews.js "Algiers" "famille,enfant,bébé,pas pour"
// Requires: npm install playwright
// Run with: node crawl_hotels_reviews.js

const { chromium } = require('playwright');
const fs = require('fs');

// Configuration
const CITY = process.argv[2] || 'Algiers';
const KEYWORDS = (process.argv[3] || 'famille,enfant,bébé,pas pour').split(',');
const MAX_HOTELS = parseInt(process.argv[4]) || 10;
const OUTPUT_FILE = `hotel_reviews_${CITY.toLowerCase().replace(/\s+/g, '_')}.json`;
const CONCURRENCY = 3; // number of parallel browser contexts

async function searchHotels(page, city) {
  await page.goto(`https://www.google.com/maps/search/hotels+in+${encodeURIComponent(city)}/`);
  await page.waitForTimeout(5000);

  // Scroll to load more results
  const feed = page.locator('div[role="feed"]');
  for (let i = 0; i < 5; i++) {
    await feed.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(2000);
  }

  // Extract hotel links
  const links = await page.locator('a[href*="/maps/place/"]').evaluateAll(els =>
    els.map(el => ({
      name: el.getAttribute('aria-label') || el.textContent.trim(),
      url: el.href
    })).filter(h => h.name && h.url)
  );

  // Deduplicate
  const seen = new Set();
  return links.filter(h => {
    if (seen.has(h.url)) return false;
    seen.add(h.url);
    return true;
  }).slice(0, MAX_HOTELS);
}

async function checkHotelReviews(browser, hotel) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = { hotel: hotel.name, url: hotel.url, reviews: [] };

  try {
    await page.goto(hotel.url);
    await page.waitForTimeout(4000);

    // Click Avis tab
    const avisTab = page.locator('button, tab').filter({ hasText: /Avis/i }).first();
    if (await avisTab.isVisible()) {
      await avisTab.click();
      await page.waitForTimeout(3000);
    }

    // Search for each keyword
    const searchBox = page.locator('input[aria-label*="Rechercher dans les avis"], input[placeholder*="avis"]').first();
    for (const keyword of KEYWORDS) {
      if (await searchBox.isVisible()) {
        await searchBox.fill('');
        await searchBox.fill(keyword);
        await searchBox.press('Enter');
        await page.waitForTimeout(3000);

        // Extract review snippets
        const snippets = await page.locator('div').filter({ hasText: /il y a|mois|an\b/ }).evaluateAll(els =>
          els.map(el => {
            const text = el.textContent.trim();
            const ratingMatch = text.match(/(\d)\/5/);
            return {
              rating: ratingMatch ? ratingMatch[1] + '/5' : '?',
              snippet: text.substring(0, 500)
            };
          }).filter(r => r.snippet.length > 50)
        );

        for (const s of snippets) {
          results.reviews.push({ keyword, ...s });
        }
      }
    }
  } catch (err) {
    results.error = err.message;
  } finally {
    await context.close();
  }

  return results;
}

async function main() {
  console.log(`Searching hotels in ${CITY}...`);
  console.log(`Keywords: ${KEYWORDS.join(', ')}`);
  console.log(`Max hotels: ${MAX_HOTELS}`);
  console.log(`Concurrency: ${CONCURRENCY}`);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const hotels = await searchHotels(page, CITY);
  console.log(`Found ${hotels.length} hotels`);

  await page.close();

  // Process hotels with concurrency limit
  const allResults = [];
  for (let i = 0; i < hotels.length; i += CONCURRENCY) {
    const batch = hotels.slice(i, i + CONCURRENCY);
    console.log(`Processing batch ${Math.floor(i / CONCURRENCY) + 1}: ${batch.map(h => h.name).join(', ')}`);
    const batchResults = await Promise.all(batch.map(h => checkHotelReviews(browser, h)));
    allResults.push(...batchResults);
  }

  await browser.close();

  // Save results
  const output = {
    city: CITY,
    keywords: KEYWORDS,
    collected_at: new Date().toISOString(),
    hotels_checked: allResults.length,
    results: allResults
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Results saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
