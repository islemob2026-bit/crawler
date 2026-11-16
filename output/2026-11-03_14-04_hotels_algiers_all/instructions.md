# Instructions for next Algiers hotel crawl

1. Start at https://www.google.com/maps/search/hotels+in+Algiers/ and scroll feed to collect place links.
2. Deduplicate by URL/name.
3. For each hotel, open place page and extract fields via DOM: h1 name, rating/reviews regex, "Hôtel X étoiles", Adresse/Site Web/Numéro de téléphone buttons, first photo img.
4. Use MCP browser (headed) rather than headless Playwright to avoid network blocks.
5. Batch 3-4 hotels per run_code call and POST results to a local save server to avoid truncation.
6. Pace 2-5s between navigations.
7. Check robots.txt first.