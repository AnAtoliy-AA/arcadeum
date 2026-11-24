# Shorts analytics feedback loop

Records metadata for every posted short, pulls performance from the Postiz
analytics API later, scores it, and exposes weights for the scenario picker.

## Data

History file (JSON array), default `~/.arcadeum-shorts-analytics/history.json`.

| Env var                             | Default                        | Meaning                                    |
| ----------------------------------- | ------------------------------ | ------------------------------------------ |
| `SHORTS_ANALYTICS_DIR`              | `~/.arcadeum-shorts-analytics` | Data dir                                   |
| `SHORTS_ANALYTICS_FILE`             | `<dir>/history.json`           | History path                               |
| `SHORTS_ANALYTICS_MANIFEST`         | `<dir>/manifest.ndjson`        | Hand-off file from posters                 |
| `SHORTS_ANALYTICS_MIN_AGE_HOURS`    | 24                             | Do not fetch stats for younger posts       |
| `SHORTS_ANALYTICS_MAX_AGE_DAYS`     | 14                             | Stop refreshing older posts                |
| `SHORTS_ANALYTICS_REFRESH_HOURS`    | 12                             | Min gap between fetches per post           |
| `SHORTS_ANALYTICS_MIN_SAMPLES`      | 3                              | Samples per format before weights trust it |
| `POSTIZ_API_KEY`, `POSTIZ_BASE_URL` | existing factory vars          | Credentials (env only, never stored)       |

Record fields: `id, date, game, scenario, format, hook, voice, cta, platforms,
posts[{platform, postId}], stats, statsFetchedAt`.

## How posts get recorded

`daily-runner.js` calls `runAnalyticsHook` after the pipelines (skipped with
`--preview`; errors never fail the run):

1. Ingests the manifest. Posting scripts append one line per video:

   ```js
   const {
     appendManifest,
     postsFromPostizResponse,
   } = require('./analytics/manifest');
   appendManifest({
     game,
     scenario,
     format,
     hook,
     voice,
     cta,
     platforms: ['TikTok'],
     posts: postsFromPostizResponse('tiktok', postizResponse.data), // [{postId}]
   });
   ```

2. If no manifest entry exists for a successful pipeline, records a
   metadata-only fallback (no post ids, so it is never fetched).
3. Refreshes stats for posts 24h+ old (only if `POSTIZ_API_KEY` is set).

Until `gameplay.js` / `factory.js` call `appendManifest`, only the fallback
record is written and no performance can be fetched.

## Scoring and weights

`scoreRecord`: log reach + weighted engagement per view (likes, 2x comments,
3x shares) + link clicks per view (signup proxy) + average view duration.

`getFormatWeights(formats, opts?)` returns `{format: weight}` summing to 1.
Uniform unless at least 2 formats have `>= minSamples` scored posts; weights
keep an exploration floor so no format is starved.

```js
const { getFormatWeights } = require('./analytics');
const weights = getFormatWeights(['hook-a', 'hook-b', 'chess-puzzle']);
```

## Report

```sh
node scripts/shorts-factory/analytics/report.js            # ranking per dimension
node scripts/shorts-factory/analytics/report.js --refresh  # fetch stats first (needs POSTIZ_API_KEY)
node scripts/shorts-factory/analytics/report.js --weekly   # weekly summary text (not sent anywhere)
node scripts/shorts-factory/analytics/report.js --json
```

`weeklySummary(records)` only builds text; hand it to the approval/Telegram
path yourself.

## Dry run / tests

Reading reports and `--preview` runs never call any API. Tests mock HTTP:

```sh
pnpm shorts:analytics:test
SHORTS_ANALYTICS_DIR=$(mktemp -d) pnpm shorts:analytics:report
```

Postiz analytics endpoint used: `GET {POSTIZ_BASE_URL}/analytics/post/{postId}?date={days}`;
label names are mapped leniently (views/impressions, likes, comments, shares,
link clicks, average view duration). Verify against the live instance once.

## Length classes

Posts carry `lengthClass` and `durationSec` (measured). `report.js` prints a
"by length class" section (avg views, avg watch time, completion rate =
avg view duration / video length when both exist). `getLengthWeights()` is
uniform until at least two classes have >= 3 scored posts, then favors the
better class with an exploration floor; the scenario picker uses it.

`record-post.js` is called by `factory.js` and `gameplay.js` right after a
publish: it turns the Postiz create-post responses into one manifest line
(game, format, hook, voice, CTA variant, length class, duration, post ids) via
`appendManifest`. It only writes a local file; it never calls Postiz.
