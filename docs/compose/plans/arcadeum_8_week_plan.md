# Arcadeum — 8-Week Improvement Plan (v2, corrected)

**Aug 3 – Sep 27, 2026**

Product: [arcadeum.games](https://arcadeum.games) · Repo: [AnAtoliy-AA/arcadeum](https://github.com/AnAtoliy-AA/arcadeum)

> **v2 correction:** v1 assumed AI bots needed building and SEO pages needed writing from scratch. Both were wrong — bots ship across games, and the Sea Battle / Cascade landing pages are already strong. v1 was written from the homepage alone. This version reflects a proper audit of the live site.

---

## What Changed From v1

| v1 assumption                          | Reality                                                       | Effect on plan                                            |
| -------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| AI bots must be built (Tier 0 blocker) | ✅ Already shipped and tuned                                  | Removed. Replaced with **surfacing** bots on the homepage |
| SEO landing pages must be written      | ✅ Sea Battle + Cascade already excellent                     | Week 3 shrinks to replication for remaining games         |
| Tournaments unshipped                  | ⚠️ Page live but **empty**                                    | New urgent task: build it or `noindex` it                 |
| Blog/content needed                    | ✅ Blog live with guides                                      | Removed                                                   |
| Themes/cosmetics needed                | ✅ 10+ Sea Battle, 8 Cascade themes, shop with avatars/badges | Moved to monetization, Q4                                 |

**Net effect: you are roughly 2–3 weeks ahead of where v1 assumed.** The freed capacity should go to reliability auditing and distribution.

---

## The Core Insight

**Your product is ahead of your marketing.** You've built bots, six games, strong game pages, a blog, themes, team mode, and a shop — but your homepage still says _"play board games online with friends… invite your friends,"_ with no mention of solo or AI play.

Every acquisition channel in this plan lands on that homepage. This plan therefore front-loads **surfacing and reliability**, not feature building.

---

## Week 0 — Prep & Audit

**Sat–Sun, Aug 1–2** · _2–4 hours_

**Goal:** Baseline numbers, and find out what's actually broken (rather than assuming, as v1 did).

- [ ] Record baseline: weekly visitors, rooms created, matches completed, avg players/room.
- [ ] Pick your north-star metric. Recommended: **weekly completed matches**.
- [ ] **Run these five reliability tests by hand** (30 min, and they determine Week 4):
  1. Join a match, background the tab 60s, return. Do you keep your seat?
  2. Deploy the backend mid-match. Does the match survive?
  3. Have a player quit mid-match. Does a bot take over, or does the match collapse?
  4. Open the site as a logged-out first-time visitor. Time how long until you understand you can play vs AI.
  5. Load the game route on throttled 3G. How long to interactive?
- [ ] Verify Google Search Console is connected; check indexing status of your game pages.

**Exit criteria:** Baseline recorded + you know which of the five tests fail.

---

## Week 1 — Analytics & Funnel

**Aug 3–9**

**Goal:** See where users drop off. Nothing later can be evaluated without this.

- [ ] Add analytics (PostHog or Plausible — privacy-friendly, fits your no-signup ethos).
- [ ] Instrument: `landing_viewed`, `game_page_viewed`, `room_created`, `bot_game_started`, `invite_link_copied`, `invite_link_opened`, `player_joined_room`, `match_completed`.
- [ ] **Track the solo path separately from the social path.** These are two distinct funnels and will have very different conversion — conflating them hides the truth.
- [ ] Add `?ref=` / UTM to invite links for attribution.
- [ ] Build the funnel dashboard.

**Exit criteria:** You can answer both — _"of 100 landing visitors, how many complete a match vs AI?"_ and _"…how many get a human friend to join?"_

> Expect the AI path to convert far better for cold traffic. If confirmed, that's your argument for the Week 2 homepage rewrite.

---

## Week 2 — Surface What You Built (highest ROI week)

**Aug 10–16**

**Goal:** Make the homepage sell the product you actually have.

- [ ] **Homepage: "Play vs AI" as a co-primary CTA** beside "Get started."
- [ ] **Rewrite the hero H2:** "Play instantly against AI, or share a link with friends."
- [ ] **Add an AI-opponents feature card** to the existing six.
- [ ] **Add Chess to featured games** — highest search volume of anything you have, currently unlisted.
- [ ] **Fix `/games` empty state** — seed always-joinable AI rooms, or show "No open rooms — start one vs AI." Right now it reads as an abandoned product.
- [ ] **Fix Tournaments stub** — `noindex` + "Coming Soon" until Week 7 builds it.
- [ ] **Fix the player-count contradiction** (homepage 2–6 vs Sea Battle page 2–4).
- [ ] **Audit the invite flow** (unverified in v1 — check before rebuilding): native share sheet on mobile, OG preview images, QR code, prominent invite CTA in an empty room, rematch button.

**Exit criteria:** A logged-out visitor understands within 10 seconds that they can play immediately, alone.

---

## Week 3 — Complete the SEO Template Rollout

**Aug 17–23**

**Goal:** Extend a proven template. Much smaller than v1 assumed.

- [ ] **Replicate the Sea Battle / Cascade template** for Critical, Tic-Tac-Toe, Chess, Glimworm: H1, rules, FAQ, strategy, themes, internal links, "Play vs AI" CTA.
- [ ] **Verify `schema.org` markup** on all game pages (`VideoGame` + `FAQPage`) — validate with Google's Rich Results Test. Your FAQ content already qualifies for rich snippets; make sure the markup is actually there.
- [ ] **Add `hreflang`** across your 5 locales — built but likely not fully exploited.
- [ ] **Chess page needs care** — highest volume, highest competition. Target long-tail: "play chess with friends online free no signup."
- [ ] **Extend the blog** — you have the Sea Battle guide; add one per major game.
- [ ] **Verify sitemap** includes every game and blog page; submit in GSC.
- [ ] Lighthouse audit; fix Core Web Vitals failures.

**Exit criteria:** Every game has a landing page matching Sea Battle's quality, all indexed.

---

## Week 4 — Reliability & Retention

**Aug 24–30**

**Goal:** Fix whatever the Week 0 tests exposed. This is the last safe window before launch traffic.

- [ ] **Fix failures from the Week 0 tests** — reconnection, deploy survival, mid-match bot backfill. Highest priority.
- [ ] **Redis pub/sub for WebSockets** if not already present — single-instance won't survive Product Hunt.
- [ ] **Load test** (k6/Artillery). Establish your concurrent-room ceiling.
- [ ] **Sentry + `matchId` correlation IDs.**
- [ ] **PWA install prompt** after a user's 2nd completed match (not on first visit).
- [ ] **Turn notifications** — "it's your turn," opt-in. Turn-based games die from silent abandonment.
- [ ] **Emotes** — cheap, boosts the retention metrics you're measuring this week.
- [ ] Record D1/D7 return-rate baseline.

**Exit criteria:** All five Week 0 tests pass; known concurrent-user ceiling.

---

## Week 5 — Soft Launch: Reddit + Discord

**Aug 31 – Sep 6**

**Goal:** First external traffic. Deliberately soft — a dress rehearsal for Product Hunt.

- [ ] **Post to r/WebGames** using the prepared copy (see `arcadeum_reddit_posts.md`).
- [ ] **Post to r/SideProject** 3–4 days later.
- [ ] **Consider r/chess** — only if your Chess implementation handles every edge case (en passant, promotion, threefold repetition, 50-move). That sub will find gaps within minutes.
- [ ] **Ship the Discord `/play` bot.**
- [ ] Be in the comments for the first 4–6 hours of every post.
- [ ] Watch the funnel live; log every bug and piece of feedback verbatim.

**Exit criteria:** First external cohort measured end-to-end.

---

## Week 6 — Product Hunt + Content

**Sep 7–13**

**Goal:** Peak visibility, on a product that now converts and retains.

- [ ] **Mon–Wed:** PH assets — tagline, gallery, 30–60s demo video. Lead with "play instantly vs AI or with friends, no signup."
- [ ] **Launch Thursday** (~12:01am PT). Available all day for comments.
- [ ] Notify everyone who engaged in Week 5.
- [ ] **r/InternetIsBeautiful** this week or next — your highest-reach, strictest sub. Save it for when the homepage fix is proven.
- [ ] **Short-form video** — 3–5 clips of Cascade chaos or Sea Battle themes.
- [ ] **Backlink outreach** to 10–15 "best free online games" listicle owners, using the launch as the hook.

**Exit criteria:** Launch handled without downtime; numbers logged.

---

## Week 7 — Build Tournaments For Real

**Sep 14–20**

**Goal:** Fill the empty page and give the new cohort a reason to stay.

- [ ] **Bracket tournaments for one game** — Sea Battle first (bounded match length, well understood).
- [ ] **Weekly-resetting leaderboards** — weekly resets bring lapsed players back; all-time boards discourage newcomers.
- [ ] **Achievements** (~15–20 across games).
- [ ] **Bot-fill brackets** if signups fall short, so a scheduled event never fails to run.
- [ ] Remove `noindex` from the tournaments page; announce to the Week 5–6 cohort.

**Exit criteria:** One tournament run end-to-end with real players.

---

## Week 8 — Measure, Cut, Double Down

**Sep 21–27**

- [ ] Full funnel: Week 1 baseline vs Week 8 — **solo path and social path separately**.
- [ ] Rank channels by _matches completed per hour of effort_, not raw traffic.
- [ ] **Kill the worst-performing channel.** Don't keep doing everything.
- [ ] GSC: impressions and average position for target keywords (movement is just starting — that's expected, not failure).
- [ ] Review collected feedback; pick the top 3 requests.
- [ ] Write a 1-page Q4 plan doubling down on the best channel.
- [ ] **Q4 candidates:** monetize cosmetics (shop infra exists), Discord Activity, embeddable widget, ES/FR localized marketing.

---

## Weekly Metrics Table

| Week | Ending | Visitors | Bot games started | Rooms created | Room→Join % | Matches completed | D7 % | Notes            |
| ---- | ------ | -------- | ----------------- | ------------- | ----------- | ----------------- | ---- | ---------------- |
| 0    | Aug 2  |          |                   |               |             |                   |      | baseline + audit |
| 1    | Aug 9  |          |                   |               |             |                   |      | analytics live   |
| 2    | Aug 16 |          |                   |               |             |                   |      | homepage fixed   |
| 3    | Aug 23 |          |                   |               |             |                   |      | SEO rollout      |
| 4    | Aug 30 |          |                   |               |             |                   |      | reliability      |
| 5    | Sep 6  |          |                   |               |             |                   |      | Reddit + Discord |
| 6    | Sep 13 |          |                   |               |             |                   |      | Product Hunt     |
| 7    | Sep 20 |          |                   |               |             |                   |      | tournaments      |
| 8    | Sep 27 |          |                   |               |             |                   |      | review           |

> Track **bot games started** separately from rooms created. For cold traffic it's likely your dominant activation path, and averaging the two together will hide that.

---

## Not Doing (and why)

- **Paid ads** — not until the funnel is measured and the homepage converts.
- **A 7th game** — six is plenty; distribution is the bottleneck.
- **Native apps** — PWA + Expo covers mobile.
- **Monetization** — Q4. The shop/avatar/theme infrastructure already exists, so it'll be fast when you get there.

## Risks

| Risk                                 | Mitigation                                                            |
| ------------------------------------ | --------------------------------------------------------------------- |
| Reddit post removed for self-promo   | Read sub rules; build comment history first; lead with story not link |
| Launch traffic downtime              | Load test Week 4; Redis fan-out before Week 6                         |
| No SEO results by Week 8             | Expected — SEO compounds over 3–6 months. Judge on impressions trend  |
| Solo-dev bandwidth                   | Weeks 1, 2, 4 are non-negotiable. Weeks 3 and 7 can each slip a week  |
| Tournaments page indexed while empty | `noindex` in Week 2, remove in Week 7                                 |
| r/chess backlash over rules bugs     | Verify every edge case, or skip that sub                              |
