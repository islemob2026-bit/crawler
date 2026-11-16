# Instructions (window C)

Site: https://miss-chic-cne.com/ (one site only).
Task: every product category from the rendered menu, first 3 pages each. Fields: product name, price, image URL, product URL, category, page.
Method: browser only (playwright_c). navigate, wait 2-4 s, read-only evaluate. Stop a category when a page repeats the previous one. Retry navigation up to 2 times on connection timeouts. Stop on 403, 429, 5xx, CAPTCHA or login.
Output: one merged JSON array, deduplicated by product URL, ASCII-safe.
