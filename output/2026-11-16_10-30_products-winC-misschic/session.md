# Session: miss-chic-cne.com products (window C)

- Site: https://miss-chic-cne.com/ (MISS CHIC, WooCommerce, Algeria)
- Window: playwright_c (-winC). Job folder: output/2026-11-16_10-30_products. Lock: output/.windows/win-C.lock
- Scope: every product category in the rendered top menu, first 3 pages each.
- Fields: category, page, name, url, price_text, price_da, image_url (plus `categories` list, added for dedup info)

## Menu (rendered, top nav)
- Nouveautes -> /products/
- Promotions -> /promotions/
- Ensemble -> /product-category/ensemble/
- Burkini -> /product-category/burkini/
- Foulard -> /product-category/foulard/
- Not product categories: Accueil, Contact, Panier.

## robots.txt
- Read in browser: https://miss-chic-cne.com/robots.txt
- Disallows only /wp-content/uploads/wc-logs/, woocommerce_transient_files/, woocommerce_uploads/, /*?add-to-cart=, /wp-admin/. Category and product paths are allowed.

## Log
| Step | Method | Result |
|---|---|---|
| Home | browser_navigate | OK, title MISS CHIC |
| Menu read | browser_evaluate, read-only | 5 product menu links |
| robots.txt | browser_navigate + evaluate | allowed paths confirmed |
| Nouveautes p1 | navigate /products/ | 12 cards |
| Nouveautes p2 | navigate /products/page/2/ | 8 cards |
| Nouveautes p3 | navigate /products/page/3/ | 0 cards, stop (no more pages) |
| Promotions p1 | navigate /promotions/ | attempt 1-3: ERR_CONNECTION_TIMED_OUT (3 tries, 5 s apart) |
| Promotions retry | navigate /promotions/ in a later run | OK, 3 cards |
| Promotions p2 | navigate /promotions/page/2/ | 3 cards, identical to p1 -> repeat, stop |
| Ensemble p1 | navigate /product-category/ensemble/ | 7 cards |
| Ensemble p2 | navigate .../page/2/ | "Page non trouvee" (404 page), 0 cards, stop |
| Burkini p1 | navigate /product-category/burkini/ | 1 card |
| Burkini p2 | navigate .../page/2/ | "Page non trouvee", 0 cards, stop |
| Foulard p1 | navigate /product-category/foulard/ | 1 card |
| Foulard p2 | navigate .../page/2/ | "Page non trouvee", 0 cards, stop |

Note: The Nouveautes run went through two extraction passes. The first pass had a cleaning bug (non-ASCII replaced by "DZD"), so it was redone. Only the second pass's data is in the output.

## Results
- Categories completed: Nouveautes (2 pages), Promotions (1 unique page, p2 repeats), Ensemble (1 page), Burkini (1 page), Foulard (1 page).
- Raw cards seen: Nouveautes 20, Promotions 3, Ensemble 7, Burkini 1, Foulard 1 = 32 rows.
- Unique product URLs: 20. Every product in other categories also appears in Nouveautes, so the merged file has 20 items.
- Blockers: none. No 403, 429, 5xx, CAPTCHA or login. One transient timeout (Promotions), recovered on retry.
- Missing price: ensemble-zina (no price text rendered), price_da null.

## Output
- output/2026-11-16_10-30_products-winC-misschic/misschic_products.json (20 items)
- session.md, experience.md, instructions.md in the same folder.
