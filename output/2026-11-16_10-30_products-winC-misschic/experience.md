# Experience: miss-chic-cne.com (WooCommerce)

## What works
- Product cards: `li.product`. Name and URL: `h2 a` or `a.woocommerce-LoopProduct-link`. Image: first `img` in the card (use `currentSrc`).
- Current price: `.price ins .woocommerce-Price-amount` when on sale, else the first `.price .woocommerce-Price-amount`. Text looks like `د.ج 5.500`, where the dot is a thousands separator, so 5.500 = 5500 DA.
- Pagination: `/<category>/page/N/`. Nonexistent pages return a "Page non trouvee" 404 page (0 cards). Stop there.
- Promotions: `/promotions/page/2/` can repeat page 1's products. Compare the URL list to detect the repeat.
- Non-ASCII in names: guillemets and curly quotes become ASCII. Other non-ASCII is stripped. Currency is normalised to DZD in the output.

## Pitfalls
- Stripping all non-ASCII before parsing the price turned the currency symbol into a bogus "DZD.DZD" string in the first pass. Parse the `.woocommerce-Price-amount` element directly instead.
- Timers are not available in the execute sandbox. Use `browser_wait_for` (time in seconds) for pauses.
- Navigation timeouts (ERR_CONNECTION_TIMED_OUT) can happen. Retry up to 2 times, 5 s apart. One retry was enough here.
- Some products have no rendered price (ensemble-zina). Leave price_da null rather than guessing.

## Efficiency
- Five categories, about 14 page loads in total. A script was not needed. The site is small.
