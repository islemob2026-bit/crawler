# Experience: Le Nomade Fashion (WooCommerce, Woodmart theme)

## Working selectors
- Product card: `.products .product, .product-grid-item.product` (Woodmart grid item, class `product-grid-item product`). `li.product` matches 0 cards on this theme.
- Product link and name: `h3 a, .wd-entities-title a, a.product-image-link, a[href*="/produit/"]`. Name in `.wd-entities-title`.
- Price: `.price`. Sale items show old and new prices in `ins .woocommerce-Price-amount`. When `ins` exists, use it for the number.
- Price format: `28 500,00 DZD` (space thousands separator, comma decimals, DZD suffix). Parsed to `price_da` = 28500.00 by stripping spaces and NBSP, then replacing `,` with `.`.
- Image: `img` with `data-src` first, then `currentSrc`, then `src`.
- Page heading: `h1` (category name).

## Pagination
- Visible page links: `.page-numbers` (current page in a span, others in `a`), with `a.next` for "→".
- Pattern: `<category-url>/page/N/`. Page 1 is the base URL.
- `per_page` links (9, 12, 18, 24) are shown too but were not used. Default is 12 per page.
- The page-number max from `.page-numbers` (ignoring "→") gives the page count.

## Category discovery
- Menu links: `a[href*="/categorie-produit/"]` in the rendered page (home or any category page). Strip `?query` and `/page/N/`.
- Leaves: URLs with no other menu URL under them as a prefix.
- The home-page mega-menu is incomplete for the Enfant section and for some sub-branches (for example Pret-a-porter-homme sub-items). Check the Enfant page menu too.

## Pacing and tooling
- `browser_wait_for` with `time` (2 to 6 s, varied) between navigate and read. Used as the pacing tool because execute has no setTimeout.
- `browser_evaluate` with `filename` writes the result to a JSON file in the workspace. The reply is only a link, so the array never comes back into the chat. Use CHECK (no filename) for the small status object.
- Inside one execute call, many tool calls run sequentially. Batches of 6 to 9 categories worked.

## Edge cases
- Empty categories (0 cards): a real empty state, not an error. The page still returns the normal category page with no product grid.
- Same product in several categories: dedupe by URL when merging.
- The product in homme echarpes also appears in femme echarpes. The merge attributes it to femme because the file name sorts first.

## Method that worked
- navigate to the category URL, wait, CHECK for count and page max, EXTRACT page 1 to a file, then navigate to `/page/2/` and `/page/3/` only if the visible page links show them.
