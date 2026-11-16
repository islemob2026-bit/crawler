# Instructions received (window C)

- Site: https://www.oversizedz.com/ only. Browser tools playwright_c only. No subagents, no scripts, no APIs.
- Load home page once. If 503 or under-construction page persists, stop and report (one retry max).
- If live: categories from rendered menu, first 3 pages each, fields category, page, name, url, price_text, price_da, image_url. Stop a category when a page repeats the previous page.
- Merge into output/2026-11-16_10-30_products-winC/oversizedz_products_winC.json, deduplicated by url.
- Write session.md and experience.md. Release lock output/.windows/win-C.lock.
