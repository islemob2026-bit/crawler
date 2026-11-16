# TODO: physical store check (Algeria), MCP only

Rules: MCP browser only (no scripts, APIs, or hidden JSON). One site at a time. Log each step in session.md. Save playbook_<site>.md when a route works. Never bypass cert/login/CAPTCHA blocks; if blocked, mark BLOCKED and use search fallback only.

Status keys: CONFIRMED (browser), SEARCH (search only), PARTIAL, BLOCKED, TODO.

## Physical-store status
- [x] LC Waikiki: CONFIRMED (browser). 7 stores via corporate.lcwaikiki.com/en-US/Stores, country option 'Cezayir'. Playbook: add.
- [x] Europa Sport: CONFIRMED (browser). 12 cards on europasport.dz/boutiques.html. Playbook saved.
- [x] Slaychic: CONFIRMED (browser). Boutique Staouéli (www.slaychic.fr/boutique-staoueli/).
- [x] L'Escale Rose: CONFIRMED (browser). Bab Ezzouar, Alger (01 Sorecal, Cité Baha Amhamed).
- [x] Nomad Store: CONFIRMED (browser). Setif (about page 'Located in Setif', Store Location link). Boussekine address from earlier snippet.
- [x] Magasin Trend Sport: CONFIRMED (browser). Bir Touta, Alger 16045 (contact page).
- [~] Boutique Dentelle: PARTIAL. Oran shop ('NOTRE BOUTIQUE', Instagram dentelle.oran). No street address on page.
- [~] Gémo: PARTIAL (search). Oran AZ Mall Grand Oran opened June 2024. Alger and Mostaganem 'coming soon'. Browser check of gemo-algerie.com store list still TODO.
- [ ] Zara: CONFLICTING (search). zara.com store locator blocked by ERR_CERT_AUTHORITY_INVALID. Closures reported in articles. Next: Garden City and Bab Ezzouar mall tenant pages.
- [!] IBZONE (ibzondz.com): BLOCKED in browser (ERR_CERT_AUTHORITY_INVALID). Search only: Chéraga address and store phone 0770 07 21 57. Retry later or ask user.
- [x] Nike: SEARCH confirmed (nike.com directory: Bab Ezzouar; Garden City). Browser check TODO.
- [x] Kiabi: SEARCH confirmed (kiabi.dz/pages/magasins). Browser check TODO.
- [x] Tape à l'oeil: SEARCH confirmed (taokids.com/magasins/algerie, 3 stores). Browser check TODO.
- [x] Jacadi: SEARCH confirmed (jacadi.dz/jacadi-boutiques). Browser check TODO.
- [x] Okaïdi: SEARCH confirmed (9 stores, corporate.idkids.com). Browser check TODO.
- [x] Promod: SEARCH confirmed (promod.dz/contact, Garden City). Browser check TODO.
- [x] Mode Avenue: SEARCH confirmed (Chéraga store). Browser check TODO.
- [x] Le Nomade Fashion: SEARCH confirmed (Alger, Sétif, Oran). Browser check TODO (lenomadefashion.com.dz/magasin/).

## Not yet checked (TODO, in order)
- [ ] Vomoda (vomodadz.com): Alger address, hours. Contact page.
- [ ] Alza Mode (alza-mode.com): Tizi-Ouzou address. Contact page.
- [ ] Bouhaja (bouhaja.store): Réghaïa address (may be office).
- [ ] Boutique Eilish (boutiqueilish.store): Blida address.
- [ ] Women'Secret Dz (womensecret-dz.com): Mécheria, Naâma address.
- [ ] Tendance Paris (tendanceparis.store): 'Paris · Alger' boutique.
- [ ] Maison Dey (maison-dey.com): Alger boutique.
- [ ] Maison Sport (maisonsport.dz): store presence unknown.
- [ ] Next Algeria (nextdirect.com/dz): store presence unknown.
- [ ] Diesel Algeria (dz.diesel.com): store presence unknown.
- [ ] Ralph Lauren (ralphlauren.global/dz): store presence unknown.
- [ ] Adidas (adidas.com/us/algeria-buy): store presence unknown.
- [ ] Okami Streetwear (okami-streetwear.com): Algiers, store unknown.
- [ ] Byraad (byraad.com): store unknown.
- [ ] Saby Ange (sabyange.com): store unknown.
- [ ] Mazyoud (mazyoud.com): store unknown.
- [ ] Mine Store (mine-store-dz.com): store unknown.
- [ ] Mando Boutique DZ, Harf Seen, Sultana, Kaser, Celis, Lhayba: check only if a physical address appears.

## Browser checks for confirmed chains (TODO)
- [ ] Nike, Kiabi, Tape à l'oeil, Jacadi, Okaïdi, Promod, Mode Avenue, Le Nomade Fashion (see Physical-store status).

## Final step (TODO)
- [ ] Build final physical-store list (JSON + Markdown) in this folder: name, city, address, source URL, status, check date.
- [ ] Ask user to approve the list before any product crawl.
- [ ] Only then plan the product crawl (categories, first 3 pages each), with the playbook method.
