# Session: Gumroad Best Sellers (window B)

- Site: https://gumroad.com (start URL https://gumroad.com/discover)
- Window: playwright_b, one tab
- Date: 2026-11-16
- Goal: up to 30 top-selling / highly reviewed digital products. Fields: name, URL, price, review count, star rating, creator, short description.

## Steps
1. robots.txt checked: `User-agent: *`, only `Disallow: /purchases/`. /discover allowed.
2. Opened /discover. Snapshot showed Trending by default. Browser snapshot was needed (the navigate snapshot file was empty on the first two tries).
3. Clicked the "Best Sellers" tab -> /discover?sort=best_sellers.
4. Scrolled gradually, clicked "Load more" twice. Read the rendered listing cards (33 unique product links, one card per product).
5. Excluded 3 candidates: THE RUNNERS COMMUNITY (community), MDE.TV High-Roller Paywall (paywall), SpotiDown Premium License Key (third-party app key, outside scope).
6. Visited each remaining product page one at a time (30 pages), reading h1 and og:description. Waits between pages were varied 2 to 6 s.
7. Wrote ideas.json (30 items). Kinds: 19 product, 5 membership, 5 subscription, 1 community (flagged in `kind`).

## Pages visited
- https://gumroad.com/robots.txt
- https://gumroad.com/discover
- https://gumroad.com/discover?sort=best_sellers
- 30 product pages (listed in ideas.json)

## Blockers
- None. No login wall, CAPTCHA, 403, 429, or 5xx.
- Note: the list is mostly paid items, and several "products" are memberships, subscriptions, and communities (flagged in `kind`). A user who wants only downloadable templates/trackers/scripts should filter on `kind == "product"`.
- Review counts and ratings come from listing cards. Some show "(1.4K)" or "(2.9K)"; the value written is the rounded figure. Exact values: Novabeast 1434, Mac Mouse Fix 1406, TM Real Walk 2900.
