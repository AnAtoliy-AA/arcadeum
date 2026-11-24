# Shorts scenarios

Content and variety layer for the daily gameplay short. Everything here is
plain Node (no deps for the logic, Playwright only for capture).

- `schema.js`: scenario contract (`hook`, `voiceScript`, `caption`, `dramaticMoment` as `step` or `timestamp`, `seed`).
- `library.js`: per game copy and scenario pool builder (game x format x theme).
- `picker.js`: daily pick. Rotates games, formats, themes; avoids repeats in the last N days
  (`history.js`, file `scripts/shorts-factory/.state/scenario-history.json`, override with
  `SHORTS_SCENARIO_HISTORY_FILE`); weights formats by analytics when
  `../analytics` exports `getFormatWeights()` (any failure means uniform weights).
- `puzzles.js` / `replay-source.js`: chess puzzles from `GET /chess/puzzles/random` (bundled
  fallback) and real finished games from `GET /games/replays` (captures, combos, comebacks, last move wins).
  API base: `SHORTS_API_URL`, `NEXT_PUBLIC_API_URL` or `API_URL`.
- `scene-html.js` / `capture.js`: 1080x1920 scenes (board centered and large, countdown, fast forward,
  slow motion and zoom on the key move), retries on failure.
- `gameplay-flow.js`: glue used by `gameplay.js`; writes `<short>.scenario.json` sidecar with
  `hook`, `voiceScript`, `dramaticMomentSec` for the render step.

## Dry run (records locally, never posts, never writes history)

    pnpm shorts:dry-run -- --format puzzle --theme cyberpunk
    pnpm shorts:dry-run -- --game chess --format guess_the_move --out /tmp/shorts
    pnpm shorts:dry-run -- --date 2026-12-01 --no-record     # just print the pick

`bot_match` delegates to `gameplay.js --preview` (needs the web app running). Tests: `pnpm shorts:test`.

## Length classes

Scenarios carry `lengthClass`, `durationSec`, `beats` and (for medium and up) a
structured `voiceScript` with a short `spokenHook`. See `../length/README.md`.
`--length short|medium|long` and `--feature` work on `dry-run.js`, `gameplay.js` and `daily-runner.js`.
