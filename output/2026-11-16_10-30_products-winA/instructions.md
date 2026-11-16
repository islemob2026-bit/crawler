# Instructions (winA job)

- Site: https://www.lenomadefashion.com.dz/ (online catalogue only; not the physical stores page)
- Window: playwright_a only. One tab. No APIs, no JSON endpoints, no scripts.
- Scope: every product category in the shop menu (leaf categories, 75 found), first 3 pages each.
- Fields per product: category, page, name, url, price_text, price_da, image_url (plus category_slug added during merge).
- Pacing: 2 to 6 s waits, varied, between actions.
- Stop on: CAPTCHA, login, 403, 429, 5xx, or repeated errors. None were seen.
- Output: `lenomade_products_winA.json` (deduplicated by url) plus `raw/` per-page files.
- Lock: `output/.windows/win-A.lock`, deleted when the job ended.
