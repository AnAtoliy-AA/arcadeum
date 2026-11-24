# Video length classes

The allowed video length is a per-format setting, not a fixed 15-30s.

| class   | range    | target | notes                                              |
| ------- | -------- | ------ | -------------------------------------------------- |
| short   | 15-25s   | 20s    | one idea, hook then payoff (legacy one line voice) |
| medium  | 35-50s   | 42s    | real setup and build-up before the reveal          |
| long    | 60-90s   | 75s    | several build-up beats, reveal, recap              |
| feature | 120-180s | 150s   | weekly YouTube story, opt-in only (`--feature`)    |

Per-format defaults live in `classes.js` (`FORMAT_LENGTHS`, default first):
`guess_the_move` stays short; `puzzle` is medium/short/long; `comeback` and
`replay_highlight` are medium/long; `bot_match` and `last_second_win` are
short/medium; `feature_story` is feature only.

## Structure (not padding)

`structure.js` plans a beat timeline per class: **hook** (on screen at frame 0,
ends by 1.5s, spoken hook of at most 5 words), **setup**, **build_up** (hints,
stakes, fast-forward through the real moves), **reveal**, optional **recap** /
**resolution**, **CTA**. `beat-lines.js` holds the spoken lines; each class
uses more distinct lines, never repeats one. `scenarios/timing.js` turns the
beats into scene pacing (countdown with one hint at a time, longer fast-forward
lead-in, slower reveal). The scenario schema (`scenarios/schema.js`) rejects a
length class the format does not allow, a duration outside the class range, a
hook beat that ends after 1.5s, and a voice script that does not fit.

## Length experiment

`assign.js` (used by `scenarios/picker.js`) rotates or randomizes the class for
formats that support more than one. It skips the class used last for the same
format, and weights the rest with `getLengthWeights()` from analytics, which is
uniform until at least two classes have >= 3 scored posts. The chosen class and
actual duration are written to the scenario history and, through the manifest,
to the analytics history (`lengthClass`, `durationSec`). The daily picker never
assigns `feature`.

## QA gate

`render/qa.js` checks duration against the class range
(`evaluateQuality(metrics, { lengthClass })`); `renderShort({ lengthClass,
voiceScript })` sets the main segment bounds and spoken line budget. Without a
class the legacy 15-30s window applies (showcase factory).

## Dry runs (record locally, never post, never touch Postiz)

    pnpm shorts:dry-run -- --format puzzle --length medium --no-record   # print the plan only
    pnpm shorts:dry-run -- --format puzzle --length long --out /tmp/shorts
    pnpm shorts:dry-run -- --feature --game chess --no-record            # weekly 2-3 min story plan
    pnpm shorts:gameplay:preview -- --game chess --length medium         # live bot_match, no posting
    pnpm shorts:gameplay:preview -- --game chess --feature               # feature, no posting
    pnpm shorts:daily:preview -- --gameplay-only --length long           # daily runner, no posting
    pnpm shorts:daily:preview -- --gameplay-only --feature               # adds the weekly feature run
    pnpm shorts:render:dry-run                                           # render + QA of a sample

`--length short|medium|long` forces a class the format supports. `--feature`
is the only way to generate the feature; it posts to YouTube only (never
Instagram, TikTok or X) and only outside `--preview`.

Tests: `pnpm shorts:length:test`, `pnpm shorts:test`, `pnpm shorts:render:test`.
