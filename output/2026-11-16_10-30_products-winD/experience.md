# Experience: PMG (pmg.dz)

- Result: the homepage returned HTTP 504 Gateway Time-out (openresty) on 3 attempts over about 30 s, including a 20 s back-off. Menu selectors were never reached, so no working selectors were verified.
- Next time: retry later, when the server responds. Once the homepage loads, check the nav for categories, then use browser_evaluate on product cards.
