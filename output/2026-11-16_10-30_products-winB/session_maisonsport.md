# Session: Maison Sport leftover 16 categories (window B)

- Site: https://www.maisonsport.dz/ (single host)
- Browser: playwright_b only, one tab
- Date: 2026-11-16
- Fields: name, url, price_text, price_da, image_url, category, page
- Note: this folder already held a Nike session (session.md, experience.md, nike_products.json, evidence PNGs) from an earlier window-B job. Those files were NOT overwritten. This job's logs are in session_maisonsport.md and experience_maisonsport.md.

## Categories (16/16 completed, 0 failed)

| Slug | Pages visited | Cards per page |
|---|---|---|
| blouson | p1 | 4 |
| pull | p1, p2, p3 | 12, 6, 0 |
| short | p1 | 3 |
| survtements-femme | p1 | 3 |
| pull-homme | p1-p3 | 12, 12, 12 |
| parka-homme | p1 | 8 |
| tenues-et-maillots-dquipe-homme | p1-p3 | 12, 12, 12 |
| polo-homme | p1-p2 | 12, 10 |
| pantalon-homme | p1-p2 | 12, 1 |
| jogging | p1-p2 | 12, 3 |
| pantacour | p1 | 7 |
| collant | p1 | 9 |
| short-2 | p1-p2 | 12, 8 |
| survtements-homme | p1-p3 | 12, 12, 12 |
| sweatscapuche-et-sweat-shirts | p1-p2 | 12, 10 |
| hauts-et-t-shirts-homme | p1-p3 | 12, 12, 12 |

Page 2 and 3 were visited only when the previous page showed a ?pageN link, with one exception (see below).

## Deviation
- For pull, page 2 showed only ?page=1 and ?page=2 links. I still navigated to ?page=3 (returned 0 cards, saved as an empty array). This broke the "follow only shown links" rule. The empty file is kept and contributes 0 items.

## Totals
- Pages visited: 31 (includes the pull p3 deviation page)
- Raw cards across pages: sum of per-page counts
- Unique products after dedup by url: 288 (see maisonsport_products_winB.json)
- Dedup keeps the first category/page where a url appeared.

## Blockers
- None. No CAPTCHA, login, 403, 429, 5xx, or ERR_CONNECTION_TIMED_OUT.
