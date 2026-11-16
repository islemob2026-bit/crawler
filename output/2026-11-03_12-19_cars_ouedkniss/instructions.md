# Instructions for next Ouedkniss car crawl

1. Check `https://www.ouedkniss.com/robots.txt` first. Stop if disallowed.
2. Start at the homepage, click "سيارات و مركبات" (or go to /automobiles_vehicules/1). Follow visible links, not guessed URLs.
3. Do not read the full category snapshot. Use `browser_find` with regex `/url: /[^ ]*\d{5,}` to get ad links, titles, and locations.
4. For more than ~11 items, use the site's pagination links (visible on the page) after scrolling. Pace between page loads (a few seconds).
5. For prices missing in the list view, open each ad page once, read the price, then go back. One ad at a time.
6. Expect featured ads and store ads at the top of the list. Decide whether to include them (this run included them, as they are normal listings).
7. Avoid: opening many tabs, parallel requests, and any non-browser data endpoints.
