# Experience

What worked:
- Path: maximilien.fr -> marches.maximilien.fr/entreprise -> "Voir toutes les consultations" (advanced search, AllCons).
- Default order is not by date. Clicking the "Publié le" column header sorts by publication date descending; the first cards then show today's date (3 Nov).
- Snapshot-based extraction: reading the snapshot in execute and filtering lines (pub month, "Organisme :", consultation URL) worked for 10 cards.

What failed / friction:
- First click on sort header used a stale ref; re-snapshot and retry worked.
- Full snapshots are ~900 lines; parsing must be done in code, not by reading the output.
- Card-to-field pairing from the snapshot is error-prone (publication vs deadline month blocks); some fields (reference, deadline year) were not reliably captured.

Blockers: none (no login, CAPTCHA, or rate limit seen).
Time: short session, single tab.
