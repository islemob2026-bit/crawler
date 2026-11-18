# ClippingProject — Implementation Plan

Status: **Draft v1**
Owner: —
Last updated: 2026-11-18

---

## 1. Objective

Build an automated pipeline that turns long-form video into short vertical clips and publishes them to **TikTok** and **YouTube Shorts**, orchestrated by the self-hosted n8n instance in `n8n/`.

Success means: a new source video dropped into a folder results in scheduled, correctly formatted clips published to both platforms, with per-clip records that let us measure performance and retry failures.

## 2. Scope

### In scope

- Ingest of source video (local file drop first, URL later).
- Transcription and highlight selection.
- Vertical 9:16 rendering, ≤ 180 s per clip.
- Caption/title/hashtag generation per platform.
- Publishing to YouTube Shorts and TikTok.
- Run logging, error capture, and a simple performance snapshot.
- All orchestration inside n8n; no external SaaS beyond the publishing layer.

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
2. n8n's own encryption key lives in `n8n/.env`. Losing it makes stored credentials unreadable.
3. The machine has no Python installed in the container, so n8n's Python task runner is unavailable. Use the JavaScript runner or external commands via the Execute Command node.

## 4. Pipeline overview

```
                ┌──────────────┐
   source.mp4   │  1. INGEST   │  /files/inbox/
  ────────────► │              │
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │ 2. TRANSCRIBE│  whisper (local) or hosted API
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │ 3. SELECT    │  transcript scoring → clip ranges
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │ 4. RENDER    │  ffmpeg → 1080×1920, ≤180 s
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │ 5. METADATA  │  title, caption, hashtags, cover
                └──────┬───────┘
                       ▼
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌───────────────┐             ┌───────────────┐
│ 6a. YOUTUBE   │             │ 6b. TIKTOK    │
│ native node   │             │ aggregator    │
└───────┬───────┘             └───────┬───────┘
        └──────────────┬──────────────┘
                       ▼
                ┌──────────────┐
                │ 7. LOG       │  SQLite/Postgres + JSON sidecar
                └──────────────┘
```

## 5. Stage specifications

### 5.1 Ingest

- Trigger options, in order of preference:
  1. **Schedule Trigger** (every 15 min) that scans `/files/inbox/` for `*.mp4`.
  2. **Manual Trigger** for testing.
  3. Later: webhook from an upload form.
- Move processed files to `/files/processing/` immediately to make the job idempotent.
- Reject files that already have a row in the job table (key: filename + size + mtime hash).
- Validate: container/codec readable, duration > 60 s, at least 720p.

**Acceptance:** a dropped file appears exactly once in the job table, and a duplicate drop is ignored.

### 5.2 Transcribe

- Preferred: Whisper locally via `whisper.cpp` or `faster-whisper` if we can run it on the host; fall back to a hosted transcription API.
- Output: word-level or segment-level timestamps in JSON, stored at `/files/work/<job>/transcript.json`.
- Language detection is required; store the detected language with the job.
- Cache aggressively: transcription is the slowest and most expensive step.

**Acceptance:** transcript JSON validates, contains timestamps, and is reused on re-runs.

### 5.3 Clip selection

Inputs: transcript segments + optional audio energy and scene-change data.

Scoring heuristics, combined:

| Signal | Weight | Notes |
| --- | --- | --- |
| Self-contained segment (hook + payoff) | 0.35 | Prefer sentences that stand alone |
| Question / number / contrast opening | 0.20 | Hooks perform better |
| Audio energy / laughter / emphasis | 0.15 | Needs ffmpeg loudness analysis |
| Segment length 20–60 s | 0.15 | Sweet spot for Shorts/TikTok |
| Keyword match against topic list | 0.15 | Per-project keyword file |

Rules:

- Clip must be **≤ 180 s** (hard cap for Shorts; TikTok allows longer but we standardize).
- Prefer 25–60 s.
- No overlapping clips.
- Snap boundaries to sentence edges to avoid mid-word cuts.
- Produce 3–10 candidates per source video, ranked.

**Acceptance:** for a 20-minute test video, we get ≥ 5 non-overlapping candidates that a human reviewer marks as "usable" at least 60% of the time.

### 5.4 Render

Canonical output:

- Container: MP4, H.264, AAC.
- Resolution: **1080×1920**, SAR 1:1.
- Frame rate: source rate, capped at 30 fps.
- Duration: ≤ 180 s.
- Faststart enabled for streaming.

Reference command (center-crop 16:9 → 9:16):

```bash
ffmpeg -y -ss <START> -t <DURATION> -i /files/inbox/source.mp4 \
  -vf "crop=ih*9/16:ih,scale=1080:1920,setsar=1,fps=30" \
  -c:v libx264 -preset medium -crf 20 -profile:v high -level 4.1 \
  -c:a aac -b:a 128k -ar 48000 \
  -movflags +faststart \
  /files/work/<job>/clip-<n>.mp4
```

Optional burn-in subtitles: render an `.ass` file from the transcript and append `subtitles=...` to the filter chain.

**Acceptance:** every clip passes `ffprobe` checks for codec, resolution, duration, and has no audio/video desync.

### 5.5 Metadata

Per clip, produce:

- `title` (≤ 90 chars for TikTok, ≤ 100 for YouTube)
- `caption` / `description` (≤ 2200 chars for TikTok, ≤ 5000 bytes for YouTube)
- `hashtags` (5–8, platform-appropriate)
- `cover_frame_ms` (TikTok allows choosing a cover frame)
- `language`
- `visibility` decision (`public` by default)
- `is_aigc` flag if any synthetic voice/imagery is used — legally required on TikTok

Store as `metadata.json` next to the clip. Validate lengths before publishing; a rejected publish wastes a quota unit.

**Acceptance:** zero publish attempts fail validation on length or required fields.

### 5.6 Publishing

Two independent paths, decoupled so one platform's outage does not block the other.

#### 6a. YouTube (native)

- n8n **YouTube node** → Resource `Video`, Operation `Upload`.
- Credential: `YouTube OAuth2 API`.
- Fields: Title, Category, Privacy, Tags, Description, `Input Binary Field = data`.
- Shorts is **not a flag** — a vertical/square video ≤ 3 min is classified as a Short automatically.
- Upload cost: **1,600 quota units**; default daily quota **10,000** → roughly **6 uploads/day**.
- OAuth app in *Testing* mode issues refresh tokens that expire after **7 days** → publish the app (or use an Internal/Workspace app) for anything long-running.

#### 6b. TikTok (no native node)

Three routes, choose one:

| Route | Setup cost | Time to first public post | Control |
| --- | --- | --- | --- |
| Official Content Posting API | High | Days–weeks (audit) | Full |
| Community node | Medium | Days–weeks (still needs an audited app) | Medium |
| Paid aggregator | Low ($10–149/mo) | Minutes | Medium |

**Official API facts to design around:**

- Scopes: `video.publish` (direct post) and `video.upload` (send to inbox/draft).
- Direct Post requires an approved app; **unaudited clients can only publish privately** (`unaudited_client_can_only_post_to_private_accounts`).
- Sequence: `creator_info/query` → `video/init` → `PUT` binary to `upload_url` → `status/fetch`.
- `upload_url` is valid for **1 hour**.
- Rate limit: **6 requests/minute per user token**, plus a daily post cap.
- `PULL_FROM_URL` requires domain/URL-prefix ownership verification; `FILE_UPLOAD` avoids that but requires chunked `Content-Range` uploads.
- `privacy_level` must match one of the values returned by `creator_info/query`.
- Required: `brand_content_toggle`, `brand_organic_toggle`; set `is_aigc: true` for synthetic content.

**Aggregator option (recommended for v1):**

- The vendor holds the audited TikTok app; we connect the account once and pay.
- **Upload-Post** — cheapest viable, official n8n node, accepts binary multipart from n8n, $24/mo (or $16/mo annual), 5 profiles, unlimited uploads, TikTok on paid plans only. Caps: 15 TikTok posts/account/24 h, 6/min.
- **Ayrshare** — most established, per-profile billing, ~$149/mo entry, accepts media URLs, exposes `youTubeOptions.shorts`.
- **Blotato** — ~$29/mo, n8n-oriented.
- **Post for Me** — ~$10/mo entry.

**Decision for v1:** use **Upload-Post** for TikTok, native node for YouTube. Revisit the official API only if volume or cost justifies it.

**Acceptance:** a clip published through both paths yields two platform post IDs and two permalinks in the job record.

### 5.7 Tracking

- Job table: `id, source_file, created_at, status, clip_count, error`.
- Clip table: `id, job_id, path, start, end, title, youtube_id, tiktok_id, published_at, status`.
- Store in n8n's database for now; move to Postgres when the volume grows.
- Daily job: pull basic metrics (views/likes) for published IDs and append a snapshot row.
- Failure handling: retry with exponential backoff (3 attempts), then mark `failed` and alert.

## 6. n8n workflow inventory

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `clip-ingest` | Schedule 15 min | Scan inbox, register jobs |
| `clip-transcribe` | Execute Workflow | Transcription + caching |
| `clip-select` | Execute Workflow | Candidate scoring + review gate |
| `clip-render` | Execute Workflow | ffmpeg render + ffprobe validation |
| `publish-youtube` | Execute Workflow | Native YouTube upload |
| `publish-tiktok` | Execute Workflow | Upload-Post HTTP call |
| `publish-orchestrator` | Execute Workflow | Fan-out, join, record results |
| `metrics-snapshot` | Schedule daily | Pull metrics, append snapshots |

Keep each workflow single-purpose. Shared logic belongs in sub-workflows, not copy-paste.

## 7. Repository layout

```
ClippingProject/
├─ PLAN.md                 ← this document
├─ workflows/              ← exported n8n JSON (version-controlled)
├─ prompts/                ← selection + metadata prompts
├─ scripts/                ← ffmpeg / ffprobe helpers
└─ samples/                ← small test clips (git-ignored if large)
```

Media itself stays outside git and outside the repo where possible, mounted into the container at `/files`.

## 8. Secrets and configuration

| Secret | Where | Notes |
| --- | --- | --- |
| `N8N_ENCRYPTION_KEY` | `n8n/.env` | Never rotate after credentials exist |
| YouTube OAuth client | n8n credential store | Client ID + secret |
| Upload-Post API key | n8n credential (Header Auth) | `Authorization: Apikey …` |
| LLM API key (optional) | n8n credential store | For metadata generation |

Rules:

- `.env` and credential exports never enter git.
- Workflow JSON may be committed, but scrub credential references before committing.
- Rotate any key that appears in a screenshot or chat log.

## 9. Cost model

Approximate monthly, assuming 1 source video/week → 5 clips → 20 clips/month:

| Item | Cost |
| --- | --- |
| Hosting | $0 (local machine) |
| Upload-Post Basic | $16–24 |
| Transcription (if hosted) | $5–20 depending on volume |
| LLM metadata (optional) | $2–10 |
| **Total** | **~$25–55/mo** |

YouTube's API is free but quota-bound (≈6 uploads/day). TikTok direct API is free but gated by audit.

## 10. Limits and failure modes

| Failure | Symptom | Handling |
| --- | --- | --- |
| YouTube quota exhausted | HTTP 403 `quotaExceeded` | Queue to next day; log |
| YouTube token expired (testing app) | 401 on refresh | Re-auth; fix by publishing app |
| TikTok cap reached | 429 / `spam_risk_too_many_posts` | Back off; reschedule |
| TikTok unaudited app | `unaudited_client_can_only_post_to_private_accounts` | Use aggregator or complete audit |
| Upload URL expired | PUT fails after 1 h | Re-init the post |
| ffmpeg failure | non-zero exit | Keep source, mark clip failed |
| Duplicate publish | same file published twice | Idempotency key per clip + platform |
| Docker not running | trigger never fires | Health check + alert |

## 11. Compliance and risk

- Only publish content we have the rights to clip and redistribute.
- Respect platform rules on repetitive/low-quality content; bulk identical uploads get throttled or banned.
- Label AI-generated or AI-altered content (`is_aigc`) where required.
- Respect TikTok's UX rules: the publishing app must show creator info and honor the account's privacy options.
- Aggregators are legitimate delegated clients, not a bypass of platform policy; our account is still the one at risk.
- Keep a manual-approval gate before the first N publishes to avoid automating a mistake.

## 12. Milestones

### M0 — Environment (done)

- [x] Docker Desktop installed and running
- [x] n8n container healthy at `localhost:5678`
- [x] Persistent volume `n8n_data`
- [x] Media mount `/files`
- [ ] Owner account created in n8n UI
- [ ] `n8n/files/inbox`, `processing`, `work`, `out` created

### M1 — Manual end-to-end (1 week)

- [ ] Google Cloud project + YouTube Data API v3 enabled
- [ ] OAuth client with redirect `http://localhost:5678/rest/oauth2-credential/callback`
- [ ] YouTube credential connected in n8n
- [ ] Manual workflow: read clip → upload to YouTube as unlisted
- [ ] Upload-Post account + TikTok connected
- [ ] Manual workflow: upload same clip to TikTok as private
- [ ] **Acceptance:** one clip live on both platforms, IDs recorded

### M2 — Automated clipping (2 weeks)

- [ ] Transcription workflow with cache
- [ ] Selection heuristics + review gate
- [ ] ffmpeg render + ffprobe validation
- [ ] Metadata generation + validation
- [ ] **Acceptance:** 5 usable clips from one 20-min source, no manual editing

### M3 — Automated publishing (1 week)

- [ ] Orchestrator with fan-out/join
- [ ] Idempotency keys, retries, failure table
- [ ] Schedule: publish 1–2 clips/day per platform
- [ ] **Acceptance:** 7 consecutive days without manual intervention

### M4 — Measurement (ongoing)

- [ ] Daily metrics snapshot
- [ ] Weekly summary
- [ ] Prune underperforming selection heuristics based on data

## 13. Open questions

1. Source material: whose videos, and do we hold redistribution rights?
2. Target volume: clips per week and accounts per platform?
3. Is a human review step required before publishing, permanently or just for launch?
4. Local transcription vs hosted — depends on host CPU/GPU budget.
5. Do we need multiple TikTok accounts (profiles) from day one? This drives the aggregator tier.
6. Language(s) of output and whether captions are burned in or uploaded as tracks.

## 14. Appendix — reference calls

**YouTube upload (n8n node equivalents):** `videos.insert`, `part=snippet,status`, resumable upload, `privacyStatus` in `{public, unlisted, private}`.

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
