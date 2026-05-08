# Home Perf Phase 2 Diagnostic — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic.md`
**Ticket:** ARC-570
**Goal:** Capture three Chrome Performance traces of the home page production build under Lighthouse's mobile throttling, analyze the 4-second LCP "Render Delay" between FCP and LCP, and write an evidence-backed diagnostic report that names the root cause(s) and recommends specific Phase 2 implementation fixes.

**Architecture:** Single sequential phase (no code changes). Traces are captured by re-running Lighthouse with `--save-assets`, which writes the raw Chrome `*.trace.json` alongside the report — same Chrome under the hood, same throttling, identical trace format the spec calls for, and avoids custom Playwright scripting. Analysis is done by `jq` over the trace JSON plus a small Node helper for callstack extraction. The deliverable is a single Markdown report committed alongside the raw traces.

**Tech Stack:** Lighthouse CLI (already used in Phase 1), `jq`, Node.js for parsing trace events, Markdown for the report.

**Working directory:** `/Users/anatoliyaliaksandrau/js/arcadeum`. The `docs/superpowers/` path is now tracked; specs/plans/lighthouse JSONs commit normally.

---

## Methodology Note (deviation from spec)

The spec calls for "Playwright MCP drives Chrome with the same throttling profile Lighthouse uses". This plan uses **Lighthouse CLI with `--save-assets`** instead, because:

- Lighthouse uses Chromium under the same throttling profile the spec specifies
- `--save-assets` writes the raw `*.trace.json` (Chrome DevTools-compatible) and `*.devtoolslog.json` next to the report — same artifact a Playwright script would produce
- Avoids custom CDP wiring, throttling-emulation code, and tracing-output format conversion
- Three Lighthouse runs with `--save-assets` is one shell command per run vs. ~50 lines of Playwright bootstrap

The trace format is identical; the analysis steps work the same way. The spec's success criteria don't constrain the capture tool — only the artifact and the analysis.

---

## File Inventory

### Created

- `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md` — the diagnostic report (the actual deliverable)
- `docs/superpowers/specs/lighthouse/diag-mobile-1.report.json` — Lighthouse JSON (run 1)
- `docs/superpowers/specs/lighthouse/diag-mobile-1-0.trace.json` — Chrome trace (run 1)
- `docs/superpowers/specs/lighthouse/diag-mobile-1-0.devtoolslog.json` — DevTools log (run 1)
- (× 3 runs total — diag-mobile-1, diag-mobile-2, diag-mobile-3 sets)
- `docs/superpowers/specs/lighthouse/diag-analysis.json` — the extracted timing breakdown used to write the report
- (Optional, only if needed) `apps/web/scripts/diag-extract-trace.mjs` — Node helper for callstack extraction (only if `jq` alone is insufficient; remove from working tree before final commit if not used)

### Modified

- None. This is a diagnostic; no app code changes.

---

## Phase 1 — Capture

### Task 1: Verify environment + start production server

**Files:** none modified.

- [ ] **Step 1: Confirm working dir + branch**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
git status
git branch --show-current
```

Expected: branch `ARC-570` (or a follow-on branch the user created), no committed code-edit deltas pending. Spec docs may show as staged from the user's gitignore-removal commit; that's fine.

- [ ] **Step 2: Confirm port 3500 is free**

```bash
lsof -nP -iTCP:3500 -sTCP:LISTEN 2>/dev/null && echo "STILL UP" || echo "free"
```

Expected: `free`. If `STILL UP`, identify the process (`lsof -nP -iTCP:3500 -sTCP:LISTEN -t | xargs -I{} ps -p {} -o command=`), and ask the user before killing — per Phase 1 precedent.

- [ ] **Step 3: Production build**

```bash
rm -rf /Users/anatoliyaliaksandrau/js/arcadeum/apps/web/.next
pnpm --filter web build 2>&1 | tail -5
```

Expected: build completes (Turbopack, ~30–60s), final route table prints. No build errors.

- [ ] **Step 4: Start production server in background**

```bash
pnpm --filter web start
```

Run via Bash with `run_in_background: true`. Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3500` returns 200 (typically 6–10 seconds).

No commit. This is setup.

---

### Task 2: Capture three traces with `--save-assets` (mobile, the failing device)

**Files:** writes to `docs/superpowers/specs/lighthouse/`

- [ ] **Step 1: Run Lighthouse 3× with `--save-assets` for mobile**

```bash
cd /Users/anatoliyaliaksandrau/js/arcadeum
mkdir -p docs/superpowers/specs/lighthouse
for i in 1 2 3; do
  npx -y lighthouse http://localhost:3500 \
    --form-factor=mobile \
    --throttling-method=simulate \
    --save-assets \
    --output=json \
    --output-path=docs/superpowers/specs/lighthouse/diag-mobile-$i.report.json \
    --chrome-flags="--headless=new" \
    --quiet
done
```

`--save-assets` writes `<output-path-stem>-0.trace.json` and `<output-path-stem>-0.devtoolslog.json` alongside the report. With `--output-path=...diag-mobile-1.report.json`, the trace lands at `...diag-mobile-1-0.trace.json` (note Lighthouse strips one trailing extension to compute the stem).

- [ ] **Step 2: Verify all 9 files exist**

```bash
ls -la docs/superpowers/specs/lighthouse/diag-mobile-*
```

Expected: 9 files total (3 runs × `report.json` + `-0.trace.json` + `-0.devtoolslog.json`). Each `*.trace.json` should be ~10–30 MB.

- [ ] **Step 3: Sanity-check Lighthouse scores match Phase 1**

```bash
for i in 1 2 3; do
  jq -r '"M\($i): Perf \(.categories.performance.score * 100 | floor)  LCP \(.audits["largest-contentful-paint"].numericValue | . / 1000 * 100 | floor / 100)s"' \
    --arg i "$i" \
    docs/superpowers/specs/lighthouse/diag-mobile-$i.report.json
done
```

Expected: scores in the 79–85 range with LCP 4–6s, matching the Phase 1 `after5-mobile-*.json` baseline (Phase 1 also used `--throttling-method=simulate` — same flag, same result expected). If significantly different (e.g., LCP < 3s or > 8s), investigate before continuing — environment may have shifted.

- [ ] **Step 4: Stop the production server**

```bash
kill $(lsof -nP -iTCP:3500 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null
```

No commit yet. Capture is reversible until staged.

---

## Phase 2 — Analysis

### Task 3: Extract LCP timing reference points from Lighthouse JSON

**Files:** writes to `docs/superpowers/specs/lighthouse/diag-analysis.json` (will accumulate findings).

- [ ] **Step 1: Per run, extract the LCP timeline reference points and write a single combined JSON**

```bash
jq -s '
  map({
    run: input_filename | capture("diag-mobile-(?<n>\\d+)").n | tonumber,
    fcp_ms: .audits["first-contentful-paint"].numericValue,
    lcp_ms: .audits["largest-contentful-paint"].numericValue,
    tti_ms: .audits["interactive"].numericValue,
    lcp_phases: .audits["largest-contentful-paint-element"].details.items[1].items,
    lcp_element_selector: .audits["largest-contentful-paint-element"].details.items[0].items[0].node.selector,
    long_tasks: .audits["long-tasks"].details.items,
    bootup_top5: (.audits["bootup-time"].details.items[0:5]),
    network_requests: .audits["network-requests"].details.items,
    render_blocking: .audits["render-blocking-resources"].details.items
  })
' docs/superpowers/specs/lighthouse/diag-mobile-1.report.json \
  docs/superpowers/specs/lighthouse/diag-mobile-2.report.json \
  docs/superpowers/specs/lighthouse/diag-mobile-3.report.json \
  > docs/superpowers/specs/lighthouse/diag-analysis.json
```

- [ ] **Step 2: Verify the file**

```bash
jq '. | length' docs/superpowers/specs/lighthouse/diag-analysis.json
```

Expected: `3` (one entry per run).

```bash
jq '.[1] | {run, fcp_ms, lcp_ms, lcp_element_selector, n_long_tasks: (.long_tasks | length)}' \
  docs/superpowers/specs/lighthouse/diag-analysis.json
```

Expected: a plausible summary for run 2 (should be the median run from Phase 1).

---

### Task 4: Identify long tasks in the LCP window from raw trace

**Files:** queries `docs/superpowers/specs/lighthouse/diag-mobile-*.trace.json` (large files; query carefully).

- [ ] **Step 1: For each run, extract trace events of type 'RunTask' / 'FunctionCall' / 'EvaluateScript' that fall between FCP and LCP**

Trace events are at `.traceEvents[]`. Each event has `ts` (microseconds) and `dur` (microseconds). The trace's t=0 is navigation start. We need to filter to long tasks (`dur > 50000` µs = 50 ms) AND tasks where `ts/1000` falls between `fcp_ms` and `lcp_ms`.

```bash
# Get FCP and LCP for run 2 (median) in microseconds
FCP_US=$(jq '.[1].fcp_ms * 1000 | floor' docs/superpowers/specs/lighthouse/diag-analysis.json)
LCP_US=$(jq '.[1].lcp_ms * 1000 | floor' docs/superpowers/specs/lighthouse/diag-analysis.json)
echo "Run 2: filtering trace events between $FCP_US µs and $LCP_US µs (relative to navigation)"

# Find the navigation start ts in absolute trace time
NAV_START=$(jq '[.traceEvents[] | select(.name == "navigationStart") | .ts] | first' \
  docs/superpowers/specs/lighthouse/diag-mobile-2-0.trace.json)
echo "NavigationStart absolute ts: $NAV_START"

# Filter long tasks in the LCP window (durations > 50ms).
# Restrict to the renderer's main thread by category — keeps compositor /
# network / IO work out of the result so the signal is renderer-side only.
jq --argjson nav "$NAV_START" --argjson fcp "$FCP_US" --argjson lcp "$LCP_US" '
  .traceEvents
  | map(select(
      .ph == "X"
      and .dur != null
      and .dur > 50000
      and (.ts - $nav) > $fcp
      and (.ts - $nav) < $lcp
      and (.cat | test("devtools.timeline|blink.user_timing|v8"))
    ))
  | map({
      name: .name,
      cat: .cat,
      url: (.args.data.url // .args.url // null),
      function: (.args.data.functionName // null),
      relStart_ms: ((.ts - $nav) / 1000 | floor),
      duration_ms: (.dur / 1000 | floor)
    })
  | sort_by(-.duration_ms)
' docs/superpowers/specs/lighthouse/diag-mobile-2-0.trace.json \
  > docs/superpowers/specs/lighthouse/diag-long-tasks-mobile-2.json

jq 'length' docs/superpowers/specs/lighthouse/diag-long-tasks-mobile-2.json
```

Expected: a number (likely 5–15 long tasks). If 0, the LCP window is dominated by something other than long tasks (font swap, layout) — note this and proceed.

- [ ] **Step 2: Repeat for runs 1 and 3**

Same commands, swap the run index. Output to `diag-long-tasks-mobile-1.json` and `diag-long-tasks-mobile-3.json`.

- [ ] **Step 3: Compare long tasks across runs**

```bash
for i in 1 2 3; do
  echo "=== Run $i top long tasks ==="
  jq '.[0:5] | .[] | {name, function, url, relStart_ms, duration_ms}' \
    docs/superpowers/specs/lighthouse/diag-long-tasks-mobile-$i.json
done
```

Look for: (a) URLs / function names that appear in all 3 runs (= consistent bottleneck), (b) URLs that appear in only one run (= noise, ignore).

---

### Task 5: Extract paint events in the LCP window

**Files:** queries `docs/superpowers/specs/lighthouse/diag-mobile-2-0.trace.json`.

- [ ] **Step 1: Pull all `Paint` and `PaintImage` and `firstPaint` / `firstContentfulPaint` / `largestContentfulPaint::Candidate` events**

```bash
NAV_START=$(jq '[.traceEvents[] | select(.name == "navigationStart") | .ts] | first' \
  docs/superpowers/specs/lighthouse/diag-mobile-2-0.trace.json)
LCP_US=$(jq '.[1].lcp_ms * 1000 | floor' docs/superpowers/specs/lighthouse/diag-analysis.json)

jq --argjson nav "$NAV_START" --argjson lcp "$LCP_US" '
  .traceEvents
  | map(select(
      .name == "Paint"
      or .name == "PaintImage"
      or .name == "firstPaint"
      or .name == "firstContentfulPaint"
      or (.name | test("LargestContentfulPaint"; "i"))
      or .name == "RecalculateStyles"
      or .name == "Layout"
    ))
  | map(select((.ts - $nav) > 0 and (.ts - $nav) < ($lcp + 500000)))
  | map({
      name: .name,
      relStart_ms: ((.ts - $nav) / 1000 | floor),
      duration_ms: ((.dur // 0) / 1000 | floor),
      data: .args.data,
      candidate: .args.candidateIndex
    })
  | sort_by(.relStart_ms)
' docs/superpowers/specs/lighthouse/diag-mobile-2-0.trace.json \
  > docs/superpowers/specs/lighthouse/diag-paint-events-mobile-2.json

# Summarize
jq '
  group_by(.name) | map({name: .[0].name, count: length, total_dur_ms: ([.[].duration_ms] | add)})
' docs/superpowers/specs/lighthouse/diag-paint-events-mobile-2.json
```

Expected: a count by event type. Watch for many `RecalculateStyles` or `Layout` events near the LCP — that suggests Tamagui CSS-in-JS hydration is invalidating layout.

- [ ] **Step 2: Identify the LCP candidate timeline**

```bash
jq '
  map(select(.name | test("LargestContentfulPaint"; "i")))
  | sort_by(.relStart_ms)
' docs/superpowers/specs/lighthouse/diag-paint-events-mobile-2.json
```

Expected: a list of LCP candidates over time. The last one is the final LCP element. Note its time and the candidate progression — this tells us if LCP is jumping between elements (font swap) or stuck on one element painting late.

---

### Task 6: Network waterfall analysis in the LCP window

**Files:** queries `docs/superpowers/specs/lighthouse/diag-mobile-2.report.json`.

- [ ] **Step 1: Extract and order network requests by start time, filtering to those that completed before LCP**

```bash
LCP_MS=$(jq '.[1].lcp_ms' docs/superpowers/specs/lighthouse/diag-analysis.json)

jq --argjson lcp "$LCP_MS" '
  .audits["network-requests"].details.items
  | map(select(.startTime < $lcp))
  | sort_by(.startTime)
  | map({
      url: .url,
      mimeType: .mimeType,
      transferSize: .transferSize,
      startTime_ms: (.startTime | floor),
      endTime_ms: (.endTime | floor),
      duration_ms: ((.endTime - .startTime) | floor),
      isLinkPreload: (.isLinkPreload // false),
      priority: .priority,
      finished: .finished
    })
' docs/superpowers/specs/lighthouse/diag-mobile-2.report.json \
  > docs/superpowers/specs/lighthouse/diag-network-mobile-2.json

# Summary: requests by mimeType, sorted by total bytes
jq '
  group_by(.mimeType)
  | map({
      mimeType: .[0].mimeType,
      n: length,
      total_kb: ([.[].transferSize] | add / 1024 | floor),
      slowest_ms: ([.[].duration_ms] | max)
    })
  | sort_by(-.total_kb)
' docs/superpowers/specs/lighthouse/diag-network-mobile-2.json
```

Look for: (a) any `font/woff2` request that landed after FCP but before LCP — that's font-swap-related LCP delay; (b) JS chunks that took > 500 ms to download under throttling; (c) CSS chunks (we know there are 7 render-blocking ones; confirm their cumulative timing).

---

### Task 7: Hero-specific paint timing

**Files:** queries the trace.

- [ ] **Step 1: Look for events that mention the hero element**

```bash
grep -c "hero-heading\|hero-title-shimmer\|hero-content-main" \
  docs/superpowers/specs/lighthouse/diag-mobile-2-0.trace.json
```

Expected: a count > 0. If 0, the hero selector doesn't appear in the trace data (rare).

- [ ] **Step 2: Pull the LCP element data over time**

The LCP element data (`largestContentfulPaint::Candidate` events) include the candidate node. Look for when the `<h1>` first becomes the LCP candidate vs. when its final paint is recorded.

```bash
jq '
  .traceEvents
  | map(select(.name == "largestContentfulPaint::Candidate"))
  | map({
      ts_ms: (.ts / 1000 | floor),
      candidate_index: .args.candidateIndex,
      size: .args.size,
      type: .args.type,
      lcp_node_id: .args.nodeId
    })
  | sort_by(.ts_ms)
' docs/superpowers/specs/lighthouse/diag-mobile-2-0.trace.json
```

Expected: a sequence of LCP candidates with timestamps. Check whether candidates change (different elements) or whether one element gets re-painted.

---

### Task 8: Synthesize root-cause attribution

**Files:** writes `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md`

- [ ] **Step 1: Build the timing attribution timeline**

Using outputs from Tasks 3–7, attribute the 4-second window from FCP to LCP into named buckets. Each bucket gets:

- Time range (ms relative to navigation)
- What's happening (script URL, paint event, network request, etc.)
- Source of the evidence (which extracted JSON contains it)

Example structure (**illustrative shape only — these specific timings and chunk URLs are placeholders, NOT expected outputs; do not anchor on them when you read the actual data**):

```
1350ms (FCP) → 1450ms: idle (just a 100ms gap; no significant activity)
1450ms → 1820ms: render-blocking CSS chunks finishing parse [Lighthouse render-blocking-resources]
1820ms → 2400ms: long task in _next/static/chunks/<hash>.js (~300ms × 4× CPU = ~1200ms simulated) [diag-long-tasks-mobile-2.json item N]
2400ms → 4500ms: ?? — could be font swap / Tamagui layout recalc / Geist load
```

Most of this section is your interpretation of the extracted JSON. The real attribution may differ entirely — many small contributors instead of a few large ones, or one large unexpected source.

- [ ] **Step 2: Write Section 1 of the diagnostic report (Methodology recap)**

One paragraph: tools used (Lighthouse `--save-assets` for traces + jq for analysis), runs (3× mobile, environment), date.

- [ ] **Step 3: Write Section 2: "The 4-second gap, attributed"**

The full timeline from Step 1 above, with citations to the extracted JSON files.

- [ ] **Step 4: Write Section 3: Root cause(s), ranked**

For each cause: 1–2 sentence diagnosis. Rank by contribution to the 4 seconds. Example:

- **Cause A (estimated 1500ms):** Tamagui CSS-in-JS hydration runs in a single long task in chunk `2caea913.js`. Consistent across all 3 runs. Evidence: `diag-long-tasks-mobile-{1,2,3}.json` all show this URL with similar duration.
- **Cause B (estimated 800ms):** 7 render-blocking CSS chunks load synchronously...
- **Cause C (estimated 700ms):** Font swap re-evaluates LCP after Geist loads at 2.5s...
- **Unattributed (estimated 1000ms):** Remaining gap; likely throttling artifact + paint commit latency.

- [ ] **Step 5: Write Section 4: Recommended Phase 2 fixes**

For each cause from Step 4, the specific fix:

- Cause → Fix → Estimated point gain → Complexity → Regression risk → Files affected

This REPLACES the speculative P2-1..P2-9 list in the existing Phase 2 stub with measurement-grounded recommendations. Cite the existing stub IDs where appropriate (e.g., "this corresponds to the Phase 2 stub's P2-3 with stronger evidence").

- [ ] **Step 6: Write Section 5: Hero `::after` restoration plan**

Three sub-options based on the diagnostic findings:

- (a) **Restore as-is** — only viable if the diagnostic shows the LCP cause is unrelated to `::after` and removing the cause would also unblock LCP with `::after` present
- (b) **Restore with workaround** — e.g., apply the rainbow as a separate animated background element (not text-content based), so it can never be picked as LCP
- (c) **Keep hidden on mobile** — accept the visual cut as permanent, document why

For each option: pros, cons, estimated implementation cost, and which Phase 2 fix(es) need to land first.

- [ ] **Step 7: Write Section 6: Decision matrix for next implementation PR**

Table with columns: estimated points / complexity / regression risk / restores rainbow Y/N. Rows: each Phase 2 fix recommendation from Section 4 plus the desktop-A11y color contrast fix (which is independent and should be bundled).

- [ ] **Step 8: Write a footer linking to all the artifact JSONs**

```markdown
## Artifacts

- Lighthouse reports: `docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}.report.json`
- Chrome traces: `docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}-0.trace.json`
- DevTools logs: `docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}-0.devtoolslog.json`
- Extracted summaries: `diag-analysis.json`, `diag-long-tasks-mobile-{1,2,3}.json`, `diag-paint-events-mobile-2.json`, `diag-network-mobile-2.json`
```

---

## Phase 3 — Stage + commit

### Task 9: Stage artifacts + report; commit

**Files:** stages everything under `docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md` and `docs/superpowers/specs/lighthouse/diag-*` plus the spec/plan that were already staged.

- [ ] **Step 1: Inspect the staging state**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum status --short docs/superpowers/
```

Expected: a mix of `A ` (already staged from the user's gitignore-removal) and `??` (the new diag artifacts).

- [ ] **Step 2: Stage the new diagnostic outputs**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum add \
  docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic.md \
  docs/superpowers/plans/2026-05-06-home-perf-phase-2-diagnostic.md \
  docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md \
  docs/superpowers/specs/lighthouse/diag-*
```

- [ ] **Step 3: Sanity-check the diff**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum diff --cached --stat docs/superpowers/specs/lighthouse/diag-*
```

Expected: 9 trace/report/devtoolslog files plus the analysis JSONs. The trace files will be 10–30 MB each — confirm the user is OK with this before committing (they accepted in spec Section 4 risks, but worth a one-line sanity check at this scale).

- [ ] **Step 4: Commit**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum commit -m "$(cat <<'EOF'
docs(ARC-570): home perf Phase 2 diagnostic — root cause of 4s LCP delay

Captures three Chrome Performance traces of the home page under
Lighthouse's mobile throttling profile (CPU 4×, Slow 4G), analyses
what's happening in the 4-second window between FCP (~1.35s) and LCP
(~4.5s) on mobile, and writes a diagnostic report attributing the gap
to specific causes with timing evidence.

Deliverables:
- Diagnostic spec: docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic.md
- Diagnostic plan: docs/superpowers/plans/2026-05-06-home-perf-phase-2-diagnostic.md
- Diagnostic report: docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md
- Raw artifacts: docs/superpowers/specs/lighthouse/diag-mobile-{1,2,3}.*

The report's decision matrix is the input to the next implementation PR
that closes the gap to mobile Performance 100.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

The pre-commit hook will run the full pipeline (~5 min). It must pass — no app code changed, but the hook still runs build + tests + doc-link check on every commit.

If the doc-link check flags any broken links in the new markdown, fix them and re-commit (do not `--no-verify`).

- [ ] **Step 5: Verify commit**

```bash
git -C /Users/anatoliyaliaksandrau/js/arcadeum log --oneline -1
git -C /Users/anatoliyaliaksandrau/js/arcadeum status --short
```

Expected: latest commit shows the `docs(ARC-570)` message. Status shows clean (or only files NOT in this scope still uncommitted).

---

## Verification Summary

Before claiming the diagnostic is done:

- [ ] All 9 Lighthouse / trace / devtoolslog files exist for 3 mobile runs
- [ ] `diag-analysis.json` summarizes all 3 runs
- [ ] `diag-long-tasks-mobile-{1,2,3}.json` exist and show the long tasks in the LCP window for each run
- [ ] `diag-paint-events-mobile-2.json` and `diag-network-mobile-2.json` exist for the median run
- [ ] The report at `2026-05-06-home-perf-phase-2-diagnostic-results.md` has all 6 mandatory sections
- [ ] Section 2 (the timeline) accounts for AT LEAST 70% of the 4-second window with named buckets, not "unattributed"
- [ ] Section 3 lists at least one root cause with consistent evidence across all 3 runs
- [ ] Section 5 gives a clear yes/no/conditional answer on hero rainbow restoration with rationale
- [ ] Section 6 decision matrix is filled — every row has all four columns populated
- [ ] Pre-commit hook passes
- [ ] Commit landed

## Notes & gotchas

- **The trace files are LARGE** (10–30 MB each, 30–90 MB total). This may visibly bloat `docs/superpowers/specs/lighthouse/`. The spec's risk table addresses this. If file size becomes a concern, a follow-up can compress them or move to git-lfs.
- **`jq` is fast enough** for queries on the trace files at this size. If a query takes > 30 seconds, switch to a Node.js `JSON.parse` + filter approach.
- **Don't assume the LCP element is `<h1>`** — the trace may show the LCP element switching as the page progresses (font swap, animation completion). Track candidates over time, not the final selector alone.
- **Throttling may produce different LCP timings than Phase 1** runs (which used the same throttling but were on a different build state). Treat the absolute numbers as approximate; the relative breakdown is what matters.
- **If the diagnostic surfaces no clear cause** (e.g., long tasks total < 1s of the 4s window, no obvious culprit), escalate to Approach 3 from the brainstorm: webpack-mode bundle analyzer + React DevTools profiler. This becomes a new diagnostic with its own spec/plan.
