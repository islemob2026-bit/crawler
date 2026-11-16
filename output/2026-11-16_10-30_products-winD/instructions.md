# Instructions (winD)
Job: PMG (https://pmg.dz/) product categories, first 3 pages each (men, women, kids).
Method: browser_navigate, browser_wait_for 2-4 s, browser_evaluate read-only extraction of [category, page, name, url, price_text, price_da, image_url], deduplicate by url.
Browser: playwright_d only. Stop on CAPTCHA, login, or repeated 403/429/5xx.
