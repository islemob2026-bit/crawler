# Experience: zara.com/dz (playwright_a)

## What works
- Category pages render product cards after a wait of about 6 to 8 s. Category landing pages with no grid (femme-mkt1000, enfants-mkt1) render 0 cards. They are hubs. Use the subcategory `-l\d+.html` pages they link to.
- homme-l534.html renders its own grid (80 cards) with no hub step.
- Product grid selectors:
  - Card: `li.product-grid-product` (`data-productid`, `data-pagenum`).
  - Product URL: `li.product-grid-product a.product-link[href]`. It is an anchor, so the earlier fear was unfounded.
  - Image: `li.product-grid-product img` (`currentSrc`/`src` on static.zara.net).
  - Name and price are NOT inside the card li. They sit in a sibling block `.product-grid-product-info` (in `li.product-grid-block-dynamic__product-info`). Name: `.product-grid-product-info__name` (h3 text, href = product URL). Price: `.price-current .money-amount__main`, falling back to `.money-amount__main`. Example text: "8 900 DZD" (non-breaking spaces).
  - Join card to info block by product URL.
- Pagination: `?page=N`. Each navigation keeps the previous page's cards in the DOM. Each li has `data-pagenum`, so filter `li.dataset.pagenum == N`. Without this filter, pages 2 and 3 overlap page 1 (76 and 75 cards).
- A "Voir plus" button exists, but `?page=N` links are visible in the pagination block and worked.

## Problems
- The Arabic home menu opens as a dialog. Its category entries are buttons and generic elements, not anchors, so they are hard to read. The French home (`/dz/fr/`) exposes the full menu as anchors. Use French.
- femme-collections-l2158: page 1 returned only 4 cards and page 2 returned 0. The run was cut off by the server crash shortly after. Re-check this category before using it.
- Page 1 yields 38 unique URLs from 40 `li` cards (duplicates or cards without anchors). Dedupe by url.

## Crash
- The playwright_a server closed with "MCP server process exited with code 1" during a browser_wait_for call. After that, the tools were removed from the catalog. No recovery path was available in this window.

## Reusable extraction (verified)
See the FN function in session.md. It returns [{category, page, name, url, price_text, price_da, image_url}] with `li.dataset.pagenum` filtering.
