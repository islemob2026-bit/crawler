# ClippingProject — Implementation Plan

Status: **Draft v3 — campaigns risk-adjusted**
Owner: —
Last updated: 2026-11-18

---

## 1. Objective

Build an automated pipeline that turns long-form video into short vertical clips and publishes them to **TikTok** and **YouTube Shorts**, orchestrated by the self-hosted n8n instance in `n8n/`.

Success means three things, not one:

1. A source video dropped into a folder produces correctly formatted, platform-ready clips.
2. The clips publish reliably to both platforms without manual work.
3. **Every clip carries a cost and a revenue figure, so the project is run as a business with a break-even point, not as a hobby.**

## 2. Scope

### In scope

- Ingest of source video (local file drop first, URL later).
- Transcription and highlight selection.
- Vertical 9:16 rendering, 61–90 s (see §5.3 for why not shorter).
- Caption/title/hashtag generation per platform.
- Publishing to YouTube Shorts and TikTok.
- Per-clip cost accounting and a monthly profit report.
- Run logging, error capture, and a performance snapshot.

### Out of scope (for v1)

- Instagram Reels, X, LinkedIn.
- Automatic deletion or re-editing of published posts.
- Paid ads / boosting.
- Multi-tenant publishing on behalf of third parties.
- AI video generation (we clip existing footage only).

## 3. Current environment

| Item | Value |
| --- | --- |
| Orchestrator | n8n `2.48.4`, Docker, container `n8n` |
| URL | <http://localhost:5678> |
| Compose file | `n8n/docker-compose.yml` |
| Data volume | `n8n_data` → `/home/node/.n8n` |
| Media mount | `n8n/files` → `/files` (host path inside repo) |
| Network | pinned `172.30.0.0/24` (daemon pool was exhausted) |
| Restart policy | `unless-stopped` |

The media mount is the contract for this project: **every stage reads and writes under `/files`**, so nothing depends on the container filesystem surviving.

### Known environment constraints

1. Docker Desktop must be running; it does not auto-start after a reboot on this machine.
2. n8n's encryption key lives in `n8n/.env`. Losing it makes stored credentials unreadable.
3. The container has no Python, so n8n's Python task runner is unavailable. Use the JavaScript runner or `Execute Command`.
4. Local rendering means compute is "free" at the margin but bounded by the host. Assume one render at a time.

## 4. Pipeline overview

```
                ┌──────────────┐
   source.mp4   │  1. INGEST   │  /files/inbox/
  ────────────► │              │
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │ 2. TRANSCRIBE│  local whisper or hosted API
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │ 3. SELECT    │  transcript scoring → candidates
                └──────┬───────┘
                       │  ┌───────────────────────────┐
                       │  │ economics feedback loop    │
                       │  │ (best-performing hooks     │
                       │  │  raise future scores)      │
                       │  └────────────▲──────────────┘
                       ▼               │
                ┌──────────────┐       │
                │ 4. RENDER    │  61–90 s, 1080×1920
                └──────┬───────┘       │
                       ▼               │
                ┌──────────────┐       │
                │ 5. METADATA  │  title, caption, tags, cover
                └──────┬───────┘       │
                       ▼               │
        ┌──────────────┴──────────────┐│
        ▼                             ▼│
┌───────────────┐             ┌───────────────┐
│ 6a. YOUTUBE   │             │ 6b. TIKTOK    │
│ native node   │             │ aggregator    │
└───────┬───────┘             └───────┬───────┘
        └──────────────┬──────────────┘
                       ▼
                ┌──────────────┐
                │ 7. LOG       │  job + clip + spend rows
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │ 8. ECONOMICS │  cost/1k views vs revenue/1k
                └──────────────┘  → feeds stage 3 and monthly report
```

Stage 8 is the addition that makes this a business plan rather than a publishing script: it closes the loop between what a clip costs and what it earns, and feeds that back into selection.

## 5. Stage specifications

### 5.1 Ingest

- Trigger options, in order of preference:
  1. **Schedule Trigger** (every 15 min) scanning `/files/inbox/` for `*.mp4`.
  2. **Manual Trigger** for testing.
  3. Later: webhook from an upload form.
- Move processed files to `/files/processing/` immediately to make the job idempotent.
- Reject files already in the job table (key: filename + size + mtime hash).
- Validate: container/codec readable, duration > 60 s, at least 720p.

**Acceptance:** a dropped file appears exactly once in the job table; a duplicate drop is ignored.

### 5.2 Transcribe

- Preferred: Whisper locally via `whisper.cpp` or `faster-whisper` on the host; fall back to a hosted API.
- Output: segment-level timestamps in JSON at `/files/work/<job>/transcript.json`.
- Store detected language with the job.
- Cache aggressively — transcription is the slowest and most expensive step.

**Acceptance:** transcript JSON validates, contains timestamps, and is reused on re-runs.

### 5.3 Clip selection

**Design change driven by economics:** target **61–90 seconds**, not 25–60 s.

Reason: TikTok's Creator Rewards Program pays only on videos **longer than one minute**. A 45-second clip can never earn there, no matter its views. YouTube Shorts accepts up to 3 minutes, so 61–90 s is monetizable on TikTok and still a Short on YouTube.

Scoring heuristics, combined:

| Signal | Weight | Notes |
| --- | --- | --- |
| Self-contained segment (hook + payoff) | 0.30 | Prefer sentences that stand alone |
| Question / number / contrast opening | 0.20 | Hooks drive retention |
| Audio energy / laughter / emphasis | 0.15 | Requires ffmpeg loudness analysis |
| Length 61–90 s | 0.20 | Monetization + retention window |
| Keyword match against topic list | 0.15 | Per-project keyword file |

Rules:

- Hard cap **180 s** (Shorts limit); preferred 61–90 s.
- No overlapping clips.
- Snap boundaries to sentence edges.
- Produce 4–10 candidates per source, ranked.
- Feed back: hooks that earned above median in stage 8 get their pattern weights raised.

**Acceptance:** for a 20-minute test video, ≥ 5 non-overlapping candidates, of which a human marks ≥ 60% usable.

### 5.4 Render

Canonical output:

- MP4, H.264, AAC.
- **1080×1920**, SAR 1:1.
- Frame rate: source rate, capped at 30 fps.
- Duration: 61–180 s (target 75 s).
- Faststart enabled.

Reference command (center-crop 16:9 → 9:16):

```bash
ffmpeg -y -ss <START> -t <DURATION> -i /files/inbox/source.mp4 \
  -vf "crop=ih*9/16:ih,scale=1080:1920,setsar=1,fps=30" \
  -c:v libx264 -preset medium -crf 20 -profile:v high -level 4.1 \
  -c:a aac -b:a 128k -ar 48000 \
  -movflags +faststart \
  /files/work/<job>/clip-<n>.mp4
```

Optional burned-in subtitles: render an `.ass` from the transcript and append `subtitles=...` to the filter chain.

**Acceptance:** every clip passes `ffprobe` checks for codec, resolution, duration, and has no A/V desync.

### 5.5 Metadata

Per clip, produce:

- `title` (≤ 90 chars TikTok, ≤ 100 YouTube)
- `caption` / `description` (≤ 2200 chars TikTok, ≤ 5000 bytes YouTube)
- `hashtags` (5–8)
- `cover_frame_ms`
- `language`
- `visibility` decision
- `is_aigc` flag if any synthetic voice/imagery is used — required by TikTok

Store as `metadata.json` beside the clip. Validate lengths before publishing; a rejected publish wastes quota or a daily cap slot.

**Acceptance:** zero publish attempts fail on length or required fields.

### 5.6 Publishing

Two independent paths, decoupled so one platform's outage does not block the other.

#### 6a. YouTube (native)

- n8n **YouTube node** → Resource `Video`, Operation `Upload`.
- Credential: `YouTube OAuth2 API`.
- Fields: Title, Category, Privacy, Tags, Description, `Input Binary Field = data`.
- Shorts is **not a flag** — a vertical/square video ≤ 3 min is classified as a Short automatically.
- Cost: **1,600 quota units** per upload; default daily quota **10,000** → ~**6 uploads/day**.
- OAuth app in *Testing* mode issues refresh tokens that expire after **7 days**; publish the app or use an internal/Workspace app for long-running automation.

#### 6b. TikTok (no native node)

| Route | Setup cost | Time to first public post | Control |
| --- | --- | --- | --- |
| Official Content Posting API | High | Days–weeks (audit) | Full |
| Community node | Medium | Days–weeks (still needs an audited app) | Medium |
| Paid aggregator | Low ($10–149/mo) | Minutes | Medium |

**Official API facts to design around:**

- Scopes: `video.publish` (direct post) and `video.upload` (inbox/draft).
- Unaudited clients can only publish **privately** (`unaudited_client_can_only_post_to_private_accounts`).
- Sequence: `creator_info/query` → `video/init` → `PUT` binary to `upload_url` → `status/fetch`.
- `upload_url` valid **1 hour**; rate limit **6 requests/min per user token**; daily post cap.
- `PULL_FROM_URL` requires domain verification; `FILE_UPLOAD` requires chunked `Content-Range`.
- `privacy_level` must match `creator_info/query` output.
- Required: `brand_content_toggle`, `brand_organic_toggle`; `is_aigc: true` for synthetic content.

**Decision for v1:** **Upload-Post** for TikTok ($24/mo monthly, $16/mo annual), native node for YouTube. Revisit the official API only if spend exceeds ~20% of revenue.

### 5.7 Tracking

- `job`: `id, source_file, created_at, status, clip_count, error, transcription_cost`
- `clip`: `id, job_id, path, start, end, title, youtube_id, tiktok_id, published_at, status`
- `spend`: `id, month, item, amount, note`
- `metrics`: `id, clip_id, platform, captured_on, views, likes, comments`
- `revenue`: `id, clip_id, platform, source, amount, eligible_views`

Failure handling: 3 retries with exponential backoff, then `failed` + alert.

### 5.8 Economics (new)

Runs monthly and per clip:

1. Aggregate spend from `spend` and per-clip variable costs.
2. Aggregate revenue from `revenue` (Creator Rewards, campaigns, affiliate, fixed deals).
3. Compute `cost_per_1k_views` and `revenue_per_1k_views` per platform.
4. Write a row to `economics_monthly` and emit a report.
5. Flag in red when `revenue_per_1k_views < cost_per_1k_views` for two consecutive months.
6. Feed the top-decile hooks back into stage 5.3.

**Acceptance:** every published clip has a cost figure within 24 h and a revenue figure once the platform reports it.

## 6. Cost model

All figures are planning estimates in USD, excluding tax. Adjust the two bolded inputs first if reality differs.

### 6.1 Assumptions

| Assumption | Value | Source / note |
| --- | --- | --- |
| Clips per source video | 6 | Plan target |
| Source videos per month | 4 | 1/week |
| **Clips per month** | **24** | 4 × 6 |
| Average clip length | 75 s | Monetizable on TikTok |
| Human review | 3 min/clip @ $20/h → **$1.00/clip** | Remove after quality stabilizes |
| Upload-Post Basic | **$24/mo** monthly billing | $16/mo if annual |
| Transcription | $0.006/min → $0.36 per 60-min video | Hosted Whisper; $0 if local |
| LLM (selection + metadata) | $0.50/video | Budget model |
| Electricity / compute | $3/mo | Local host |
| Storage | $0 | Local disk |
| n8n hosting | $0 | Local Docker |

### 6.2 Cost per clip

| Cost line | Monthly | Per clip (24 clips) |
| --- | --- | --- |
| Upload-Post subscription | $24.00 | $1.00 |
| Electricity / compute | $3.00 | $0.13 |
| Transcription (4 videos) | $1.44 | $0.06 |
| LLM (4 videos) | $2.00 | $0.08 |
| Human review (3 min/clip) | $24.00 | $1.00 |
| **Total** | **$54.44** | **$2.27** |

**Fully automated** (no human review): **$30.44/mo → $1.27/clip.**
**Marginal cash cost** of one more clip once subscription is paid: **~$0.14.**

### 6.3 Cost at different volumes

| Source videos/mo | Clips/mo | Total monthly cost | Cost per clip |
| --- | --- | --- | --- |
| 2 | 12 | $40.72 | $3.39 |
| 4 | 24 | $54.44 | $2.27 |
| 8 | 48 | $81.88 | $1.71 |
| 16 | 96 | $136.76 | $1.42 |

The subscription is fixed, so **cost per clip falls sharply with volume**. This is the main argument for batching rather than posting one clip at a time.

### 6.4 Cost per 1,000 views

At 24 clips/month:

| Total monthly views | Cost per 1k views |
| --- | --- |
| 50,000 | $1.09 |
| 120,000 | $0.45 |
| 240,000 | $0.23 |
| 600,000 | $0.09 |
| 1,200,000 | $0.05 |

This is the number to beat with revenue per 1k views.

## 7. Revenue model

### 7.1 Gate 0 — eligibility (check this first)

| Platform | Requirement | Reality for a new account |
| --- | --- | --- |
| TikTok Creator Rewards | 18+, 10k followers, 100k views/30 days, videos > 1 min, **8 eligible countries** (US, UK, DE, FR, JP, KR, BR, MX) | Achievable in 2–4 months; **impossible if you are outside those countries** |
| TikTok brand campaigns | Varies per campaign | Fastest realistic revenue line |
| YouTube Partner Program | 1,000 subs + **10M Shorts views/90 days** (or 4,000 watch hours) | Effectively unreachable short-term |
| YouTube Shorts revenue from **1 Feb 2027** | 10M qualified Shorts views in 90 days | Makes YouTube a **distribution** channel, not a revenue channel |

> **Decision:** model YouTube revenue at **$0** and treat it as audience acquisition. Run TikTok as the revenue engine.

### 7.2 Revenue per 1,000 views (2026 reported ranges)

| Line | Range | Planning value | Notes |
| --- | --- | --- | --- |
| TikTok Creator Rewards | $0.40–$1.00 / 1k **qualified** | **$0.25 / 1k total** | Only ~40% of views qualify; >1 min only |
| TikTok brand campaigns | $0.12–$0.97 / 1k effective | **$0.27 / 1k net** | Headline ~$1.00, 10% fee. Headline ≠ paid — see §7.4 |
| YouTube Shorts | $0.07–$0.20 / 1k; US ~$0.33 | **$0.00** | Gated by the 10M/90-day threshold |
| Affiliate / TikTok Shop | Commission-based | not modelled | Upside |
| Fixed brand deals | Per post | not modelled | Upside |

TikTok does not publish rates; all figures above are 2026 creator-reported estimates and should be replaced with your own dashboard numbers after month 3.

### 7.3 Blended revenue per 1,000 total views

Assumes a **70/30 TikTok/YouTube** view split.

| Mode | Calculation | Revenue per 1k total views |
| --- | --- | --- |
| Creator Rewards only | 0.70 × $0.25 + 0.30 × $0 | **$0.175** |
| With brand campaigns | 0.70 × $0.27 + 0.30 × $0 | **$0.189** |

At realistic effective rates, campaigns are worth **~8% more than Creator Rewards**, not a multiple. They are a second revenue line, not a rescue.

### 7.4 Are campaigns real? (due diligence)

**Yes, the market is real — but the advertised CPM is a ceiling, not a payout.**

Evidence from the 2026 campaign marketplace (Content Rewards, formerly Whop Content Rewards):

| Measure | Figure | Basis |
| --- | --- | --- |
| Scale | ~$40k/day paid out, ~1M videos/month, 500–700 live campaigns | Platform statements |
| Headline CPM | ~$1.00 per 1k views (median) | Campaign listings |
| Spend per new view, campaigns with volume | ~$1.02 per 1k | Independent scrape, Oct 2026 |
| **Paid out / advertised budget** | **14.5%** | Scrape of 658 campaigns, Sep 2026 |
| **Campaigns that paid $0** | **56%** | Same scrape |
| **Effective payout / headline CPM** | **median 0.12** (25th pct 0.04, 75th 0.28) | Same scrape |
| Budget concentration | Top 4 organisations = 52% of spend | Oct 2026 snapshot |

The same "$1 CPM" campaign can pay $0.03 or $0.97 per 1,000 views. That gap is mostly campaign selection, not luck.

**How to tell a real campaign from a scam**

| Green flags | Red flags |
| --- | --- |
| No cost to join | Asks for a deposit, subscription, or "verification fee" |
| Brand/organisation is identifiable and searchable | Anonymous brand, no site, no company |
| Page shows budget spent and paid-out history | Only a headline CPM, no spend data |
| Written brief, approval rules, per-clip max payout | Terms arrive after you post, or never |
| Platform holds the budget (escrow-style) | Pays by DM, crypto only, or "trust me" |
| Payout via a known processor with KYC | Asks for your TikTok login or 2FA code |
| 7-day earning window + hold, stated in writing | Promises "unlimited" or "$5/1k guaranteed" |
| Product not required to participate | Requires you to buy the product first |

**Non-scam risks that still cost money:** budget exhaustion mid-campaign, rejection after views accrue, bot-score flags that pause payouts, per-clip payout caps that kill a viral hit, and campaign niches (gambling, crypto, "get rich") that damage the account or breach local ad rules.

**Rule for this project:** only join campaigns where the page shows money already paid out, the effective rate is ≥ $0.25 per 1k, and entry is free. Any campaign asking for money up front is a scam, without exception.

## 8. Profit projection

### 8.1 Break-even

Monthly cost at 24 clips: **$54.44**.

| Revenue mode | Revenue per 1k views | Break-even total views/mo | Break-even views per clip |
| --- | --- | --- | --- |
| Creator Rewards only | $0.175 | **311,000** | ~13,000 |
| With brand campaigns | $0.189 | **288,000** | ~12,000 |

Read this as: *you need ~12–13k views per clip just to cover costs.* Campaigns move the line by about 8%, not by a multiple.

### 8.2 Monthly scenarios (24 clips)

| Scenario | Views/clip (both platforms) | Monthly views | Creator Rewards only | With campaigns |
| --- | --- | --- | --- | --- |
| Conservative | 2,000 | 48,000 | **−$46.04** | **−$45.37** |
| Base | 10,000 | 240,000 | **−$12.44** | **−$9.08** |
| Upside | 25,000 | 600,000 | **+$50.56** | **+$58.96** |
| Viral month | 50,000 | 1,200,000 | **+$155.56** | **+$172.36** |

Honest reading: **at realistic effective campaign rates the base case is roughly break-even to slightly negative.** Profitability needs ~12k views per clip, or a second revenue line (affiliate, fixed brand deals).

### 8.3 Sensitivity — net monthly profit

| Views per clip | Total views/mo | Creator Rewards only | With campaigns |
| --- | --- | --- | --- |
| 2,000 | 48,000 | −$46.04 | −$45.37 |
| 5,000 | 120,000 | −$33.44 | −$31.76 |
| 10,000 | 240,000 | −$12.44 | −$9.08 |
| 25,000 | 600,000 | +$50.56 | +$58.96 |
| 50,000 | 1,200,000 | +$155.56 | +$172.36 |

### 8.4 12-month ramp (planning model)

Assumptions: 24 clips/month; views climb from ~1k to ~46k per clip; Creator Rewards from month 3; campaigns from month 6 at the §7.4 planning rate; costs flat at $54.44.

| Month | Total views | Revenue | Cost | Net | Cumulative |
| --- | --- | --- | --- | --- | --- |
| 1 | 24,000 | $4.20 | $54.44 | −$50.24 | −$50.24 |
| 2 | 48,000 | $8.40 | $54.44 | −$46.04 | −$96.28 |
| 3 | 96,000 | $16.80 | $54.44 | −$37.64 | −$133.92 |
| 4 | 150,000 | $26.25 | $54.44 | −$28.19 | −$162.11 |
| 5 | 220,000 | $38.50 | $54.44 | −$15.94 | −$178.05 |
| 6 | 300,000 | $56.70 | $54.44 | +$2.26 | −$175.79 |
| 7 | 400,000 | $75.60 | $54.44 | +$21.16 | −$154.63 |
| 8 | 500,000 | $94.50 | $54.44 | +$40.06 | −$114.57 |
| 9 | 650,000 | $122.85 | $54.44 | +$68.41 | −$46.16 |
| 10 | 800,000 | $151.20 | $54.44 | +$96.76 | +$50.60 |
| 11 | 950,000 | $179.55 | $54.44 | +$125.11 | +$175.71 |
| 12 | 1,100,000 | $207.90 | $54.44 | +$153.46 | +$329.17 |

**Year 1: revenue ≈ $982, cost ≈ $653, net ≈ +$329.** Monthly break-even in **month 6**; cumulative break-even in **month 10**.

This is a thin margin: one missed month of campaign revenue pushes cumulative break-even past year one.

### 8.5 What must be true for the projection to hold

1. Campaign work starts by month 6 and sustains an effective ≥$0.25 per 1k — i.e. campaigns are chosen by paid-out history (§7.4), not by headline CPM.
2. Average views per clip reach ~12,000.
3. Costs stay flat — human review removed by month 4, otherwise add $24/mo.
4. The account is in a Creator Rewards-eligible country; if not, months 1–5 earn **$0** and the ramp starts at month 6.
5. No account strikes: a ban resets the follower base and the revenue to zero.
6. YouTube stays a distribution channel; any Shorts revenue is upside, not plan.

### 8.6 Kill / scale criteria

| Signal | Action |
| --- | --- |
| < 2,000 views/clip after 60 days | Change niche, hooks, or source material |
| Negative net for 3 consecutive months | Pause; re-cost before continuing |
| Campaign effective rate < $0.25/1k | Drop it; check paid-out history before the next one |
| Campaign budget already exhausted | Stop clipping; unpaid views may never settle |
| Any campaign asks for an upfront fee | Treat as scam; do not join |
| Cost per 1k views > revenue per 1k for 2 months | Re-negotiate tooling or automate review |
| Aggregator spend > 20% of revenue | Build the direct TikTok API path |

## 9. n8n workflow inventory

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `clip-ingest` | Schedule 15 min | Scan inbox, register jobs |
| `clip-transcribe` | Sub-workflow | Transcription + caching |
| `clip-select` | Sub-workflow | Candidate scoring + review gate |
| `clip-render` | Sub-workflow | ffmpeg render + ffprobe validation |
| `publish-youtube` | Sub-workflow | Native YouTube upload |
| `publish-tiktok` | Sub-workflow | Upload-Post HTTP call |
| `publish-orchestrator` | Sub-workflow | Fan-out, join, record results |
| `metrics-snapshot` | Schedule daily | Pull metrics, append snapshots |
| `economics-report` | Schedule monthly | Costs vs revenue, break-even, report |

Keep each workflow single-purpose. Shared logic lives in sub-workflows.

## 10. Repository layout

```
ClippingProject/
├─ PLAN.md                 ← this document
├─ workflows/              ← exported n8n JSON (version-controlled)
├─ prompts/                ← selection + metadata prompts
├─ scripts/                ← ffmpeg / ffprobe / cost helpers
├─ economics/              ← cost model, monthly reports, CSV exports
└─ samples/                ← small test clips (git-ignored if large)
```

Media stays outside git where possible, mounted into the container at `/files`.

## 11. Secrets and configuration

| Secret | Where | Notes |
| --- | --- | --- |
| `N8N_ENCRYPTION_KEY` | `n8n/.env` | Never rotate after credentials exist |
| YouTube OAuth client | n8n credential store | Client ID + secret |
| Upload-Post API key | n8n credential (Header Auth) | `Authorization: Apikey …` |
| LLM API key (optional) | n8n credential store | Metadata generation |

Rules: `.env` and credential exports never enter git; scrub credential references before committing workflow JSON; rotate any key that appears in a screenshot or chat log.

## 12. Limits and failure modes

| Failure | Symptom | Handling |
| --- | --- | --- |
| YouTube quota exhausted | 403 `quotaExceeded` | Queue to next day; log |
| YouTube token expired (testing app) | 401 on refresh | Re-auth; publish the app |
| TikTok cap reached | 429 / `spam_risk_too_many_posts` | Back off; reschedule |
| TikTok unaudited app | `unaudited_client_can_only_post_to_private_accounts` | Use aggregator or complete audit |
| Upload URL expired | PUT fails after 1 h | Re-init the post |
| ffmpeg failure | non-zero exit | Keep source, mark clip failed |
| Duplicate publish | same file twice | Idempotency key per clip + platform |
| Docker not running | trigger never fires | Health check + alert |
| Revenue below model | net < 0 for 2 months | Trigger §8.6 review |

## 13. Compliance and risk

- Only publish content we have the rights to clip and redistribute.
- Respect platform rules on repetitive/low-quality content; bulk identical uploads get throttled or banned.
- Label AI-generated or AI-altered content (`is_aigc`) where required.
- Respect TikTok's UX rules: the publishing app must show creator info and honour the account's privacy options.
- Aggregators are legitimate delegated clients, not a policy bypass; **our account is still the one at risk**.
- Keep a manual-approval gate for the first N publishes to avoid automating a mistake.
- Do not use VPNs to fake Creator Rewards eligibility — it violates the terms.

## 14. Milestones

### M0 — Environment (done)

- [x] Docker Desktop installed and running
- [x] n8n container healthy at `localhost:5678`
- [x] Persistent volume `n8n_data`
- [x] Media mount `/files`
- [ ] Owner account created in n8n UI
- [ ] `/files/{inbox,processing,work,out}` created

### M1 — Manual end-to-end (week 1)

- [ ] Google Cloud project + YouTube Data API v3
- [ ] OAuth client with redirect `http://localhost:5678/rest/oauth2-credential/callback`
- [ ] YouTube credential connected
- [ ] Manual workflow: read clip → upload to YouTube as unlisted
- [ ] Upload-Post account + TikTok connected
- [ ] Manual workflow: upload the same clip to TikTok as private
- [ ] **Acceptance:** one clip live on both platforms, IDs recorded

### M2 — Automated clipping (weeks 2–3)

- [ ] Transcription workflow with cache
- [ ] Selection heuristics targeting 61–90 s
- [ ] ffmpeg render + ffprobe validation
- [ ] Metadata generation + length validation
- [ ] **Acceptance:** 5 usable clips from one 20-min source, no manual editing

### M3 — Automated publishing (week 4)

- [ ] Orchestrator with fan-out/join
- [ ] Idempotency keys, retries, failure table
- [ ] 1–2 clips/day per platform
- [ ] **Acceptance:** 7 consecutive days without manual intervention

### M4 — Economics (week 5)

- [ ] `spend` / `revenue` tables populated
- [ ] `economics-report` workflow
- [ ] Baseline metrics recorded from real dashboards (replace §7.2 planning values)
- [ ] **Acceptance:** one report showing cost/1k, revenue/1k, and break-even status

### M5 — Optimisation (ongoing)

- [ ] Remove human review once quality holds
- [ ] Join TikTok brand campaigns
- [ ] Feed top-decile hooks into selection scoring
- [ ] Re-run break-even quarterly

## 15. Open questions

1. **Which country is the TikTok account registered in?** This decides whether Creator Rewards is available at all and reshapes §7–8.
2. Source material: whose videos, and do we hold redistribution rights?
3. Target volume: clips per week and accounts per platform?
4. Is human review required permanently, or only for launch?
5. Local transcription vs hosted — depends on host CPU/GPU budget.
6. Do we need multiple TikTok profiles from day one? This drives the aggregator tier.
7. Is campaign work (posting brand clips) acceptable, or do we only publish our own content? At realistic effective rates campaigns are only ~8% better than Creator Rewards, so this is a strategic choice rather than the main lever.

## 16. Appendix — reference calls

**YouTube upload:** `videos.insert`, `part=snippet,status`, resumable upload, `privacyStatus` ∈ `{public, unlisted, private}`.

**TikTok direct post:**

```
POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/
POST https://open.tiktokapis.com/v2/post/publish/video/init/
PUT  <upload_url>            Content-Range: bytes 0-<n>/<total>
POST https://open.tiktokapis.com/v2/post/publish/status/fetch/
```

**Upload-Post:**

```
POST https://api.upload-post.com/api/upload
Authorization: Apikey <key>
multipart/form-data: user, platform[], title, video
```

**ffprobe validation:**

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,width,height,r_frame_rate,duration \
  -of json clip.mp4
```

**Profit formula:**

```
net = Σ(qualified_views/1000 × RPM × platform_share)
      − (subscription + variable_costs + review_cost)
```
