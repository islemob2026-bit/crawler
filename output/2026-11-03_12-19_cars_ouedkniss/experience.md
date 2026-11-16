# Experience: Ouedkniss cars crawl

## What worked
- robots.txt is readable at /robots.txt and allows all.
- Category link on the homepage: "سيارات و مركبات" -> /automobiles_vehicules/1.
- `browser_find` with regex `/url: /[^ ]*\d{5,}` locates ad links (slugs end in `-d<digits>`). Much cheaper than reading the full snapshot.
- Ad URLs contain the title, city, and listing ID.

## What did not work
- Text search for "/annonce/" returned nothing. Ouedkniss does not use that path.
- Full snapshot of category page is very large (ad iframes, tracking links).
- `setTimeout` is not available in the execute sandbox. Use plain awaits.

## Notes for the site
- Site is in Arabic (RTL). Prices are shown as "N مليون" (millions) in listing text.
- Some listings have no price in the list view; price is on the ad page (not opened in this run).
- Time taken: about 10 browser calls, no waiting needed beyond normal call latency.
