# Experience - what worked

- robots.txt is rendered as plain text; readable via browser_navigate snapshot.
- Review pages are reachable with the visible filter links on each app page: `/<app>/reviews?locale=fr&ratings[]=1` (1-star) and `ratings[]=2` (2-star). Pagination uses `&page=N`.
- Review text is in the rendered snapshot (paragraph nodes). Some long reviews have an "Afficher plus" button that truncates text; the truncated text was used as-is.
- Each review shows star image ("N out of 5 stars"), date, text, reviewer name, country, and time using the app.
- Category and price are not shown on the reviews page; price ("Installation gratuite") comes from the app listing card.
- Note: robots.txt disallows `*q=*` for all agents, so search-query URLs were not used.
- browser_navigate returns the snapshot; browser_wait_for does not. Snapshot files land in `.playwright-mcp/`.
