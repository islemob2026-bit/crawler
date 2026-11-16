# Session log - window F (playwright_f)

Site: Shopify App Store (https://apps.shopify.com/)
Goal: 1- and 2-star review complaints, up to 30 items.

1. Read AGENTS.md, crawler.md, lock file (win-F.lock).
2. Navigated https://apps.shopify.com/robots.txt. Result: User-agent * disallows /internal/, /services/, /login/, /partner/login, /api/collect, *q=*, /*?*shpxid=*, /*?*auth=*. Review pages (/<app>/reviews?ratings[]=N) are not disallowed.
3. Navigated https://apps.shopify.com/ (redirected to ?locale=fr). Homepage rendered, no block. Used as start page.
4. Opened app page https://apps.shopify.com/facebook?locale=fr (wait 4s). Aggregate: 3.9 stars, 5871 reviews. Star counts: 1-star 1334, 2-star 253.
5. Opened https://apps.shopify.com/facebook/reviews?locale=fr&ratings[]=1 (wait 4s). Page 1 read: 10 one-star reviews. Total pages 134.
6. Opened https://apps.shopify.com/facebook/reviews?locale=fr&ratings[]=2 (wait 3s). Page 1 read: 10 two-star reviews. Total pages 26.
7. Stopped collection at 20 items. Reason: one site, one app visited; stopped after the first page of each filter to keep pacing light. No 403/429/5xx, CAPTCHA or login wall seen. Not collected: page 2+ of both filters, other apps.

Pages visited: 4 (robots.txt, homepage, facebook app page, 1-star reviews p1, 2-star reviews p1 = 5 including robots)
Total pages visited: 5
Items saved: 20 (ideas.json)
