# Home Perf Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-06-home-perf-phase-2-implementation-design.md`
**Diagnostic results (root-cause evidence):** `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md`
**Ticket:** ARC-570
**Lands in:** existing PR #580 (`ARC-570 → develop`), on top of commits `af046337`, `9cd18f68`, `f8cf82a5`.

**Goal:** Reach Lighthouse 100/100/100/100 on both mobile and desktop for `/` by landing the 5 fixes the Phase 2 diagnostic identified, sequenced so the highest-impact change (CSS bundling) is verified before downstream work depends on it.

**Architecture:** Six sequential commits with two verification gates (after C1, before C5). Each fix is independently revertable. Lighthouse re-runs after C1, C4, and C5 confirm progress.

**Tech Stack:** Next.js 16 (Turbopack default), Tamagui, pnpm workspaces, Lighthouse CLI, jq.

**Working directory:** `/Users/anatoliyaliaksandrau/js/arcadeum`. Branch is `ARC-570`. Server runs on port 3500.

---

## File Inventory (full set)

### Modified

- `apps/web/next.config.ts` — Fix #1 Step 1 (add `experimental.cssChunking: false`)
- `apps/web/src/app/home/HomePage.tsx` — Fix #1 Step 2 (eager CSS imports — only if Step 1 fails)
- `apps/web/src/app/home/components/HomeHero.tsx` — remove CSS import (only Step 2 fallback)
- `apps/web/src/app/home/components/HomeFooter.tsx` — remove CSS import (only Step 2 fallback)
- `apps/web/src/app/home/components/WebPresentation.tsx` — remove CSS import (only Step 2 fallback)
- `apps/web/package.json` — Fix #4 (add `browserslist` field)
- `apps/web/src/app/home/components/HomePitchDeck.tsx` — Fix #5 (drop `'use client'`)
- `packages/ui/src/components/Button/SharedButtonStyles.ts` — Fix #2 (variant `color:` change) OR
- `packages/ui/src/tamagui.config.ts` — Fix #2 (token value change)
- `apps/web/src/app/home/components/styles/hero-stable.css` — Fix #3 (delete mobile-hide block — conditional)
- `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md` — C6 (after-fix scores)

### Created

- `docs/superpowers/specs/lighthouse/phase2-mobile-{1,2,3}.report.json` — final after-fix Lighthouse runs
- `docs/superpowers/specs/lighthouse/phase2-desktop-{1,2,3}.report.json` — same
- (Optionally) `docs/superpowers/specs/lighthouse/c1-mobile-{1,2,3}.report.json` — verification runs after C1
- (Optionally) `docs/superpowers/specs/lighthouse/c4-desktop-{1,2,3}.report.json` — verification runs after C4

---

## Phase A — Pre-flight

### Task A1: Verify branch + working tree clean

**Files:** none modified.

- [ ] **Step 1: Confirm branch and clean state**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum status --short
git -C /Users/anatoliyaliaksandrau/js/arcadeum branch --show-current
```

Expected: branch `ARC-570`, no uncommitted changes (or only files unrelated to this PR). If anything is mid-edit, stash or commit before proceeding.

- [ ] **Step 2: Confirm port 3500 is free or owned by a process you can kill**

```bash
lsof -nP -iTCP:3500 -sTCP:LISTEN 2>/dev/null && echo "in use" || echo "free"
```

If in use, identify (`ps -p $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t)`) and kill if it's a stale `next-server` of yours. Ask the user before killing anything else (per Phase 1 precedent).

- [ ] **Step 3: Confirm Mongo is running (for any pre-push e2e)**

```bash
nc -z 127.0.0.1 27017 2>&1 && echo "Mongo up" || echo "Mongo NOT running"
```

If not running and the user wants e2e to gate the push: `docker run -d --name arc570-mongo -p 27017:27017 mongo:latest`. If `arc570-mongo` already exists from earlier in the session: `docker start arc570-mongo`.

---

## Phase B — Fix #1 Step 1 (CSS bundling via config knob)

### Task B1: Add `cssChunking: false` to next.config.ts

**Files:**

- Modify: `apps/web/next.config.ts:214` (the existing `experimental:` block)

- [ ] **Step 1: Read the current `experimental` block**

```bash
sed -n '210,230p' /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/next.config.ts
```

Confirm the block looks like:

```typescript
experimental: {
  optimizePackageImports: [
    'tamagui',
    ...
  ],
},
```

- [ ] **Step 2: Add `cssChunking: false` to the experimental block**

Use the Edit tool. Inside the existing `experimental` object, add the new key (Next.js 15+ flag — disables per-chunk CSS splitting):

Before:

```typescript
  experimental: {
    optimizePackageImports: [
      'tamagui',
      ...
    ],
  },
```

After:

```typescript
  experimental: {
    cssChunking: false,
    optimizePackageImports: [
      'tamagui',
      ...
    ],
  },
```

- [ ] **Step 3: Type-check and build**

```bash
pnpm --filter web build 2>&1 | tail -10
```

Expected: build completes; no TypeScript errors. If TypeScript complains about `cssChunking` not being a valid `experimental` key, the Next.js 16 type definitions don't expose it; fall through to Step 4 anyway since Next.js may still honor it at runtime.

- [ ] **Step 4: Count CSS chunks emitted**

```bash
# Robust find — covers both webpack chunks/ and Turbopack's possible app/ layout
find /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next/static -name '*.css' -type f 2>/dev/null
find /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next/static -name '*.css' -type f 2>/dev/null | wc -l
```

Decision matrix (interpret the count carefully):

- **count ≤ 2** → Step 1 succeeded, proceed to Task B2
- **count = 0** → likely searching the wrong path or build emitted no CSS at all. Inspect `.next/` structure with `find /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next -name '*.css' -type f` (no `static` restriction) before deciding.
- **count > 2** → Step 1 silently no-op'd (Turbopack ignores the flag). REVERT and proceed to Phase C (Step 2 fallback).

```bash
# Revert if no-op:
git -C /Users/anatoliyaliaksandrau/js/arcadeum checkout apps/web/next.config.ts
```

---

### Task B2: Verify with Lighthouse mobile + desktop

**Files:** writes `docs/superpowers/specs/lighthouse/c1-{mobile,desktop}-{1,2,3}.report.json`

- [ ] **Step 1: Start production server**

```bash
pnpm --filter web start
```

Use Bash with `run_in_background: true`. Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3500` returns 200.

- [ ] **Step 2: Run Lighthouse mobile 3×**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --form-factor=mobile --throttling-method=simulate --output=json --output-path=docs/superpowers/specs/lighthouse/c1-mobile-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
for i in 1 2 3; do jq -r '"M\($i): Perf \(.categories.performance.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s"' --arg i "$i" docs/superpowers/specs/lighthouse/c1-mobile-$i.report.json; done
```

Expected median targets:

- Performance ≥ 95 (was 84)
- LCP < 2.5s (was 5.72s)

- [ ] **Step 3: Run Lighthouse desktop 3×**

```bash
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --preset=desktop --output=json --output-path=docs/superpowers/specs/lighthouse/c1-desktop-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
for i in 1 2 3; do jq -r '"D\($i): Perf \(.categories.performance.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s"' --arg i "$i" docs/superpowers/specs/lighthouse/c1-desktop-$i.report.json; done
```

Expected median targets:

- Performance ≥ 99 (was 98)
- LCP < 1.1s (was 1.18s)

- [ ] **Step 4: Stop server**

```bash
kill $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null
```

- [ ] **Step 5: Decision gate**

If mobile median Perf ≥ 95 AND mobile median LCP < 2.5s → proceed to Task B3 (commit C1).

If mobile fails (Perf < 95 or LCP ≥ 2.5s) → revert the next.config.ts change and go to Phase C (Step 2 fallback).

---

### Task B3: Commit C1

- [ ] **Step 1: Commit the next.config.ts change**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum add apps/web/next.config.ts docs/superpowers/specs/lighthouse/c1-*
git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
feat(ARC-570): bundle home route CSS to clear render-blocking

Add experimental.cssChunking: false to next.config.ts. Per Phase 2
diagnostic, Lighthouse's simulator was modeling each of 7 separate
render-blocking CSS chunks as a fresh ~303ms (mobile) / ~83ms (desktop)
round-trip, totaling ~2s and ~500ms of fictitious LCP delay
respectively. Bundling them into a single chunk eliminates the
per-chunk simulator penalty.

Verification (3-run medians, see c1-* JSONs):
- Mobile: Perf <NN> (was 84) / LCP <X.XX>s (was 5.72s)
- Desktop: Perf <NN> (was 98) / LCP <X.XX>s (was 1.18s)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)" 2>&1 | tail -10
```

Replace `<NN>` and `<X.XX>` with the actual median values from Task B2.

The pre-commit hook runs the full pipeline (~5 min). If it surfaces lint/test failures, fix the underlying cause and re-commit (do not `--no-verify`).

---

## Phase C — Fix #1 Step 2 fallback (eager CSS imports) — ONLY IF B fails

Skip this entire phase if Phase B succeeded.

### Task C1: Move CSS imports to HomePage.tsx

**Files:**

- Modify: `apps/web/src/app/home/HomePage.tsx`
- Modify: `apps/web/src/app/home/components/HomeHero.tsx` (remove CSS import)
- Modify: `apps/web/src/app/home/components/HomeFooter.tsx` (remove CSS import)
- Modify: `apps/web/src/app/home/components/WebPresentation.tsx` (remove CSS import)

The 3 component-level CSS imports get split with their dynamic boundaries. Centralizing in HomePage.tsx (which is eager-imported by `app/page.tsx`) makes them all share one parent chunk.

- [ ] **Step 1: Verify the assumed CSS imports actually exist in the components**

Before moving anything, confirm what's there now:

```bash
grep -n "import.*\.css" /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomeHero.tsx /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomeFooter.tsx /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/WebPresentation.tsx /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomeFeatures.tsx /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomeGames.tsx /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomeHowItWorks.tsx /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomePresentation.tsx /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomePitchDeck.tsx 2>/dev/null
```

Expected (per spec assumption, verified 2026-05-06): only `HomeHero.tsx`, `HomeFooter.tsx`, `WebPresentation.tsx` import CSS files. If the actual list differs, adjust Steps 2 and 3 accordingly — the plan should always reflect reality, not the spec snapshot.

- [ ] **Step 2: Add CSS imports to HomePage.tsx**

Use the Edit tool to add at the top of `HomePage.tsx` (after existing imports), one line per CSS file confirmed in Step 1:

```typescript
import './components/styles/hero-stable.css';
import './components/styles/footer-stable.css';
import './components/styles/presentation-stable.css';
```

- [ ] **Step 3: Remove the same CSS imports from the component files**

For each of `HomeHero.tsx`, `HomeFooter.tsx`, `WebPresentation.tsx` (or whatever set Step 1 actually confirmed) — delete the line `import './styles/<name>.css';`.

- [ ] **Step 4: Build + verify CSS chunk count**

```bash
rm -rf /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next
pnpm --filter web build 2>&1 | tail -5
# Robust glob — Turbopack may nest CSS under app/ rather than chunks/
find /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next/static -name '*.css' -type f 2>/dev/null
find /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next/static -name '*.css' -type f 2>/dev/null | wc -l
```

Expected: ≤2 total CSS files in the build output (was 7).

- [ ] **Step 5: Verify with Lighthouse (same as Task B2 Steps 1–4)**

Save outputs to `c1b-mobile-*` and `c1b-desktop-*` to distinguish from the failed Step 1 attempt.

- [ ] **Step 6: Decision gate**

If mobile median Perf ≥ 95 AND mobile median LCP < 2.5s → commit (Step 7). Else: STOP and surface to user; consider Phase 3 (Critters/beasties critical-CSS inlining) outside this PR.

- [ ] **Step 7: Commit C1 (alternate)**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum add apps/web/src/app/home/HomePage.tsx apps/web/src/app/home/components/HomeHero.tsx apps/web/src/app/home/components/HomeFooter.tsx apps/web/src/app/home/components/WebPresentation.tsx docs/superpowers/specs/lighthouse/c1b-*
git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
feat(ARC-570): bundle home route CSS via eager parent imports

Per Phase 2 diagnostic, the 7 render-blocking CSS chunks came from
per-component CSS imports being split with their next/dynamic
boundaries. The Next.js cssChunking config knob did not apply under
Turbopack; this commit takes the surgical fallback: move the 3
component-level CSS imports (hero-stable, footer-stable,
presentation-stable) up to HomePage.tsx so they share the parent's
chunk. JS code-splitting is preserved.

Verification (3-run medians, see c1b-* JSONs):
- Mobile: Perf <NN> (was 84) / LCP <X.XX>s (was 5.72s)
- Desktop: Perf <NN> (was 98) / LCP <X.XX>s (was 1.18s)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)" 2>&1 | tail -10
```

---

## Phase D — Fix #4 (browserslist)

### Task D1: Add explicit browserslist to apps/web/package.json

**Files:**

- Modify: `apps/web/package.json`

- [ ] **Step 1: Read current package.json**

```bash
head -30 /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/package.json
```

Identify a sensible insertion point — typically right after the `"version"` field at the top, or alongside other top-level metadata fields.

- [ ] **Step 2: Add the `browserslist` field**

Use the Edit tool. Insert (e.g., after `"version": "1.12.1"`):

```json
  "browserslist": [
    "chrome >= 87",
    "firefox >= 78",
    "safari >= 14",
    "edge >= 88"
  ],
```

- [ ] **Step 3: Build to verify**

```bash
pnpm --filter web build 2>&1 | tail -5
```

Expected: build completes; no errors.

- [ ] **Step 4: Commit C2**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum add apps/web/package.json
git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
perf(ARC-570): drop legacy JS polyfills via explicit browserslist

Pin the web app's browserslist to ES2020 baseline (chrome >= 87,
firefox >= 78, safari >= 14, edge >= 88). Next.js was previously using
its default targets (chrome 64+, firefox 67+, safari 12+, edge 79+),
which triggered Lighthouse's "Avoid serving legacy JavaScript to
modern browsers" audit (~14 KiB savings). With this pin, modern users
no longer download polyfills they don't need.

Coverage: ~98% of real users (per caniuse aggregates).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)" 2>&1 | tail -10
```

---

## Phase E — Fix #5 (HomePitchDeck → Server Component)

### Task E1: Drop 'use client' from HomePitchDeck

**Files:**

- Modify: `apps/web/src/app/home/components/HomePitchDeck.tsx:1`

- [ ] **Step 1: Confirm the file truly has no client-only code**

```bash
grep -nE "use(State|Effect|Ref|Memo|Callback|Translation|Router)|on(Click|Mouse|Key|Submit|Change)|window\.|document\." /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/HomePitchDeck.tsx | head -10
```

Expected: no matches. (Phase 2 diagnostic Section 4 already confirmed this; this is a re-check.)

- [ ] **Step 2: Remove the `'use client'` directive**

Use the Edit tool to delete line 1 (`'use client';`) and the blank line below it if any.

- [ ] **Step 3: Build to confirm Server Component compiles**

```bash
pnpm --filter web build 2>&1 | tail -5
```

Expected: build completes. If it fails with "Server Components cannot use ..." → revert and surface; the file has hidden client behavior.

- [ ] **Step 4: Render `/` and confirm visual output unchanged**

```bash
pnpm --filter web start
```

(Background.) Open `http://localhost:3500`, scroll to the PitchDeck section, confirm it renders identically to before. Stop server.

- [ ] **Step 5: Commit C3**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum add apps/web/src/app/home/components/HomePitchDeck.tsx
git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
refactor(ARC-570): convert HomePitchDeck to Server Component

Drop 'use client' from HomePitchDeck.tsx. Phase 2 diagnostic confirmed
zero hooks, zero events, zero browser APIs in this component — pure
markup. Server-rendering it removes a small amount of client JS from
the / route bundle.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)" 2>&1 | tail -10
```

---

## Phase F — Fix #2 (Tamagui LinkButton secondary contrast)

### Task F1: Identify the failing color combo

**Files:** none modified yet.

- [ ] **Step 1: Get the foreground/background hex pair from the latest desktop Lighthouse run**

Prefer the most recently captured desktop run on disk. Order of preference:

1. `c1-desktop-2.report.json` (post-Phase-B, freshest state)
2. `after5-desktop-2.json` (Phase 1 final, definitely committed)

```bash
ls /Users/anatoliyaliaksandrau/js/arcadeum/docs/superpowers/specs/lighthouse/c1-desktop-2.report.json /Users/anatoliyaliaksandrau/js/arcadeum/docs/superpowers/specs/lighthouse/after5-desktop-2.json 2>/dev/null
# Pick the first one that exists; if neither exists (e.g., fresh clone), regenerate by running:
#   pnpm --filter web start &
#   npx -y lighthouse http://localhost:3500 --preset=desktop --output=json --output-path=docs/superpowers/specs/lighthouse/quick-desktop.json --chrome-flags="--headless=new" --quiet
#   kill $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t)
# Then use quick-desktop.json below.
LH_FILE=docs/superpowers/specs/lighthouse/c1-desktop-2.report.json  # or after5-desktop-2.json
jq '.audits["color-contrast"].details.items[]? | {selector: .node.selector, snippet: .node.snippet, explanation: (.node.explanation // "")}' "$LH_FILE"
```

Expected: identifies `is_DesktopOnly > a > div.is_LinkButton > span.is_Typography`. The `explanation` field typically contains the foreground/background hex pair and the failing ratio.

- [ ] **Step 2: Read the current secondary variant**

```bash
sed -n '30,60p' /Users/anatoliyaliaksandrau/js/arcadeum/packages/ui/src/components/Button/SharedButtonStyles.ts
```

Note the current `color: '$secondaryText'` (line 36).

- [ ] **Step 3: Read the current $secondaryText token value**

```bash
grep -nE "secondaryText" /Users/anatoliyaliaksandrau/js/arcadeum/packages/ui/src/tamagui.config.ts
```

Identify the current resolved color and which theme(s) define it (light vs dark).

---

### Task F2: Pick fix path (A or B per spec) and apply

**Files (one of):**

- Modify: `packages/ui/src/tamagui.config.ts` (Path A — token value change)
- Modify: `packages/ui/src/components/Button/SharedButtonStyles.ts:36` (Path B — variant `color:` change)

Decide based on Task F1 Step 3:

- If `$secondaryText` is used by other components beyond Button (and changing it would visually shift them) → Path B (scoped change).
- Else → Path A (token-level fix; affects all `$secondaryText` consumers, which is the correct semantic).

- [ ] **Step 1: Apply the chosen change**

**Path A example:** in `tamagui.config.ts`, find the theme block (likely a `light` theme and a `dark` theme); raise the `secondaryText` value to a higher-contrast shade. Pick a value that meets ≥ 4.5:1 against the Header background (which is around `#1e2023`-ish per `apps/web/src/app/styles/tokens.css`).

**Path B example:** in `SharedButtonStyles.ts:36`, change `color: '$secondaryText'` to `color: '$primaryText'` or another existing high-contrast token. Confirm the new token's value with the tokens file.

- [ ] **Step 2: Type-check workspace-wide**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum/apps/web && pnpm exec tsc --noEmit -p .
cd /Users/anatoliyaliaksandrau/js/arcadeum/apps/mobile && pnpm exec tsc --noEmit -p . 2>&1 | tail -5
```

Expected: clean.

- [ ] **Step 3: Build + start server + visual scan**

```bash
pnpm --filter web build 2>&1 | tail -3
pnpm --filter web start
```

(Background.) Open `http://localhost:3500`. Confirm:

- Header desktop nav Support button text is visibly higher-contrast against the dark header background
- Switch to light theme (if accessible from UI), confirm the same text is also legible
- Browse to `/games`, `/settings`, any other page using secondary buttons — confirm no jarring visual regressions

Stop server.

---

### Task F3: Verify Lighthouse desktop A11y is 100

**Files:** writes `docs/superpowers/specs/lighthouse/c4-desktop-{1,2,3}.report.json`

- [ ] **Step 1: Start server**

```bash
pnpm --filter web start
```

(Background, wait for ready.)

- [ ] **Step 2: Run Lighthouse desktop 3×**

```bash
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --preset=desktop --output=json --output-path=docs/superpowers/specs/lighthouse/c4-desktop-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
for i in 1 2 3; do jq -r '"D\($i): A11y \(.categories.accessibility.score * 100 | floor)  Perf \(.categories.performance.score * 100 | floor)"' --arg i "$i" docs/superpowers/specs/lighthouse/c4-desktop-$i.report.json; done
echo "color-contrast audit (run 2):"
jq '.audits["color-contrast"].score' docs/superpowers/specs/lighthouse/c4-desktop-2.report.json
```

Expected: A11y median = 100; `color-contrast` audit score = 1.

- [ ] **Step 3: Stop server**

```bash
kill $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null
```

- [ ] **Step 4: Decision gate**

If desktop A11y = 100 → commit (Step 5). Else: investigate the still-failing element (re-run jq from Task F1 Step 1 against `c4-desktop-2.report.json`); maybe a different element is failing now, or the token shift wasn't enough.

- [ ] **Step 5: Commit C4**

Stage the actually-modified file (whichever Path you took) plus the verification JSONs:

```bash
# Path A:
git -C /Users/anatoliyaliaksandrau/js/arcadeum add packages/ui/src/tamagui.config.ts docs/superpowers/specs/lighthouse/c4-desktop-*
# OR Path B:
# git -C ... add packages/ui/src/components/Button/SharedButtonStyles.ts docs/superpowers/specs/lighthouse/c4-desktop-*

git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
a11y(ARC-570): bump Tamagui LinkButton secondary color contrast

Phase 1 audit identified the secondary-variant Support button in the
desktop nav as the only remaining desktop A11y failure (color-contrast
audit, 96 → 100). Token-level fix at <path A or B>. Affects all
secondary-variant Buttons and LinkButtons app-wide; visual scan
confirmed no jarring regressions on /, /games, /settings.

Verification (3-run desktop medians, see c4-desktop-* JSONs):
- A11y category 100 (was 96)
- color-contrast audit score 1 (was 0)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)" 2>&1 | tail -10
```

---

## Phase G — Re-audit gate, decide on Fix #3

### Task G1: Run a full re-audit before deciding on rainbow restoration

**Files:** writes `docs/superpowers/specs/lighthouse/preC5-{mobile,desktop}-{1,2,3}.report.json`

- [ ] **Step 1: Start server**

```bash
pnpm --filter web start
```

(Background, wait for ready.)

- [ ] **Step 2: Run Lighthouse 3× both devices**

```bash
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --form-factor=mobile --throttling-method=simulate --output=json --output-path=docs/superpowers/specs/lighthouse/preC5-mobile-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --preset=desktop --output=json --output-path=docs/superpowers/specs/lighthouse/preC5-desktop-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
echo "=== Mobile ==="
for i in 1 2 3; do jq -r '"M\($i): Perf \(.categories.performance.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s"' --arg i "$i" docs/superpowers/specs/lighthouse/preC5-mobile-$i.report.json; done
echo "=== Desktop ==="
for i in 1 2 3; do jq -r '"D\($i): Perf \(.categories.performance.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s"' --arg i "$i" docs/superpowers/specs/lighthouse/preC5-desktop-$i.report.json; done
```

- [ ] **Step 3: Stop server**

```bash
kill $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null
```

- [ ] **Step 4: Decision matrix per spec Fix #3**

Compute the mobile median LCP from the 3 runs.

- LCP ≤ 1.5s → proceed with C5 (Phase H, restore rainbow with confidence)
- 1.5s < LCP ≤ 2.0s → proceed with C5 BUT plan to re-verify; if post-restore LCP > 2.5s, revert C5
- LCP > 2.0s → SKIP C5. Document in the diagnostic-results doc Section 5: "rainbow restoration deferred — `::after` reintroduces LCP cost". Move to Phase I.

---

## Phase H — Fix #3 (restore hero ::after on mobile) — CONDITIONAL

Skip this entire phase if the Phase G gate said SKIP.

### Task H1: Delete the mobile-hide CSS block

**Files:**

- Modify: `apps/web/src/app/home/components/styles/hero-stable.css`

- [ ] **Step 1: Locate the existing block**

```bash
grep -nB 2 -A 6 "Hide the rainbow overlay" /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/src/app/home/components/styles/hero-stable.css
```

Find the entire `@media (max-width: 1150px) { .hero-title-shimmer::after { display: none; } }` block (along with its leading explanatory comment, if any — see Phase 1 commit `3144c815`).

- [ ] **Step 2: Delete the block**

Use the Edit tool to remove the full media query. Keep the rest of the media query content (which has other rules for `.hero-card-stack` etc.) intact — only delete the `.hero-title-shimmer::after { display: none; }` rule.

- [ ] **Step 3: Build + visual confirmation on mobile viewport**

```bash
pnpm --filter web build 2>&1 | tail -3
pnpm --filter web start
```

(Background.) Open `http://localhost:3500` in DevTools at mobile viewport (360px width). Confirm the rainbow shimmer overlay is now visible on the hero title.

Stop server.

---

### Task H2: Verify mobile LCP doesn't regress past threshold

**Files:** writes `docs/superpowers/specs/lighthouse/c5-mobile-{1,2,3}.report.json`

- [ ] **Step 1: Start server, run Lighthouse mobile 3×**

```bash
pnpm --filter web start  # background
# wait for ready
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --form-factor=mobile --throttling-method=simulate --output=json --output-path=docs/superpowers/specs/lighthouse/c5-mobile-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
for i in 1 2 3; do jq -r '"M\($i): Perf \(.categories.performance.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s  LCP-elt: \(.audits["largest-contentful-paint-element"].details.items[0].items[0].node.selector // "n/a")"' --arg i "$i" docs/superpowers/specs/lighthouse/c5-mobile-$i.report.json; done
kill $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null
```

- [ ] **Step 2: Decision**

- Mobile median LCP < 2.5s AND Performance ≥ 95 → Step 3 (commit C5)
- Otherwise → REVERT (`git checkout apps/web/src/app/home/components/styles/hero-stable.css`) and document defer (Phase I will pick this up in the doc update).

- [ ] **Step 3: Commit C5**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum add apps/web/src/app/home/components/styles/hero-stable.css docs/superpowers/specs/lighthouse/c5-*
git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
style(ARC-570): restore hero ::after rainbow on mobile

Phase 1 commit 3144c815 hid the .hero-title-shimmer::after rainbow
overlay on viewports below 1150px because it was being picked as the
mobile LCP element with a simulated LCP of ~5.7s. Phase 2 Fix #1 (CSS
bundling) brought the simulator's mobile LCP down to a level where the
overlay can be re-enabled without breaking the LCP score.

Verification (3-run mobile medians after restore, see c5-mobile-*):
- LCP <X.XX>s (still < 2.5s threshold)
- Performance <NN> (still >= 95)
- LCP element may be h1::after again — that's expected; what matters
  is the timing fits within the budget.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)" 2>&1 | tail -10
```

Replace placeholders with actual values.

---

## Phase I — Final verification + docs + push

### Task I1: Final Lighthouse run (median of 3 per device)

**Files:** writes `docs/superpowers/specs/lighthouse/phase2-{mobile,desktop}-{1,2,3}.report.json`

- [ ] **Step 1: Production build (clean)**

```bash
rm -rf /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next
pnpm --filter web build 2>&1 | tail -3
```

- [ ] **Step 2: Start server**

```bash
pnpm --filter web start  # background
```

- [ ] **Step 3: Final Lighthouse mobile 3×**

```bash
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --form-factor=mobile --throttling-method=simulate --output=json --output-path=docs/superpowers/specs/lighthouse/phase2-mobile-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
```

- [ ] **Step 4: Final Lighthouse desktop 3×**

```bash
for i in 1 2 3; do npx -y lighthouse http://localhost:3500 --preset=desktop --output=json --output-path=docs/superpowers/specs/lighthouse/phase2-desktop-$i.report.json --chrome-flags="--headless=new" --quiet 2>&1 | tail -1; done
```

- [ ] **Step 5: Print summary**

```bash
echo "=== FINAL Mobile ==="
for i in 1 2 3; do jq -r '"M\($i): Perf \(.categories.performance.score * 100 | floor)  A11y \(.categories.accessibility.score * 100 | floor)  BP \(.categories["best-practices"].score * 100 | floor)  SEO \(.categories.seo.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s"' --arg i "$i" docs/superpowers/specs/lighthouse/phase2-mobile-$i.report.json; done
echo "=== FINAL Desktop ==="
for i in 1 2 3; do jq -r '"D\($i): Perf \(.categories.performance.score * 100 | floor)  A11y \(.categories.accessibility.score * 100 | floor)  BP \(.categories["best-practices"].score * 100 | floor)  SEO \(.categories.seo.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s"' --arg i "$i" docs/superpowers/specs/lighthouse/phase2-desktop-$i.report.json; done
```

Expected target: 100/100/100/100 on both devices (medians).

If medians miss 100 in some categories → document the residual gap in Task I2 honestly; don't fudge.

- [ ] **Step 6: Stop server**

```bash
kill $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null
```

---

### Task I2: Update diagnostic-results doc with after-fix scores

**Files:**

- Modify: `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md`

- [ ] **Step 1: Append a new section to the doc**

After the existing Section 6 decision matrix and Artifacts, add:

```markdown
## Section 7 — Phase 2 Implementation After-Fix Scores

**Date:** 2026-05-06
**Implementation PR:** #580
**Implementation spec:** `2026-05-06-home-perf-phase-2-implementation-design.md`

### Mobile (median of 3 runs)

| Category       | Baseline | After Phase 1 | After Phase 2 |
| -------------- | -------: | ------------: | ------------: |
| Performance    |       84 |            84 |          <NN> |
| Accessibility  |      100 |           100 |           100 |
| Best Practices |      100 |           100 |           100 |
| SEO            |      100 |           100 |           100 |
| LCP            |    4.51s |         4.51s |       <X.XX>s |

### Desktop (median of 3 runs)

| Category       | Baseline | After Phase 1 | After Phase 2 |
| -------------- | -------: | ------------: | ------------: |
| Performance    |       98 |            98 |          <NN> |
| Accessibility  |       96 |            96 |          <NN> |
| Best Practices |      100 |           100 |           100 |
| SEO            |      100 |           100 |           100 |
| LCP            |    1.09s |         1.18s |       <X.XX>s |

### Fixes landed

- C1 (Fix #1): <approach a or b/c> — see commit <SHA>
- C2 (Fix #4): browserslist — see commit <SHA>
- C3 (Fix #5): HomePitchDeck → SC — see commit <SHA>
- C4 (Fix #2): Tamagui contrast — see commit <SHA>
- C5 (Fix #3): rainbow restored / DEFERRED (pick one) — see commit <SHA> or note the defer reason

### Residual gap (if any)

(If anything fell short of 100, list here with diagnosis and Phase 3 candidates.)
```

Fill placeholders with actual values + commit SHAs.

- [ ] **Step 2: Commit C6**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum add docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md docs/superpowers/specs/lighthouse/phase2-*
git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
docs(ARC-570): Phase 2 implementation after-fix scores

Update the Phase 2 diagnostic results doc with Section 7: actual
after-fix Lighthouse scores from the 5 implementation commits in
this PR. Final medians:
- Mobile: <100/100/100/100 or actual>
- Desktop: <100/100/100/100 or actual>

Raw Lighthouse JSONs committed under
docs/superpowers/specs/lighthouse/phase2-*.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)" 2>&1 | tail -10
```

---

### Task I3: Update PR #580 description with Phase 2 implementation summary

**Files:** none modified locally; updates the GitHub PR via `gh`.

- [ ] **Step 1: Push commits to remote**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum push origin ARC-570
```

If the pre-push hook fires e2e tests against MongoDB and ALL pass → great. If only the 6 known WebKit sea-battle tests fail (per PR #580 precedent), surface to user and ask for `--no-verify` authorization (per the established pattern). Do NOT `--no-verify` without asking.

- [ ] **Step 2: Update the PR description**

```bash
gh pr edit 580 --body "$(cat <<'EOF'
## Summary

Phase 2 of ARC-570: lifts mobile Lighthouse Performance from 84 to <NN> and desktop A11y from 96 to 100, hitting <100/100/100/100 or document gap> on both devices.

Builds on the Phase 2 diagnostic (also in this PR) which attributed the 4-second mobile LCP delay to 7 separate render-blocking CSS chunks under Lighthouse's simulator network model.

## Phase 2 fixes landed (5 commits)

1. **C1 — Bundle CSS chunks** (`feat`): <approach used> dropped CSS chunk count from 7 to <N>; mobile LCP 5.72s → <X.XX>s; mobile Perf 84 → <NN>; desktop Perf 98 → <NN>.
2. **C2 — Browserslist** (`perf`): pin to ES2020 baseline; clears the legacy-JS Lighthouse audit.
3. **C3 — HomePitchDeck → Server Component** (`refactor`): drops `'use client'` from a no-hook/no-event component.
4. **C4 — Tamagui LinkButton secondary contrast** (`a11y`): token-level color bump; desktop A11y 96 → 100.
5. **C5 — Restore hero rainbow on mobile** (`style`): undoes Phase 1's mobile-hide once Fix #1 made the LCP budget safe. (OR: deferred; `::after` still hides on mobile — explain.)

(Plus C6 docs update with after-fix scores + raw Lighthouse JSONs in `docs/superpowers/specs/lighthouse/phase2-*`.)

## Final scores (medians of 3 runs)

| | Performance | A11y | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Mobile | <NN> | 100 | 100 | 100 |
| Desktop | <NN> | 100 | 100 | 100 |

## Test Plan

- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` all pass per pre-commit hook
- [x] Lighthouse mobile + desktop 3-run medians captured (see `docs/superpowers/specs/lighthouse/phase2-*`)
- [x] Visual scan of Tamagui LinkButton secondary variant on `/`, `/games`, `/settings` — no jarring regressions
- [x] Mobile viewport visual scan — hero rainbow visible/hidden as expected
- [ ] **Reviewer manual check**: load `/` on a real mobile device and confirm hero title visual is acceptable
- [ ] **Reviewer manual check**: confirm secondary LinkButton color in light + dark themes
- [ ] **CI/Reviewer note**: same `--no-verify` consideration as before for the pre-push hook's WebKit sea-battle tests (pre-existing flakiness, separate issue)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Replace placeholders with actual values from Task I2.

---

## Verification Summary

Before claiming Phase 2 complete:

- [ ] All 5 fixes applied (or documented as deferred with reason)
- [ ] Final Lighthouse mobile + desktop 3-run medians captured
- [ ] Diagnostic-results doc Section 7 added with after-fix scores
- [ ] All commits passed pre-commit hook (no `--no-verify` for commits)
- [ ] PR #580 description updated
- [ ] If pre-push e2e fails on the known WebKit sea-battle tests only, surfaced to user for `--no-verify` authorization
- [ ] Mobile median Performance reaches 100 (or residual gap documented in Section 7 with Phase 3 candidates)
- [ ] Desktop median A11y reaches 100

## Notes & gotchas

- **Pre-commit hook is heavy** (~5 min per commit). 5 commits × 5 min = ~25 min of pure hook overhead in this plan. Plan accordingly.
- **Don't try to combine commits** — the gates between them depend on per-commit Lighthouse measurements. Each commit is a checkpoint.
- **If Phase B Step 1 succeeds (cssChunking knob works under Turbopack), great.** If it doesn't, Phase C is the surgical fallback. Don't escalate to Phase 3 (Critters) inside this PR — defer.
- **Visual changes from Fix #2 affect routes outside `/`.** Quick scan during Task F2 Step 3; if anything is broken, that's a stop-the-line moment, revert Fix #2 only.
- **The C5 "relaxed local bar"** (Performance ≥ 95 instead of 100) is intentional. Overall PR still aims for 100; C5 itself is the only fix that can degrade perf, so we accept ≥ 95 _for that commit_ and rely on the cumulative effect to land 100 in the final re-audit.
- **Trace files from earlier phases (~14 MB each)** are already in the repo via the diagnostic commit; this plan adds smaller `.report.json` files (~600 KB each) — not the full traces.
