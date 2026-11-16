# Experience: Algiers hotels review search

## What worked
- Review search box ("Rechercher dans les avis") is very effective for finding family-related reviews. Type a keyword and press Enter.
- Keywords "famille", "enfant", "bébé", "pas pour" all returned relevant results.
- Review snippets are visible in the list view without expanding each review.
- The "Affichage des résultats pour X" message confirms the search worked.

## What did not work
- Scrolling review list does not load more reviews (virtualized list, same as Oran).
- Review text is truncated with "…" in list view. Full text requires clicking "Voir plus" per review.
- Some searches return owner responses mixed with reviews.

## Key findings
- Sofitel Algiers Hamma Garden: Most explicit "not suitable for families" review: "cet hôtel n'est pas du tout adapté pour un séjour en famille avec enfants, piscine beaucoup trop froide."
- Hôtel Marriott Algiers: Multiple family-unfriendly reviews: no baby beds, pool forbidden for children, asking for family record book.
- Hotel Best Night: Family room issues, reservation cancelled, family stranded.
- City Hotel Algiers: Hotel cancelled booking, left family stranded with luggage.
- Hyatt Regency: Family with children couldn't enjoy terrace (alcohol consumption), family with young children left without room.
- Residence Inn: Family with 3 children, room not ready, no sheets/pillows for children.

## Time taken
- About 40 browser calls across 6 hotels.
- No waiting needed beyond normal call latency.
