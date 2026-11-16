# Session log: maximilien today tenders

- Task: scrape 10 tenders published today (03 Nov 2026) from maximilien.fr (user typed "maximilen.fr").
- Start URL: https://www.maximilien.fr/ -> https://marches.maximilien.fr/entreprise -> "Voir toutes les consultations" https://marches.maximilien.fr/?page=Entreprise.EntrepriseAdvancedSearch&AllCons
- Session time: approx. 2026-11-03 (exact times not logged).
- Steps: homepage (cookie banner left untouched), tender portal, advanced search (423 results, 10/page), clicked "Publié le" sort header (ctl0_CONTENU_PAGE_resultSearch_tableauResultSearch_ctl0_ctl1). Sort applied; first page showed publication date 3 Nov for the first 10 cards.
- Snapshot parsing via execute/JS; no API or hidden endpoints used. No pagination needed (first 10 results were all today's).
- Errors/skips: first sort click failed with stale ref (retried successfully). Reference codes not captured for 8 of 10 items (only FCS26-017 and FCS26-18 extracted). Deadline years not verified (day+month only). Robots.txt not checked in this session.
- Browser closed.
- Result: 10 items in tenders.json.
