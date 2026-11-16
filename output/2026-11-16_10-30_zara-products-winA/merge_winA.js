// Merge raw per-page JSON from the playwright_a Zara crawl into one deduplicated array.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "raw");
const all = [];
const seen = new Set();
let dup = 0;
const counts = {};
for (const f of fs.readdirSync(dir).sort()) {
  const arr = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8").replace(/^\uFEFF/, ""));
  counts[f] = arr.length;
  for (const p of arr) {
    if (seen.has(p.url)) { dup++; continue; }
    seen.add(p.url);
    all.push({
      ...p,
      price_text: p.price_text ? p.price_text.replace(/[\s\u00a0\u202f]+/g, " ").trim() : null,
    });
  }
}
fs.writeFileSync(path.join(__dirname, "zara_products_winA.json"), JSON.stringify(all, null, 2), "utf8");
console.log(JSON.stringify({ total: all.length, duplicatesRemoved: dup, rawFileCounts: counts }, null, 1));
