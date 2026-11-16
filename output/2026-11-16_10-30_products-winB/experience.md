# Experience — Nike for Algeria (window B)

## What was asked
Determine whether Nike sells online for Algeria; if yes, crawl all categories × first 3 pages of products.

## What happened
Nike has **no Algerian online store**. The whole investigation took ~4 minutes and 9 page loads.

## What worked

1. **The "Select your Location" modal is the authoritative list of Nike online destinations.**
   - It opens automatically on a first visit to `https://www.nike.com/`.
   - Structure: `dialog[role=dialog] > generic > heading "Select your Location"`, then `h2` per continent
     (Africa, Americas, Asia Pacific, Europe, Middle East) followed by `ul > li > a` entries.
   - Each entry is `<a href="https://www.nike.com/<cc>/">` with an `h4` country name and a `p` language.
   - Reading it with `browser_evaluate` → `document.querySelector('[role=dialog]').innerText` and testing
     `/algeria|alg[eé]rie/i` is the fastest, most reliable check: 86 country links, `hasAlgeria: false`.
   - Africa section, in full, is: Egypt (EN), Morocco (EN), Maroc (FR), South Africa (EN). Nothing else.

2. **Direct subpath probe confirms absence.** `https://www.nike.com/dz/` and `/dz/en/` both render
   "We can't find the page you are looking for." with the page title "Page not found. Nike.com".
   Note: Playwright reports **HTTP status 500** for that error shell — that is Nike's 404 handling, not an outage
   or rate limit; do not treat it as a blocker and do not retry in a loop.

3. **Second source of truth: Nike Help.** `/help/a/international-shipping` says shipping is US-only and that
   customers outside the US must shop the country/region site — which for Algeria does not exist.

4. **Retail directory is physical only.** `/retail/directory/algeria/algiers/` lists "Nike Store Bab Ezzouar Mall
   (Partnered)" and "Nike Store Garden City Mall (Partnered)" with street addresses. Partnered = third-party
   retail, no e-commerce, no prices, no product links.

## What failed / friction

- Clicking the "View all" link inside the Help hub cards with `browser_click` timed out with
  "element is outside of the viewport" (the card list is inside a nested scroll region and MCP's scroll-into-view
  did not settle). Workaround: navigate to the link's own visible `href`
  (`/help/a/shipping-delivery-info-all`) instead of clicking.
- The location modal reopens on every fresh visit to nike.com and covers the page, so reading `main` requires
  closing it via the "Close Pop Up" button first, or reading `innerText` and skipping the modal text.

## Rule compliance notes
- One host only (`www.nike.com`), one tab, no other windows touched, no subagents.
- No APIs, no JSON endpoints, no network-inspection tooling used for data.
- Products from `nike.com/eg`, `/ma`, `/za`, `nike.ae` were **not** harvested — the task explicitly forbids
  presenting another country's products as Algerian, and those stores do not ship to Algeria.

## Time / volume
- Visited 9 page loads, ~4 minutes, 0 products (none exist to collect).
