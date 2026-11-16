# Experience: Acquire.com

- Public cards are not on the home, SaaS category, or /buyers/ pages (signup gate).
- Category pages under /<niche>-businesses-for-sale/ (e.g. /ecommerce-businesses-for-sale/) render public cards with name, niche/country, and asking price with profit multiple.
- MRR and traffic source are generally not on public cards. Titles sometimes carry revenue text.
- Card links point to app.acquire.com; visiting them would enter the signup/login host, so they were not opened.
- Working approach: read the category page snapshot, then collect anchors whose text contains "Asking price" via browser_evaluate (rendered DOM only).
