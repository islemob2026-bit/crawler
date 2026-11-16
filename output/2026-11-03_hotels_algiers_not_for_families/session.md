# Session: Hotels in Algiers - not suitable for families (2026-11-03)

**Task:** Search Google Maps for hotels in Algiers, check reviews for hotels users say are not suitable for families.

**Start URL:** https://www.google.com/maps/search/hotels+in+Algiers/

## Steps
1. Checked robots.txt and Google terms (automated access allowed when robots.txt respected).
2. Opened search for "hotels in Algiers". Found 7 hotels.
3. For each hotel: opened place page, opened Avis tab, searched reviews using keywords: famille, enfant, bébé, pas pour, pas adapté, familial.
4. Extracted review snippets mentioning family/children from search results.
5. Saved results to results.json.

## Hotels checked
1. Residence Inn by Marriott Algiers Bab Ezzouar
2. Hôtel Marriott Algiers Bab Ezzouar
3. City Hotel Algiers
4. Hotel Best Night - Bab Ezzouar
5. Hyatt Regency Algiers Airport
6. Sofitel Algiers Hamma Garden

## Pages visited
- https://www.google.com/maps/search/hotels+in+Algiers/
- 6 hotel place pages with Avis tabs

## Errors / blockers
- Scrolling review list does not load more reviews (same issue as Oran session). Used review search box instead.
- Review text is truncated in list view (need to click "Plus" to expand, not done).
- No CAPTCHA, login wall, or HTTP errors.
- Some hotel reviews have owner responses mixed in with reviews.
