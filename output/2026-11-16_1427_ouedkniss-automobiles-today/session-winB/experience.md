# Experience (winB, ouedkniss automobiles today)
- robots.txt: 'User-agent: * Allow: /' -> allowed.
- Start URL /automobiles/ redirects to /automobiles_vehicules/1 (category hub). Path to car listings: tile '?????? ? ??????' -> subtile '??????' -> /automobiles-voitures/1.
- Keyboard zoom (Control+Minus x4) had no effect on screenshots in this MCP session; zoom-out not achieved. Scrolling via End/PageDown used instead.
- Date filter: none in '?????' drawer. Sort: '?????' -> '????? ?????' gives ?orderBy=CREATED_AT. Today = card relative time in seconds/minutes/hours (time line after city line). '???'/days = not today (stop).
- Cards: '.o-announ-card' excluding '.o-announ-card-reel'. Lazy-loaded: need End/PageDown scroll before extraction.
- Pagination: button[aria-label='?????? ???????'] (Next). Blocked by a Google vignette ad; closed via button.custom-close-btn (visible white ×).
- Extraction: browser_evaluate reading rendered DOM (no API). Standalone node script not used (would open a separate browser).
