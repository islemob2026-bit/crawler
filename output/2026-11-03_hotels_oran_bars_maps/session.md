# Session: Google Maps hotels in Oran, bar mentions in reviews (2026-11-03)

**Status:** Stopped partway. Only the search-results step ran. No reviews were checked.

## Steps
1. robots.txt `https://www.google.com/robots.txt`: `/maps/search/` and `/maps/place/` allowed.
2. Google general terms: automated access is allowed only when robots.txt is respected. Maps-specific terms were not verified (the Maps terms page had no matching text).
3. Opened `https://www.google.com/maps/search/hotels+in+Oran/`.
4. Scrolled the results feed with PageDown/End keys, waiting 3-6 s between steps. The feed stayed at 5 results.

## Hotels found (5)
1. Le Méridien Hôtel & Convention Center (5 stars, 4.1 from 2,365 reviews): https://www.google.com/maps/place/Le+M%C3%A9ridien+H%C3%B4tel+%26+Convention+center/data=!4m10!3m9!1s0xd7e62baccc2bd33:0x4f243c20bf8254a8!5m2!4m1!1i2!8m2!3d35.726489!4d-0.591931!16s%2Fg%2F1tp09h6c!19sChIJM73CzLpifg0RqFSCvyA8JE8
2. Four Points by Sheraton Oran (4 stars, 3.9 from 2,843 reviews): https://www.google.com/maps/place/Four+Points+by+Sheraton+Oran/data=!4m10!3m9!1s0xd7e8822a4f7634b:0xb8f8e5d31fb1c56d!5m2!4m1!1i2!8m2!3d35.716781!4d-0.610165!16s%2Fm%2F0gkzpxf!19sChIJS2P3pCKIfg0RbcWxH9Pl-Lg
3. Colombe hotel Oran (3 stars, 4.4 from 640 reviews): https://www.google.com/maps/place/Colombe+hotel+Oran/data=!4m10!3m9!1s0xd7e885791194cfb:0xf1d573fe6d671ea7!5m2!4m1!1i2!8m2!3d35.6937079!4d-0.630017!16s%2Fg%2F1thby0dd!19sChIJ-0wZkVeIfg0Rpx5nbf5z1fE

(Only these 3 hotel place links were captured as URLs; the other 2 results in the 5-item list are ads ("Annonce") for Le Méridien and Four Points, not new hotels.)

## Errors / blockers
- Scrolling did not load more than 5 results after about 15 PageDown/End presses with waits. Search for "Fin des résultats" found nothing.
- No CAPTCHA, login wall, or HTTP errors seen.
- Review checks: not started.
