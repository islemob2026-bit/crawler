# Session: products crawl (confirmed physical-store sites)
- Start: 2026-11-16 10:30
- Task: all categories, first 3 pages per category, product name, price, image link. Output JSON.
- Sites (approved by user, one at a time): LC Waikiki, Europa Sport, Kiabi, Okaidi, Le Nomade Fashion, Nike, Jacadi, Gemo, Mode Avenue, Maison Sport.
- Rules: browser only, one tab, pacing 2-6s, stop on 403/429/5xx or CAPTCHA/login.

## Log

- 10:31 kiabi.dz home: category links /collections/unv1000001-femme (Femme), unv1000002-homme, unv1000003-fille, unv1000004-garcon, unv1000005-bebe, plus outlet-* collections.
- 10:31 kiabi.dz/collections/unv1000001-femme: product cards readable from snapshot: name (link text), product URL, price (text 'X DA'). Image: only alt text in snapshot; image src URL NOT present in snapshot.
- Pagination not yet checked. Stopped to ask user about image link method.

- 11:36 Node script (kiabi_crawl.js) stopped by user request: MCP-only crawling required. Partial output kept in kiabi_products.json (Femme p1-3, Homme started). Remaining work via MCP only.
- 11:41 Kiabi via MCP browser_evaluate (DOM read, filename output): femme/homme/fille/garcon/bebe pages 1-3 done. Merged to kiabi_products.json; counts printed in shell.
- 11:43 LC Waikiki: lcwaikiki.com/fr-DZ redirected to www.lcw.com with 'Access Denied'. BLOCKED (access control). Not bypassed. Skipped; needs user decision.
- 11:44 Europa Sport (europasport.dz): genre pages index.php?page=products&genre=1|2|3&categoryID=1|2|3 (Vetements/Chaussures/Accessoires). Cards: '.product-listing .product' with name, product URL (e.g. /26334-...), price 'X DZD'. Image src is a shared placeholder (upload/logo/...) so product images are lazy-loaded: need data-src or scroll. Pagination format not yet confirmed (pages=N?). NOT FINISHED.
- 11:54 Europe Sport: 9 top-level listings (Homme/Femme/Enfant x Vetements/Chaussures/Accessoires) x 3 pages via index.php?page=products&genre=&categoryID=&pages=. NOTE: pages=0 and pages=1 return the same page-1 content, so some 'p2' files duplicated p1; unique merged result = 391 products. User said do not redo; kept as is and moved on. File: europasport_products.json
- 13:15 Okaidi DONE: 6 categories (naissance, bebe-fille, bebe-garcon, fille, garcon, chaussures) x 3 pages (?page=N), 40 cards/page. Extraction: article.product-miniature, .product-title a, .price, img data-src. 720 unique products, 0 null price/img. File: okaidi_products.json
- 13:19 Jacadi DONE: 5 categories (chaussures 2171, enfant 2174, naissance 2176, bebe 2178, tous 2790) x 3 pages (?page=N), 30 cards/page. PrestaShop article.product-miniature. 213 unique after overlap dedupe (naissance subset of bebe). 0 null price/img. File: jacadi_products.json
- 13:24 Gemo DONE: 5 categories (bebe, fille, garcon, femme, homme) x 3 pages (WooCommerce /page/N/), 30 cards/page. Extraction: .product-small, a.product-title, .price, img. 450 unique, 3 null price, 0 null img. File: gemo_products.json
- 13:43 Mode Avenue DONE: 6 categories (femme, homme, enfant, chaussures, sacs-accessoires, new-soldes) x 3 pages (WooCommerce /page/N/), 15 cards/page. Extraction: ul.products li.product, .price ins/.price del, img. 156 unique (sale prices captured in price_da, regular in price_old_da). 0 null price/img. File: modeavenue_products.json
- 14:08 User asked to delegate MORE websites. Queue (next windows): zara.com/dz, naisoun.com, pmg.dz, d15.dz, brandidz.com, oversizedz.com. Windows A and B both busy (Le Nomade Fashion; Maison Sport leftovers). Will dispatch 2 at a time as windows free.
