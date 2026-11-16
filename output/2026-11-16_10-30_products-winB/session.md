# Session — Nike for Algeria (window B)

- Site: nike.com (single host, no other domains touched)
- Browser window: `playwright_b` (crawler-window-b)
- Start: 2026-11-16 ~13:59 local (page timestamps in UTC 13:00–13:03)
- Task: determine whether Nike sells products online for Algeria; if an Algerian online shop exists, crawl all categories, first 3 pages each, fields name / product_url / price (numeric + currency) / image_url / category / page.
- Fields requested: name, product_url, price (numeric + currency), image_url, category, page

## Outcome (short)

**No Nike online store exists for Algeria.** Nike's own country/region selector (86 destination links) lists only
Egypt, Morocco (EN/FR) and South Africa for Africa, and Saudi Arabia, UAE, Qatar, Kuwait for the Middle East.
`nike.com/dz/` returns Nike's "Page not found". Nike's help centre states it does not ship internationally.
Nike's Algeria retail directory lists only **partnered physical stores** in Algiers (no online shop).

Because no Algerian online catalogue exists, **no products were collected**, and per instructions no other
country's store was crawled as if it were Algerian.

## Pages visited (in order)

| # | URL | Result |
|---|-----|--------|
| 1 | https://www.nike.com/ | Home page loaded; "Select your Location" modal open |
| 2 | https://www.nike.com/dz/ | HTTP 500 shell + "We can't find the page you are looking for." (Nike 404 page) |
| 3 | https://www.nike.com/dz/en/ | Same "Page not found" |
| 4 | https://www.nike.com/help | Help hub; Shipping & Delivery section found |
| 5 | https://www.nike.com/help/a/shipping-delivery-info-all | List of shipping articles ("Can I ship my order internationally?") |
| 6 | https://www.nike.com/help/a/international-shipping | "We currently offer shipping only within the US… We do not offer international shipping" |
| 7 | https://www.nike.com/retail/directory/algeria/algiers/ | Only partnered physical stores (Bab Ezzouar Mall, Garden City Mall, …) |
| 8 | https://www.nike.com/ | Re-checked location modal via evaluate (86 links, 0 matches for "Algeria") |
| 9 | https://www.nike.com/dz/ | Re-checked 404 + screenshot for evidence |

## Attempts and results (persistence log)

1. **Country/region selector on nike.com (primary method).**
   - Attempt 1: `browser_find` for `/country|region|.../` → found dialog "Select your Location" with sections Africa, Americas, Asia Pacific, Europe, Middle East.
   - Attempt 2: snapshot of `e16` (Africa list) → only 4 entries: Egypt (EN), Morocco (EN), Maroc (FR), South Africa (EN). No Algeria.
   - Attempt 3: full snapshot of dialog body (`e9`) → complete list of all regions; Algeria absent everywhere.
   - Attempt 4 (after navigating back to nike.com): `browser_evaluate` reading `[role=dialog].innerText` → `hasAlgeria:false`, 86 country links, Africa section = Egypt / Morocco / Maroc / South Africa.
   - Result: **no Algerian destination**. Screenshot: `evidence_country_selector.png`.

2. **Direct DZ storefront URLs.**
   - `https://www.nike.com/dz/` → "Page not found. Nike.com" (status 500 from Nike's error shell, page text "We can't find the page you are looking for.").
   - `https://www.nike.com/dz/en/` → same 404 page.
   - Result: no DZ storefront.

3. **Nike Help — international shipping.**
   - From `/help` clicked "View all" (Shipping & Delivery) → click timed out ("element is outside of the viewport"), so the same visible link URL `/help/a/shipping-delivery-info-all` was opened directly.
   - That page's "Can I ship my order internationally?" → `/help/a/international-shipping`.
   - Text: "We currently offer shipping only within the US and to APO/FPO addresses. We do not offer international shipping, but if you live outside of the US, you can shop Nike in number of countries or regions globally."
   - Result: Nike does not ship from another country's store to Algeria.

4. **Nike retail directory for Algeria (cross-check of the known finding).**
   - `https://www.nike.com/retail/directory/algeria/algiers/` → breadcrumb Store Directory › Algeria › Algiers, heading "Find a Nike Store", store cards: "Nike Store Bab Ezzouar Mall (Partnered)", "Nike Store Garden City Mall (Partnered)", … with street addresses in Algiers.
   - Result: physical/partnered retail only, no "Shop" / e-commerce links, no prices.

## Blockers / skipped

- No CAPTCHA, login wall, 403 or 429 encountered. The `/dz/` 500 status is Nike's own 404 shell, not a rate-limit error; nothing was hammered.
- No product pages existed to skip: no Algerian e-commerce catalogue was reachable.
- Explicitly **not** done: crawling `nike.com/eg`, `nike.com/ma`, `nike.com/za`, `nike.ae`, etc. Their products are not Algerian and would misrepresent the data.

## Files written

- `session.md` (this file)
- `experience.md`
- `instructions.md`
- `nike_products.json` — empty product list with an explicit status block
- `evidence_country_selector.png` — location modal showing Africa = Egypt / Morocco / Maroc / South Africa
- `evidence_dz_notfound.png` — nike.com/dz "Page not found"
