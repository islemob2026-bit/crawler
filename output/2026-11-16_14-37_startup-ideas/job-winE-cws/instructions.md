# Instructions (crawler-window-e)

- Site: https://chromewebstore.google.com/ (single start URL, stay on this host)
- Collect up to 30 extensions with complaints or wishes from 1-2 star reviews. Fields: name, URL, quote/paraphrase, star rating, user count, category.
- Rules: one tab, one page at a time, 2-6 s varied waits, no logins, no APIs or hidden JSON, rendered pages only, respect robots.txt. Stop on login, CAPTCHA, 403, 429, 5xx.
- Output: chrome-web-store.json and ideas.json in this folder. Do not modify job-winE.
