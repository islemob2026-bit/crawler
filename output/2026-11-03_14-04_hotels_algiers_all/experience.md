# Experience: Algiers hotels collection

## What worked
- Google Maps place pages expose all needed fields: name (h1), rating/reviews in main text, hotel class ("Hôtel X étoiles"), address (button aria-label Adresse), website (link aria-label Site Web), phone (button aria-label Numéro de téléphone), picture (first photo img).
- MCP browser (headed) could load place pages reliably; headless Playwright timed out.
- Batching 4 hotels per run_code call with a local HTTP save server avoided manual JSON copying and truncation.

## What did not work
- Headless Playwright (node) could not reach Google Maps (connection timeouts).
- Scrolling the search feed only yielded 9 results in later attempts; but the initial extraction captured 47 links.

## Key findings
- 46 unique hotels collected.
- All have contact info (address/phone) and most have websites.
- Picture URLs are Google user-content images.

## Time taken
- ~45 minutes including discovery and batched extraction.