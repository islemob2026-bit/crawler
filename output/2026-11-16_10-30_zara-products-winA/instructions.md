# Instructions (winA, zara.com/dz)

- Job: all product categories (women, men, kids), first 3 pages of each category. Fields: name, price, image URL, product URL.
- Site: https://www.zara.com/dz/ only. One tab, playwright_a only. Browser only, no APIs or JSON endpoints.
- Method: navigate, wait 2 to 6 s, read-only browser_evaluate extraction, filename output to `raw/`, merge with `merge_winA.js`.
- Stop on 403, 429, 5xx, CAPTCHA, or login. Record in session.md.
- Lock: `output/.windows/win-A.lock`. Delete on finish or stop.
