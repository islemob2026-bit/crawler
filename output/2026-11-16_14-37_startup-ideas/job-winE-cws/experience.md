# Experience: Chrome Web Store

- Check robots.txt first. For this site, `/detail/*/reviews` and `/search` are disallowed, so the review-based method cannot be used within robots.txt.
- Homepage loads fine in playwright_e with no access block.
- Not tried: category pages, detail pages (not reviews). These do not carry the review text, so they were not used.
- Next step if the user wants to continue: ask whether to use a different source for the same signal, or accept the robots restriction.
