# Playwright Batch Script for Hotel Review Checking

## Purpose
This script automates the process of searching Google Maps for hotels in a given city and checking their reviews for family-related keywords. It runs faster than the MCP-based crawler because it uses parallel browser contexts.

## Requirements
- Node.js 18+
- Playwright: `npm install playwright`
- Chromium browser: `npx playwright install chromium`

## Usage
```bash
# Basic usage (defaults to Algiers, keywords: famille,enfant,bébé,pas pour)
node crawl_hotels_reviews.js

# Specify city
node crawl_hotels_reviews.js "Oran"

# Specify city and keywords
node crawl_hotels_reviews.js "Algiers" "famille,enfant,bébé,pas pour,not for families"

# Specify city, keywords, and max hotels
node crawl_hotels_reviews.js "Algiers" "famille,enfant" 15
```

## Configuration
Edit the script to change:
- `CONCURRENCY` (default: 3) - number of parallel browser contexts
- `MAX_HOTELS` (default: 10) - maximum hotels to check
- `OUTPUT_FILE` - output filename

## Output
Results are saved to `hotel_reviews_<city>.json` with this structure:
```json
{
  "city": "Algiers",
  "keywords": ["famille", "enfant", "bébé", "pas pour"],
  "collected_at": "2026-11-03T...",
  "hotels_checked": 6,
  "results": [
    {
      "hotel": "Sofitel Algiers Hamma Garden",
      "url": "https://www.google.com/maps/place/...",
      "reviews": [
        {
          "keyword": "famille",
          "rating": "1/5",
          "snippet": "..."
        }
      ]
    }
  ]
}
```

## Notes
- This script is meant to be run by the USER, not by the crawler agent.
- The crawler agent uses browser MCP tools only (one tab, one page at a time).
- This script can run faster because it uses parallel browser contexts.
- Respect Google's robots.txt and terms of service when running.
- Do not run too aggressively - pace with reasonable delays.
