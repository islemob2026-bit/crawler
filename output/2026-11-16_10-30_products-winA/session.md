# Session: Le Nomade Fashion online catalogue (winA)

- Site: https://www.lenomadefashion.com.dz/ (WooCommerce + Woodmart theme)
- Window: playwright_a (single tab, single site)
- Job: crawl every product category in the shop menu, first 3 pages each, JSON output.
- Date: 2026-11-16

## Category discovery
- Home page menu (HOMME / FEMME / ENFANT mega-menu) read through browser_evaluate.
- Categories were read from `a[href*="/categorie-produit/"]`. Pagination and per_page links were excluded.
- Leaf rule: a category is a leaf when no other menu URL sits under it. Parents were not crawled as products.
- Home-page menu gave 62 leaves. The Enfant page menu added fille-enfant, garcon, destockage, unisex, non-classe, homme/sandales, homme bob, espadrilles, mules, ensemble-jogging, gilet, sweater-homme, femme pantalon and femme sweater.
- Total: 75 leaf categories.

## Crawl log
- Each category: navigate, wait 2 to 6 s (varied), CHECK (card count, page-number max, blocked-text check), then EXTRACT to file for page 1.
- Pages 2 and 3 are visited only when the visible page-number links show them (`/page/N/`). Capped at 3.
- Categories with 0 product cards on page 1: 24 (listed below). No file written for them.
- Categories with products: 51. Page files saved: 73 (in `raw/`).
- Blocks: none. No CAPTCHA, login wall, 403, 429 or 5xx was seen.
- Empty categories (0 cards): homme manteaux, homme pantalons-costumes, homme portefeuilles, homme cravates, homme boutons-de-manchettes, homme montres, femme tops, femme blouses, femme jupes, femme jeans, femme costumes, femme manteaux, femme sandales, femme sacoches, femme portefeuille, femme bagagerie, femme foulards, femme bracelet, femme montres, femme sweater, homme espadrilles, destockage, unisex, non-classe.
- Note: categories with more than 3 pages (for example sneakers-homme, polo, jeans) were capped at page 3 by design. The page count in the log is the site's own count.

## Merge
- All `raw/*.json` files merged into `lenomade_products_winA.json`.
- Deduplicated by product URL. The first occurrence in file-name order is kept, so a product that appears in several categories is attributed to the first one (for example echarpes-homme is attributed to femme's echarpes).
- Result: 483 unique products across 51 categories.
- Raw rows before dedupe: 492. Duplicates removed: 9.

## Problems
- The server restarted during the job. One shell read was aborted. Recovery: re-read the file with the read tool, and rebuild the merge. No crawl was repeated.
- Earlier unlabeled files from a previous run (14:01 to 14:14) are present in the folder root: `lenomade_*_p*.json`. They were not used for the merge. They were left in place and are not part of this session's data.
- The shell console shows some accented characters garbled ("GARÇON"). The JSON is written as UTF-8 without BOM; the garbling is only in console output.

## Outputs
- `lenomade_products_winA.json` (merged, 483 items)
- `raw/` (73 per-page JSON files)
- `experience.md`, `instructions.md`, `session.md`
