# Experience: Maison Sport leftover 16 categories (window B)

## Working method
1. Navigate to https://www.maisonsport.dz/categorie/<slug>, wait about 3 s with browser_wait_for, then browser_evaluate.
2. Card count: document.querySelectorAll('a.article').length.
3. Pagination check: look for anchors whose href contains ?pageN. Pages were ?page=2 and ?page=3. Only follow a link that the current page shows.
4. Save each page with browser_evaluate(function=verified extraction, filename=...). The result is a JSON array written to the file. No data went through chat.
5. Merge in PowerShell: parse each maisonsport_<slug>_p<n>.json, dedupe by url, keep category and page.

## What worked
- Verified extractor from the brief worked on all 16 categories.
- Pagination links appear as anchors with ?page=N hrefs. Some categories show ?page=4 links, but I stopped at page 3 as instructed.
- Some categories show no page links at all. These are single-page results (short, survtements-femme, blouson, parka-homme).

## Gotchas
- execute has no setTimeout. Use browser_wait_for({time}) for pacing.
- browser_navigate returns text with the page state, not an exception. Check the returned text for ERR_ before going on.
- A page showing ?page=3 in its links can still have no cards on that page (pull p3 had 0).
- The text "page=" also matches the current page's own link. For the next-page check, look for the exact ?page=N+1 string.

## Results
- 16/16 categories completed. 288 unique products after dedup.
