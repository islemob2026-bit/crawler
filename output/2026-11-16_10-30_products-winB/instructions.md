# Instructions for the next crawl of nike.com (country availability)

## Goal-type this covers
"How do I quickly and honestly find out whether Nike sells online in country X?"

## Do this

1. Open `https://www.nike.com/`. A `dialog` titled "Select your Location" opens automatically.
   - Do **not** try to click every continent; just read the dialog text:
     `document.querySelector('[role=dialog]').innerText` via `browser_evaluate`, or a `browser_snapshot` of the
     generic wrapper around the country lists.
   - Sections are `h2` (Africa / Americas / Asia Pacific / Europe / Middle East) each followed by `ul` of
     `a[href=https://www.nike.com/<cc>/]`. Country name is the `h4`, language is the `p`.
2. Search that text for the target country and its local-language spelling (e.g. `Algeria|Algérie`).
   If absent → Nike has no online store there. Stop; there is nothing to crawl.
3. Confirm with a direct probe of the expected subpath (`https://www.nike.com/<cc>/`, also `/<cc>/en/`).
   A "Page not found" render with status 500 is Nike's normal 404 — not a blocker, don't retry.
4. Confirm with the Help article `https://www.nike.com/help/a/international-shipping`: Nike does not ship
   internationally; you can only buy from the local country site.
5. If a retail directory is relevant, `https://www.nike.com/retail/directory/<country>/<city>/` lists stores.
   "Partnered" stores are third-party physical retail — presence there does **not** mean online sales.

## Avoid

- Do not crawl `nike.com/eg`, `/ma`, `/za`, `nike.ae`, `/sa`, `/qa`, `.kw` and label the items for another country.
  Those markets do not ship to Algeria/North Africa outside their own list.
- Do not treat the HTTP 500 on `/dz/`-style unknown subpaths as a site error or a 5xx blocking condition.
- Do not click links inside the Help hub cards: `browser_click` fails with "element is outside of the viewport".
  Navigate to the visible `href` instead.
- Remember the location modal covers the page on every fresh visit — close it ("Close Pop Up") before reading
  `main`, or accept that `innerText` starts with the country list.

## Pace
- 2–4 s waits between navigations; this whole availability check needs only ~5–9 page loads. No pagination involved.

## Known-good facts (as of 2026-11-16)
- Africa destinations on nike.com: Egypt, Morocco (EN + FR), South Africa. **No Algeria.**
- Middle East: Saudi Arabia, UAE, Qatar, Kuwait.
- Algeria presence on nike.com is physical retail only: partnered Nike stores at Bab Ezzouar Mall and
  Garden City Mall, Algiers.
