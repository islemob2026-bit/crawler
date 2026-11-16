# Session: SideProjectors (window C, playwright_c)

- Date: 2026-11-16
- Start URL: https://www.sideprojectors.com/
- Robots.txt: fetched 14:55. `User-agent: *` Allow: /. Disallow only /admin/, /auth/, /inbox/, /logs/, /storage/, /vendor/. Project pages (/project/) and /daily, /makers, /rss allowed. Sitemap listed; not used.

## Log
1. navigate https://www.sideprojectors.com/ — OK, title loaded, no login wall, no CAPTCHA, no 403/429/5xx.
2. wait 3s, snapshot — homepage list of project cards rendered (list view, default). Extracted 30 items from the rendered snapshot. Skipped sponsor/advertisement cards (Monsieur Meursault, Wizstar, Cologne Market) and "KoreanBridge" (over the 30 cap).
3. Did not open individual project pages, did not paginate (cap of 30 reached on page 1). Single page visited, one tab.

## Result
- Pages visited: 1 (homepage)
- Items: 30 (ideas.json)
- Blockers: none.
- Note: price/category fields come from the card label ("For sale ~ $X negotiable", "Showcase", "Showcase / Open to sell", "Seeking Co-Founder / Collaborator"). Category (industry) is not shown on cards; left empty and stage stored in category_or_stage.
- Console showed 4 errors on load (site-side; not investigated).
