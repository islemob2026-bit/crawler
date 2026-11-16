# Instructions — next crawl of these Algerian clothing sites

## Always do this first
1. One site per window. `playwright` for the main run, `playwright_a` / `playwright_b` only for *different* sites, driven by the window subagents.
2. Per category page: `browser_navigate` → `browser_wait_for` 2–4 s → `browser_evaluate` **with `filename:`** so the page lands in a JSON file. Never print large arrays into the chat.
3. Keep batches of 6–10 categories per `execute` call. Larger batches get interrupted and disconnect the MCP server.
4. Wrap navigations in a small retry (2 attempts, ~5 s apart): the hotspot throws `ERR_CONNECTION_TIMED_OUT` at random.

## Site playbook
| Site | Category URL pattern | Pagination | Card selector | Price | Image |
|---|---|---|---|---|---|
| kiabi.dz | `/collections/unv1000001-femme` …`unv1000005-bebe` | `?page=N` | `li > a[href*="/products/"]` | `X,XXX DA` | `img[src*="/cdn/shop/"]` |
| europasport.dz | `index.php?page=products&genre=1&categoryID=1` | `pages=0/2/3` (**not 1**) | `.product-listing .product` | `X,XXXDZD` | `img[data-src*="upload/thumbs"]` |
| okaidi.dz | `/fr/1391-naissance` … `/fr/1394-chaussures` | `?page=N` | `article.product-miniature` | `.price` | `img[data-src]` |
| jacadi.dz | `/2171-chaussures`, `/2174-enfant`, `/2176-naissance`, `/2178-bebe`, `/2790-tous-les-produits` | `?page=N` | `article.product-miniature` | `.price` | `img[src]` |
| gemo-algerie.com | `/categorie-produit/{bebe,fille,garcon,femme,homme}/` | `/page/N/` | `div.product-small` | `د.ج 2.000,00` | `img[src*="wp-content/uploads"]` |
| modeavenue-dz.com | `/categorie-de-produit/{femme,homme,enfant,chaussures,sacs-accessoires,new-soldes}/` | `/page/N/` | `ul.products li.product` | `.price ins` / `.price del` | `img[src*="wp-content/uploads"]` |
| maisonsport.dz | `/categorie/<leaf-slug>` (80 leaves, no top level) | `?page=N` | `a.article` | `12 800 DA` | `img[src*="/gla-adminer/"]` |

## Avoid
- **LC Waikiki**: `lcw.com` returns "Access Denied" (Akamai). Do not retry, do not try to bypass. Skip and report.
- **Nike Algeria**: no online store for Algeria (86 country links, none is Algeria; `nike.com/dz` is 404; Nike ships US only). Only the 2 partnered physical stores in Algiers exist. Do not crawl another country's store as a substitute.
- Snapshot-only reading: the accessibility snapshot **never** contains image `src`. `browser_evaluate` is mandatory for image links.
- `@()` around `ConvertFrom-Json` in PowerShell, and `JSON.stringify` inside the evaluate function.

## Output shape
One JSON array per site, deduplicated by product URL:
`{ category, page, name, url|product_url, price_text, price_da, image_url }`.
Normalise `price_da` to digits with a dot decimal separator; drop thousands separators.

## Multi-window etiquette
- Give each subagent exactly one site (or one explicit list of leftover categories of one site), the output folder suffix, and the verified selectors. Never let two windows touch the same host.
- After a window finishes, verify its file yourself (count rows, count null prices/images) before merging — do not trust the summary alone.
