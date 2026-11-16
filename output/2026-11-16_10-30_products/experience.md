# Experience — Algerian clothing stores product crawl (2026-11-16)

## Session
- Folder: `output/2026-11-16_10-30_products/` (primary window), `-winA` and `-winB` for the two subagent windows.
- Task: all categories, first 3 pages of each category; fields = name, price, image URL, product URL.
- Rule followed: browser only (Playwright MCP), one site per window, sequential inside a window.

## Method that worked everywhere
1. `browser_navigate` to the category URL.
2. `browser_wait_for` 2–4 s (varied) so the grid renders.
3. `browser_evaluate` with a small read-only function that walks the rendered DOM and returns an array of objects.
4. Pass `filename:` to `browser_evaluate` so the array is written straight to a JSON file. This avoids copying thousands of rows through the chat and is far more reliable than printing the array.

Passing `filename` was the single biggest efficiency win: one call per page, zero copy errors.

## Site-by-site notes
### Kiabi (kiabi.dz) — Shopify
- Categories: `/collections/unv1000001-femme`, `unv1000002-homme`, `unv1000003-fille`, `unv1000004-garcon`, `unv1000005-bebe`; also `outlet-*`.
- Pagination: `?page=N`. 24 cards per page. 3,985 products in Femme alone.
- Cards: `li` containing `a[href*="/products/"]`; price text `X,XXX DA`; image `img[src*="/cdn/shop/"]`.
- The accessibility snapshot shows only image `alt`, never the `src`, so `browser_evaluate` is required for image URLs.

### Europa Sport (europasport.dz) — PHP/legacy
- Categories: `index.php?page=products&genre=1|2|3&categoryID=1|2|3` (Homme/Femme/Enfant × Vêtements/Chaussures/Accessoires).
- Pagination is JavaScript (`PageHist(N)`) plus a `pages=` URL parameter. **Trap:** `pages=0` and `pages=1` return the same first page, `pages=2` is page 2, `pages=3` is page 3. Because of this, some of my "page 2" files duplicated page 1; the merged result is 391 unique products, not the full 3 pages everywhere.
- Cards: `.product-listing .product`; price `X,XXXDZD`; real image is lazy `data-src` (the `src` is `upload/logo/...` or `images/ajax-loader.gif`).

### Okaïdi (okaidi.dz) — PrestaShop
- 6 top-level categories: `1391-naissance`, `1392-bebe-fille`, `1393-bebe-garcon`, `1395-fille`, `1397-garcon`, `1394-chaussures`.
- `?page=N`, 40 cards per page. Cards: `article.product-miniature`, `.product-title a`, `.price`, `img[data-src]`.
- Clean result: 720 products.

### Jacadi (jacadi.dz) — PrestaShop
- Categories used: `2171-chaussures`, `2174-enfant`, `2176-naissance`, `2178-bebe`, `2790-tous-les-produits`. `?page=N`, 30 cards per page.
- Categories overlap heavily (`naissance` ⊂ `bebe`), so dedupe by URL: 213 unique.
- `2171-chaussures` has only 21 products; `?page=2/3` are empty. Not an error.

### Gémo (gemo-algerie.com) — WooCommerce + Elementor
- 5 top-level categories: `/categorie-produit/{bebe,fille,garcon,femme,homme}/`.
- Pagination `/page/N/`, 30 cards per page. Cards are `div.product-small` (not `li.product`).
- Prices render as `د.ج 2.000,00`: strip spaces and dots, convert the decimal comma.

### Mode Avenue (modeavenue-dz.com) — WooCommerce
- Categories: `femme, homme, enfant, chaussures, sacs-accessoires, new-soldes`. `/page/N/`, 15 cards per page.
- Sale products show two prices: `.price ins` (current) and `.price del` (before). Both captured.
- 156 unique.

### Maison Sport (maisonsport.dz) — custom PHP
- No top-level categories: 80 leaf categories at `/categorie/<slug>`; pagination `?page=N`, 12 cards per page.
- Cards are `a.article` (there are **no** `a[href*="/produit"]` links). Name in `span.d-block.cl2`, price `12 800 DA`, image `/gla-adminer/uploads/article/small/...`.
- Empty grid right after `domcontentloaded`; needs the 3 s wait.

## Failures and traps worth remembering
- **LC Waikiki** (`lcwaikiki.com/fr-DZ`) redirects to `lcw.com` and returns "Access Denied" (Akamai). Not bypassed.
- **Chrome vs Playwright browser build**: a standalone Node script failed because the npm package expected `chromium-1254` while `chromium-1248` was installed. Not relevant anymore (MCP only), but worth knowing.
- **PowerShell `@()` around `ConvertFrom-Json`** collapses a JSON array into a single element. Use the direct assignment (`$j = Get-Content ... | ConvertFrom-Json`) and iterate `$j`.
- **Saved evaluate results** are plain JSON arrays when the function returns an array. Do not `JSON.stringify` the result, or the file becomes a quoted string and needs double parsing.
- **Network flakiness** on the hotspot: `ERR_CONNECTION_TIMED_OUT` appears sporadically. Retry the same navigation once or twice after ~5 s; it usually succeeds.
- **MCP disconnects** after long batches ("Connection closed"). The next call reconnects by itself; no need to restart OpenCode.

## Timing
- ~3 s of wait per page plus ~2 s of extraction. A 20-category batch (up to 60 navigations) is too long for one call; 6–10 categories per call is the practical ceiling.
