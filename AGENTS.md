# Crawler agent rules

## Persistence rule
Do not stop until you find a method that achieves the requested result.

- If a step fails or returns incomplete data, try another legitimate method before reporting. Examples: a different selector or text read from the snapshot, scrolling or waiting longer, using the site's visible search, filter, sort, or pagination, following another visible link to the same data, or reloading once.
- Log each attempt and its result in the session `session.md`. Record the method that finally worked in `experience.md`.
- Keep the persistence rule within the limits below. Never bypass logins, CAPTCHAs, paywalls, rate limits, or access controls. Never call APIs, GraphQL, or hidden JSON endpoints.
- Stop and report only when:
  - the site's robots.txt or terms disallow the access,
  - a blocker appears that cannot be legitimately passed (login, CAPTCHA, paywall, access control),
  - errors repeat (403, 429, 5xx) after backing off, or
  - all reasonable legitimate alternatives have been tried and failed. Then list what was tried and what remains.
- Ask the user for confirmation before proceeding when a blocker appears, non-browser access is needed, or an instruction is ambiguous. Do not bypass, work around, or fetch data without explicit user permission.

## Crawling rules (summary)
- One site, one tab, one page at a time. Pace actions with varied waits of about 2 to 6 seconds.
- Process one site at a time. Never run parallel crawls.
- Read only from rendered pages through the browser (Playwright MCP tools). No APIs, GraphQL, or hidden JSON endpoints.
- Save each session in `output/<date>_<time>_<label>/` with `session.md`, output file(s), `experience.md`, and `instructions.md`.

## Repetitive-process rule
- When the crawler detects a repetitive process (many similar pages, large pagination, repeated extraction), it must not click through every page manually when a script is more efficient.
- First use Playwright MCP browser tools to discover and verify the working approach: selectors, navigation, pagination, waits. Record what works in `experience.md`.
- Then generate a Playwright script (`.js`) in the session output folder (or `output/playwright_batch_script/`) that implements that verified approach, with reasonable delays, robots.txt respect, and progress logging.
- Run only the script it just generated, via shell, to perform the bulk collection. Never run untrusted or arbitrary scripts.
- If the script fails or is blocked, fall back to the MCP browser tools and report.
