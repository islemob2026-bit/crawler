# Experience: Gumroad discover (what worked)

- robots.txt at /robots.txt: only /purchases/ disallowed. /discover is fine.
- Default /discover shows "Trending". Clicking the "Best Sellers" tab (role=tab) switches to ?sort=best_sellers.
- Listing cards are `article` elements. The product link is `a[href*="/l/"]` (strip query). Name is in h2 or h4. Price, rating, and count are in the card text ("$27", "5.0", "(5)" / "(1.4K)").
- "Load more" is a button below the list. It adds about 20 cards per click. Scroll first, then click.
- Product page: `h1` gives the name. `meta[property="og:description"]` gives a usable short description (ellipsized). Price and rating are in the body text.
- Browser snapshots written to `.playwright-mcp/` were sometimes empty. Use `browser_snapshot` or `browser_find` instead, or re-navigate after a short wait.
- Pace used: 2 to 6 s between page loads (random), plus 2 to 4 s after navigation.
- Not used: no APIs, no sitemap, no JSON endpoints. The sitemap in robots.txt was not fetched.
