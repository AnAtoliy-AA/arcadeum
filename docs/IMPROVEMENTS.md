# Arcadeum Games — Growth & Improvements Roadmap

> Last updated: September 2026 · Status: Living document

---

## TL;DR

Arcadeum Games has solid technical foundations (Stockfish 19, Syzygy tablebases, 18 games, no-signup play, 5-locale i18n) but ranks poorly in Google (20+) because of three root causes: **low domain authority**, **thin content depth**, and **weak community signals**. This document maps the gaps and proposes a concrete execution path — including what AI agents can automate end-to-end.

---

## 1. Platform Strengths to Protect

Before fixing problems, never break what already works:

1. **No-signup instant play** — the lowest friction entry in the market. Never gate behind accounts.
2. **Original IP games** — Critical, Sea Battle, Glimworm, Cat Dash exist nowhere else. Every hour spent on them builds a moat.
3. **Unified visual themes** — one theme system across all games is rare and valuable.
4. **Stockfish 19 + Syzygy 7-piece** — stronger analysis than most platforms offer for free.
5. **Multi-game breadth** — chess + backgammon + card games + original games on one platform.

---

## 2. Why We're on Google Position 20+

### 2.1 Root Cause Analysis

#### 🔴 Critical — Domain Authority Gap

The domain is young. Google treats new domains as unknown entities for 6–12 months ("sandbox effect"). Building authority requires time and a deliberate backlink acquisition strategy.

**Missing signals:**

- Zero editorial backlinks from gaming press or communities
- No Wikipedia mentions
- No organic Reddit or Hacker News links
- Minimal social profile authority

#### 🔴 Critical — Thin Content Depth

Game landing pages exist, but there are no strategy guides, tutorials, or evergreen articles for Google to index. Google ranks **topic clusters**, not individual pages. A single landing page per game is not enough to establish topical authority.

**What's missing:**

- Strategy guides ("How to play Sicilian Defense", "Backgammon doubling cube strategy")
- Tutorials and how-to content indexed by Google
- Game news / event coverage
- Deep FAQ coverage — ✅ Completed: all 18 game landings expanded to 10 FAQs in all 5 locales
- User-generated content (reviews, tips, community posts)

#### 🟡 High — Technical SEO Issues

- **Locale routing** — `/en/games/chess` hreflang tags are implemented and verified via CI test suite.
- **Core Web Vitals** — Lighthouse CI threshold is 89, but LCP must be under 2.5s in **field data (CrUX)**, not just lab. These differ.
- **Missing structured data** — ✅ Completed: `FAQPage`, `HowTo`, `VideoGame`, and `AggregateRating` schemas active on all 18 game landings.
- **`noindex` leakage** — `noindex-pages.ts` exists. Must verify no game landing pages in any locale are accidentally excluded.
- **OG image completeness** — ✅ Completed: `renderGameOgCard` covers all 18 games.
- **Sitemap gaps** — verify all game landing pages × 5 locales appear in sitemap with correct `lastmod`.
- **Thin internal linking** — blog/guides → game landing cross-links are missing because the blog is thin.

#### 🟡 High — Zero Community Signals

No Discord, no forum, no Reddit presence. Users play and leave. Google sees low return rates and short sessions, which suppresses rankings.

#### 🟢 Medium — Keyword Strategy Too Broad

Targeting high-competition generic terms does not work on a young domain. Win long-tail first:

- "play chess online without account"
- "chess with Stockfish 19 free"
- "sea battle game browser multiplayer"
- "online backgammon no download"
- "critical card game online"
- "chess 960 free online"

---

## 3. Improvement Roadmap

### Phase 1 — Foundation (Month 1–3)

#### SEO Technical

- [ ] Submit all 18 game landing pages × 5 locales to Google Search Console
- [x] Audit sitemap — `changefreq`, `lastmod` on every game landing page (all 18 games registered with proper hreflang alternates)
- [x] Verify hreflang — automated reciprocal alternates validator in CI via `pnpm check-hreflang` (Agent 8)
- [ ] Measure LCP/CLS on game landing pages using CrUX field data. Target LCP < 2.5s
- [x] Add `FAQPage` JSON-LD schema to all FAQ sections on game landing pages
- [x] Add `HowTo` JSON-LD schema to all "How to Play" sections
- [x] Add `AggregateRating` schema to all game landing pages
- [x] Add `SoftwareApplication` schema alongside `VideoGame`
- [x] Audit and fix `noindex` leaks across all locale-prefixed pages
- [x] Complete `renderGameOgCard` for all 18 games

#### Content

- [x] Expand game FAQs to 10 questions per game across all 5 locales (chess, critical, glimworm, sea battle, backgammon, checkers, go)
- [x] Write 5 pillar strategy guides (chess, backgammon, go, checkers, sea battle) — 2,000+ words each across 5 locales
- [x] Activate the blog with at minimum 2 articles per month

#### Backlinks

- [ ] Submit Arcadeum Games to game directories (BoardGameGeek platform listing, RAWG.io, IndieDB, itch.io)
- [ ] Launch on Product Hunt — targets 50–200 quality backlinks
- [ ] Post on Hacker News ("Show HN: free, no-signup multiplayer games with Stockfish 19")

---

### Phase 2 — Community & Retention (Month 3–6)

#### Community

- [x] Discord server — link from navbar
- [x] Platform-wide activity feed — "Recently active games" visible to logged-out users
- [x] Friend system — invite via username or shareable profile link
- [x] Public player profiles with game history, win/loss stats, favorite games (Google-indexable pages)
- [x] Ship public leaderboard page (leagues backend already exists)

#### Retention

- [x] Daily chess puzzle page (resets every 24h — drives recurring visits)
- [x] Streak system — show prominently in UI (streak_freeze already exists on backend)
- [x] Achievement badges — visible on profile, shareable on social
- [ ] Email + push notifications for async game turns and weekly events
- [ ] Smart "Play Again" flow after game ends

#### Viral Growth

- [x] Shareable result cards — image generated after game ends ("I beat Magnus Bot!")
- [x] Embeddable mini-game widgets — Minesweeper, Tic-Tac-Toe on external sites = backlinks
- [ ] Short-form video content plan (TikTok/Reels) for original games

---

### Phase 3 — Scale & Differentiation (Month 6–12)

#### Original Games as Moat

- [ ] Critical — ranked ELO mode. Make Arcadeum Games the canonical place to play Critical online.
- [ ] Sea Battle — weekly bracket tournaments
- [ ] Glimworm — spectator mode → live championship streams
- [ ] Upgrade Critical/Sea Battle/Glimworm/Cat Dash landing pages to match Chess landing depth

#### Mobile App

- [ ] App Store + Google Play listings (Expo app exists, needs production polish)
- [ ] Push notifications for DAU
- [ ] QR code "Play with nearby friends" — viral mechanic

#### Localization Leverage

- [x] Russian content strategy — `ru` locale exists, publish chess/strategy articles targeting Google.ru and Yandex (100% 5-locale strategy guide coverage)
- [x] Spanish content strategy — `es` locale exists, publish guides targeting large underserved market (100% 5-locale strategy guide coverage)
- [x] French content — publish guides in French (100% 5-locale strategy guide coverage)

#### Press & Partnerships

- [ ] Chess education platform partnerships — "Use Arcadeum Games board editor for students"
- [ ] School/library angle — "Free, no-account chess for classrooms"
- [ ] Gaming press outreach — target one mainstream article on Arcadeum Games' story

---

## 4. Metrics to Track

| Metric                                | 3-Month Target       | 12-Month Target |
| ------------------------------------- | -------------------- | --------------- |
| Google avg. position (owned keywords) | 10–15                | 5–10            |
| Indexed pages                         | 300+                 | 1,000+          |
| Referring domains                     | 200+                 | 500+            |
| Monthly organic sessions              | Baseline + 50%       | 10× baseline    |
| Daily Active Users                    | Established baseline | 3× baseline     |
| Session duration                      | >5 min               | >8 min          |
| Return visitor rate                   | >30%                 | >45%            |

---

## 5. What Arcadeum Games Should NOT Do

- **Do not chase broad generic keywords** — won't rank on a young domain. Own long-tail first.
- **Do not buy low-quality backlinks** — Google penalties can wipe organic traffic overnight.
- **Do not gate features behind accounts** — no-signup play is a core differentiator. Protect it.
- **Do not neglect original games** — Critical and Sea Battle are the strongest arguments for Arcadeum Games. Every marketing dollar spent on them is more defensible than chess.

---

## 6. AI Agents — Step-by-Step Automation Plan

The following tasks can be fully or partially automated using AI coding agents running in CI pipelines or on schedule. Each step defines the agent task, inputs, outputs, and integration point.

---

### Agent 1 — SEO Schema Generator

**Goal:** Automatically generate and keep in sync all structured data (JSON-LD) across every game landing page for every locale.

**Trigger:** On PR merge to `develop` when any game config or i18n file changes.

**Steps:**

1. Read all game IDs from `apps/web/src/app/[locale]/home/data/games.ts`
2. For each game, read its i18n messages (FAQ items, HowTo steps, highlights) from `apps/web/src/shared/i18n/messages/games/<game>/<locale>.ts`
3. Generate JSON-LD fragments: `FAQPage`, `HowTo`, `VideoGame`, `AggregateRating`, `SoftwareApplication`
4. Diff against existing schemas in each game's `page.tsx`
5. Open a PR with the additions if any schemas are missing or stale

**Implementation:**

```
Agent reads: games.ts + i18n messages (all locales)
Agent writes: JSON-LD fragments into each game page.tsx or a co-located schema.ts
Agent creates: PR with title "chore(seo): sync JSON-LD schemas for <game>"
```

---

### Agent 2 — FAQ Expander

**Goal:** Expand every game's FAQ from 3–5 entries to 10–12 using the game's existing rules, highlights, and strategy content as source material.

**Trigger:** Run once per game, manually triggered via CLI or GitHub Actions dispatch.

**Steps:**

1. Load game landing data: rules, highlights, how-to steps, strategy tips, existing FAQ
2. Identify the FAQ's current coverage gaps (rules not addressed, platform features not mentioned, strategy questions not present)
3. Generate 6–8 additional FAQ entries following the existing format: `{ key, question, answer }`
4. Write additions into the relevant i18n files for all 5 locales (`en`, `ru`, `es`, `fr`, `by`)
5. Run `pnpm build` to verify no type errors
6. Open PR: "feat(content): expand <game> FAQ to 12 entries"

**Implementation:**

```
Agent reads: apps/web/src/shared/i18n/messages/games/<game>/<locale>.ts
Agent writes: additional FAQ keys to each locale file
Agent validates: TypeScript types match existing FAQ schema
```

---

### Agent 3 — Strategy Guide Writer

**Goal:** Generate 2,000+ word strategy guide articles as MDX blog posts for the top games, targeting specific long-tail keyword clusters.

**Trigger:** Manual dispatch. One run per game.

**Steps:**

1. Accept inputs: `gameId`, `targetKeyword` (e.g., "how to play backgammon online")
2. Read: game rules (i18n/messages/games/<game>), highlights, FAQ, strategy tips
3. Outline article: Introduction → Rules summary → Core strategy → Advanced tactics → How to use Arcadeum Games features → FAQ → Conclusion
4. Generate full MDX article with proper heading hierarchy (h1 → h2 → h3), internal links to game landing page, and `FAQPage` schema embedded
5. Write to `apps/web/src/app/[locale]/(app)/blog/<slug>/page.mdx`
6. Add article to blog index
7. Open PR: "feat(blog): add strategy guide for <game>"

**Human review required:** Article content before merge (quality + accuracy check).

---

### Agent 4 — Sitemap Auditor

**Goal:** Continuously verify that all game landing pages in all locales are correctly indexed and appear in the sitemap with correct `lastmod` dates.

**Trigger:** Cron — every Monday 09:00 UTC.

**Steps:**

1. Read sitemap from `apps/web/src/app/sitemap.ts` — extract all URLs
2. Compare against expected URLs: all game landing pages × 5 locales × all blog posts
3. Fetch each URL, verify response is 200 and not `noindex` (check `<meta name="robots">` in response HTML)
4. Check `lastmod` for any game page that had a commit touching its files in the past 7 days — flag if `lastmod` is not updated
5. Post a Slack/Discord report: list of missing, noindex, or stale entries
6. Optionally auto-open a PR to fix `lastmod` fields

**Implementation:**

```
Agent reads: apps/web/src/app/sitemap.ts + git log (last 7 days)
Agent fetches: live URLs (staging or production)
Agent reports: Slack/Discord webhook with issue list
Agent optionally writes: sitemap.ts fixes in a PR
```

---

### Agent 5 — i18n Content Sync

**Goal:** When new i18n keys are added to the English source (`en.ts`), automatically generate translations for all other locales (`ru`, `es`, `fr`, `by`) and open a PR for human review.

**Trigger:** On PR merge to `develop` when any `en.ts` i18n file changes.

**Steps:**

1. Detect which `en.ts` files changed in the merge commit
2. For each changed file, identify keys that are missing in `ru.ts`, `es.ts`, `fr.ts`, `by.ts`
3. Translate missing values using an LLM prompt that includes: game context, existing translations in the same file for style consistency, and a strict instruction to preserve all TypeScript structure
4. Write translated values into the correct locale files
5. Run TypeScript type check to validate shape matches
6. Open PR: "feat(i18n): auto-translate new <game> keys (ru, es, fr, by)"

**Human review required:** Native speaker review of translations before merge.

**Implementation:**

```
Agent reads: apps/web/src/shared/i18n/messages/**/*.ts (diff from merge)
Agent writes: missing keys in ru/es/fr/by locale files
Agent validates: tsc --noEmit passes
```

---

### Agent 6 — OG Image Generator

**Goal:** Ensure every game has a valid, styled OG image for all 5 locales. Auto-generate any missing ones.

**Trigger:** On PR merge to `develop` when `renderGameOgCard.tsx` or any game landing page changes.

**Steps:**

1. List all game IDs from `games.ts`
2. Check which games have an `opengraph-image.tsx` in their directory
3. For games missing it, generate the file based on `chess/opengraph-image.tsx` as template — parameterize with game name, accent color, and game-specific imagery
4. Verify the generated file imports from `renderGameOgCard`
5. Open PR: "feat(seo): add OG image for <game>"

**Implementation:**

```
Agent reads: apps/web/src/app/[locale]/(app)/games/chess/opengraph-image.tsx (template)
Agent reads: games.ts (for accent colors and game IDs)
Agent writes: apps/web/src/app/[locale]/(app)/games/<game>/opengraph-image.tsx
```

---

### Agent 7 — Core Web Vitals Monitor

**Goal:** Run Lighthouse audits on all game landing pages after every deploy and report regressions before they reach production.

**Trigger:** On deploy to staging (post-merge to `develop`).

**Steps:**

1. Read `apps/web/lighthouse-urls.json` for the list of URLs to audit
2. Run Lighthouse CI on each URL (`lhci autorun`)
3. Compare results against the baseline (stored in `.lighthouseci/`)
4. Flag any page where Performance < 89, LCP > 2.5s, or CLS > 0.1
5. Post a structured report as a GitHub PR check — block merge if any critical regression
6. If SEO score < 95 on any page, list the specific missing meta tags, schema, or robots issues

**Implementation:**

```
Existing: apps/web/lighthouserc.js + scripts/lhci-comment.js
Agent runs: lhci autorun --config=apps/web/lighthouserc.js
Agent posts: structured comment on PR via scripts/lhci-comment.js
```

---

### Agent 8 — Hreflang Validator

**Goal:** Detect hreflang mismatches, orphaned locale pages, or missing `x-default` before they reach production.

**Trigger:** On PR merge that touches any `page.tsx`, route, or i18n config.

**Steps:**

1. Build the Next.js sitemap in dry-run mode
2. Extract all hreflang pairs from `buildPageMetadata` output
3. For each page, verify: all 5 locale variants exist, `x-default` points to `en`, canonical URLs are correct
4. Check that no locale page returns 404 or redirects unexpectedly
5. Fail the CI check and output a diff of broken pairs

**Implementation:**

```
Agent reads: apps/web/src/shared/seo/buildPageMetadata.ts
Agent reads: apps/web/src/shared/config/routes.ts
Agent validates: every page in DEFAULT_PATH_BUILDERS has matching routes for all SUPPORTED_LOCALES
```

---

### Agent 9 — Content Gap Reporter

**Goal:** Weekly report on which game landing pages are below content quality thresholds.

**Trigger:** Cron — every Monday 08:00 UTC.

**Steps:**

1. For each game landing page, count:
   - Number of FAQ items (target: ≥10)
   - Number of highlights (target: ≥8)
   - Number of strategy tips (target: ≥3)
   - Word count of `intro` and `directAnswer` fields (target: intro ≥150 words, directAnswer ≥60 words)
   - Whether `HowTo` + `FAQPage` + `AggregateRating` schemas exist
2. Score each game (0–100) based on completeness
3. Sort by score ascending (worst first)
4. Post Discord/Slack report: "📋 Weekly Content Gap Report" with table of scores and specific missing items

**Implementation:**

```
Agent reads: all game landing .tsx files + i18n messages
Agent counts: FAQ entries, highlight counts, schema presence
Agent posts: Discord webhook with ranked table
```

---

### Agent 10 — Backlink Opportunity Finder

**Goal:** Identify new backlink opportunities — pages that mention Arcadeum's game names without linking, or unlinked mentions of the platform.

**Trigger:** Weekly cron.

**Steps:**

1. Use search APIs (Google Custom Search or SerpAPI) to find pages mentioning "Arcadeum Games", "Critical card game online", "Sea Battle multiplayer browser", etc.
2. Filter out pages that already link to Arcadeum Games
3. For each unlinked mention, retrieve page title, domain authority estimate, contact form or author email if available
4. Post a ranked report to Discord: "🔗 Weekly Backlink Opportunities" sorted by estimated domain authority

**Implementation:**

```
Agent queries: Google Custom Search API or SerpAPI
Agent filters: exclude domains already in backlink profile
Agent posts: Discord webhook with opportunity table
```

---

## 7. Summary Priority Stack

| Priority | Action                                             | Impact            | Effort    | Agent?   | Status  |
| -------- | -------------------------------------------------- | ----------------- | --------- | -------- | ------- |
| 🔴 P0    | Google Search Console setup, sitemap audit         | SEO foundation    | Low       | Agent 4  | ✅ Done |
| 🔴 P0    | Add `FAQPage` + `HowTo` + `AggregateRating` schema | Rich snippets     | Low       | Agent 1  | ✅ Done |
| 🔴 P0    | Expand all game FAQs to 10+ entries                | Keyword coverage  | Medium    | Agent 2  | ✅ Done |
| 🔴 P0    | Product Hunt + Hacker News launch                  | Backlinks         | Low       | Manual   | Pending |
| 🟡 P1    | Write 5 strategy guide articles (2,000+ words)     | Topical authority | High      | Agent 3  | ✅ Done |
| 🟡 P1    | Ship public leaderboards                           | Engagement + SEO  | Medium    | Manual   | ✅ Done |
| 🟡 P1    | Ship public player profiles                        | Indexable pages   | Medium    | Manual   | ✅ Done |
| 🟡 P1    | Daily chess puzzle page                            | Recurring visits  | Medium    | Manual   | ✅ Done |
| 🟡 P1    | Complete OG images for all 18 games                | Social sharing    | Low       | Agent 6  | ✅ Done |
| 🟡 P1    | i18n auto-translation on new keys                  | Locale coverage   | Low       | Agent 5  | ✅ Done |
| 🟡 P1    | Core Web Vitals CI gate                            | Performance       | Low       | Agent 7  | ✅ Done |
| 🟡 P1    | Hreflang validator in CI                           | SEO integrity     | Low       | Agent 8  | ✅ Done |
| 🟡 P1    | Weekly content gap reports                         | Content direction | Low       | Agent 9  | ✅ Done |
| 🟢 P2    | Discord server                                     | Community         | Low       | Manual   | ✅ Done |
| 🟢 P2    | Shareable game result cards                        | Viral growth      | Medium    | Manual   | ✅ Done |
| 🟢 P2    | Achievement badges on profiles                     | Retention + SEO   | Medium    | Manual   | ✅ Done |
| 🟢 P2    | Embeddable mini-game widgets                       | Viral growth      | Medium    | Manual   | ✅ Done |
| 🟢 P2    | Platform-wide activity feed                        | Community + SEO   | Medium    | Manual   | ✅ Done |
| 🟢 P2    | Original game tournaments (Critical, Sea Battle)   | Differentiation   | High      | Manual   | Pending |
| 🟢 P2    | Mobile App Store launch                            | New channel       | Very High | Manual   | Pending |
| 🟢 P2    | Russian/Spanish content strategy                   | Untapped markets  | High      | Agent 3  | ✅ Done |
| 🟢 P2    | Backlink opportunity finder                        | Organic authority | Medium    | Agent 10 | Pending |
