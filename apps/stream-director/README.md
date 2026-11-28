# Stream Director

24/7 live stream of Arcadeum gameplay (Phase 1: bot vs bot only). A Node
director creates AI-vs-AI rooms, shows them in Chromium on a virtual screen
and pushes that screen plus audio to an RTMP endpoint with ffmpeg.

```
director (rotation) --> BE POST /games/ai-vs-ai  --> room
        |                                            |
        +--> Chromium (xvfb) /en/stream/{roomId} <---+  (spectator, keeps the room alive)
                |  x11grab + PulseAudio sink + music bed
                v
             ffmpeg (libx264/AAC) --> RTMP (STREAM_RTMP_URL/STREAM_KEY)
```

## Contract with the web scenes

- Game: `/{locale}/stream/{roomId}?lang=en`
- Between games: `/{locale}/stream/idle?next={gameId}&seconds={n}&last={gameId}&result={text}`

The scenes live in `apps/web` (worker A). Until they are merged, `--stub`
serves placeholder pages and a fake BE so everything here runs locally.

## Local dry run (no platform needed)

Dry run is the default whenever `STREAM_RTMP_URL` is unset. It writes the same
pipeline to a local mp4 (or `STREAM_DRYRUN_SINK=null`).

```bash
pnpm --filter stream-director build

# Laptop, no BE/web needed (stub pages, synthetic video source):
STREAM_DRYRUN_SECONDS=180 STREAM_PULSE_SOURCE= \
  node apps/stream-director/dist/index.js --stub
# -> ./stream-dry-run.mp4 (override with STREAM_DRYRUN_OUT)

# Env is validated with a zod schema (src/config.ts); invalid values fail fast.
# Against a local stack (pnpm dev) on Linux with xvfb + pulseaudio:
STREAM_BOT_PASSWORD=... STREAM_DRYRUN_SECONDS=300 \
  apps/stream-director/run.sh --dry-run
```

`pnpm stream:dry-run` builds and runs the stub run; `pnpm stream:test` runs the Jest unit tests; `pnpm --filter stream-director lint` and `typecheck` check the code.
On non-Linux machines capture falls back to an ffmpeg test pattern
(`STREAM_CAPTURE=testsrc`); real screen capture needs X11 (xvfb).

## Setup

1. Stream user: `STREAM_BOT_PASSWORD=... node apps/stream-director/dist/setup-stream-user.js`
   registers/verifies `arcadeum_live` (override with `STREAM_BOT_EMAIL`,
   `STREAM_BOT_USERNAME`). Nothing is written to disk. The runner logs in
   with the same env credentials at runtime.
2. Install packages (Debian/Ubuntu, ARM ok): `sudo apt install ffmpeg xvfb pulseaudio pulseaudio-utils`
   and Playwright Chromium: `pnpm --filter web exec playwright install --with-deps chromium`.
   Check `ffmpeg -encoders | grep libx264`.
3. Music: the owner must provide LICENSED tracks in `STREAM_MUSIC_DIR`
   (mp3/m4a/wav/ogg/aac/flac). They are looped forever at low volume. No
   tracks are shipped; without them the stream carries game audio only.
4. systemd: copy `systemd/arcadeum-stream.service` to `/etc/systemd/system/`,
   create `/etc/arcadeum-stream/stream.env` from `stream.env.example`
   (`chmod 600`), put the key in `STREAM_KEY_FILE`, then
   `systemctl enable --now arcadeum-stream`.

## Configuration (env)

| Variable                                                                     | Default                         | Notes                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `STREAM_RTMP_URL`                                                            | unset                           | unset = dry run                                                                              |
| `STREAM_KEY` / `STREAM_KEY_FILE`                                             | unset                           | never logged; file preferred                                                                 |
| `STREAM_PROFILE`                                                             | `standard`                      | `standard` 720p30 3.5 Mbps veryfast, `lite` 720p25 2.5 Mbps ultrafast, `hd` 1080p30 4.5 Mbps |
| `STREAM_RESOLUTION`, `STREAM_FPS`, `STREAM_VIDEO_KBPS`, `STREAM_X264_PRESET` | per profile                     | overrides; keyframe interval is always 2s                                                    |
| `STREAM_NICE`                                                                | 0                               | wraps ffmpeg in `nice -n`                                                                    |
| `STREAM_MOVE_DELAY_MS`                                                       | 2000                            | 1000, 2000 or 5000 (BE enum)                                                                 |
| `STREAM_IDLE_SECONDS`                                                        | 15                              | between-games scene length                                                                   |
| `STREAM_RECYCLE_BROWSER_EVERY`                                               | 10                              | relaunch Chromium every N games                                                              |
| `STREAM_STALL_SECONDS`                                                       | 30                              | restart ffmpeg if frames stall                                                               |
| `STREAM_KILL_FILE` / `STREAM_KILL_SWITCH`                                    | `/var/lib/arcadeum-stream/KILL` | see Ops                                                                                      |
| `STREAM_STATUS_FILE`, `STREAM_STATUS_PORT`                                   | unset                           | health JSON file / 127.0.0.1 HTTP                                                            |
| `STREAM_ALERT_WEBHOOK_URL`                                                   | unset                           | JSON `{text, content, key}`                                                                  |
| `STREAM_WEB_URL`, `STREAM_BE_URL`, `STREAM_LOCALE`                           | localhost                       |                                                                                              |
| `STREAM_SERVICE_TOKEN`                                                       | unset                           | secret (min 24 chars) shared with the BE; see Admin control                                  |
| `STREAM_CONTROL`                                                             | on                              | `0` disables the admin control loop (env settings only)                                      |
| `STREAM_CONTROL_POLL_SECONDS`, `STREAM_STATUS_REPORT_SECONDS`                | 5, 10                           | config/command poll and status report intervals                                              |

Per-game rotation settings (themes, `moveDelayMs`, `maxDurationMs`, `stuckMs`,
optional bot personalities) live in `src/games.ts`. Bot difficulty is chosen by
the BE per game and is not part of the AI-vs-AI request.

## Games always end

Every poll (3s) evaluates the room: completed -> next; `maxDurationMs`
exceeded -> forced skip; no state change for `stuckMs` -> skip; repeated BE
errors -> skip. A skipped room is deleted (best effort), the idle scene is
shown and the next game starts. The rotation is a shuffled bag (all 12 games
per cycle, never the same game twice in a row, themes cycle per game).
texas_holdem and glimworm are excluded.

## Ops

- Kill switch: `touch /var/lib/arcadeum-stream/KILL` stops the stream
  gracefully within about 3s (process stays up so systemd does not flap);
  `rm` it to resume. `STREAM_KILL_SWITCH=1` at start does the same.
- Health: `curl -s localhost:9477` (or the status file) returns current game,
  uptime, last restart reason, ffmpeg fps/frames/restarts.
- Watchdogs: ffmpeg is killed and restarted (backoff 1s to 60s) when frames
  stall or it exits; systemd restarts the whole unit.
- Alerts: ffmpeg restarts, skipped games, create-room failures, kill switch.
  The webhook body works for a Telegram or Discord relay. Cooldown 5 min/key.
- Logs: JSON lines on stdout (`journalctl -u arcadeum-stream -o cat`). Keys,
  passwords and the RTMP URL are redacted.
- Note: ffmpeg receives the RTMP URL (with key) as an argument, so it is
  visible to local users via `ps`. Run on a host without untrusted users.

## Admin control (live stream settings)

Admins control the stream from `/admin/stream` in the web app (Start, Stop,
Skip, settings, audit trail). The director polls the backend and applies it.
The stream key and RTMP URL are **never** stored in the BE or returned by any
API: they stay in this VM's environment (`STREAM_RTMP_URL`, `STREAM_KEY_FILE`).

How it works:

- Every `STREAM_CONTROL_POLL_SECONDS` (5 s) the director calls
  `GET {BE}/stream/config` with `If-None-Match` (cheap `304` when unchanged)
  and `GET {BE}/stream/commands`. Every `STREAM_STATUS_REPORT_SECONDS` (10 s)
  it `POST`s `/stream/status` (state, current game, uptime, fps, restarts,
  last errors, applied config version). The admin page shows the applied
  version next to the saved one, so you can see when it was picked up.
- Auth: `Authorization: Bearer $STREAM_SERVICE_TOKEN` when set (same value in
  the BE env), otherwise the stream user's JWT (`STREAM_BOT_PASSWORD`). Admin
  JWTs are rejected on these endpoints. Without credentials (or with
  `--stub`) the control loop is off and env settings apply as before.
- Remote values are validated with zod. An invalid payload is ignored and
  logged (`ignoring invalid remote config`); the last good config keeps
  running.
- Backend unreachable: the stream keeps running on the last good config (or
  the env defaults), status reports are skipped, an alert is sent after about
  1 minute of failures. The local kill switch file always works and always
  wins, even when the backend says `enabled`.

When a change takes effect:

| Setting                                                                             | Takes effect                                                                                                                             |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Start / Stop (`enabled`), Skip, Restart browser                                     | Within one poll (about 5 s)                                                                                                              |
| Max duration per game                                                               | Live, also for the running game                                                                                                          |
| Enabled games, weights, themes, bot difficulty, bot move delay, pause between games | Next game (nothing is interrupted)                                                                                                       |
| Overlay: join URL, QR, banner text, visible parts                                   | Next scene load (the next idle scene or game start)                                                                                      |
| Resolution, fps, bitrate, x264 preset, music volume, music track allow-list         | Next game boundary: ffmpeg restarts cleanly during the idle scene (a short blip); a resolution change also relaunches the browser window |

Stop: with "finish the current game first" the stream ends after the running
game; without it the stream stops within seconds, exactly like the kill
switch file. Start resumes. The same flag is stored with the settings.

Music track allow-list: names only (file names inside `STREAM_MUSIC_DIR`).
Empty means every track in the folder. If none of the names match a file the
stream runs without music and logs a warning.

Backend env (see `apps/be/.env.example`): `STREAM_SERVICE_TOKEN` (the same
secret), optional `STREAM_BOT_USERNAME` (default `arcadeum_live`).
Generate a token with `openssl rand -hex 32`, put it in the BE environment and
in `/etc/arcadeum-stream/stream.env` (chmod 600). Rotate by changing both and
restarting both services.

Hard limits (clamped by the BE and validated again by the director): bot move
delay 500-8000 ms, max game duration 1-30 min, pause between games 5-120 s,
music volume 0-100, bitrate 1500-6000 kbps, 720p/1080p, 25/30 fps, banner at
most 80 characters (no links or profanity), at least 2 games enabled. Defaults
match the old hard-coded values (720p30, 3500 kbps, veryfast, 2 s delay, 15 s
pause, expert bots, all 12 games with weight 1).

## Resource risk (ESTIMATE, not measured)

Chromium + software x264 at 720p30 on ARM is roughly 1.5 to 2.5 cores and
1.5 to 2.5 GB RAM. On the 3-core OCI VM shared with the BE this is a real
risk. Mitigations: `STREAM_PROFILE=lite` (720p25, ultrafast, 2.5 Mbps),
`STREAM_NICE=10`, the unit's `CPUWeight`/`MemoryMax`, Chromium recycling, or a
dedicated VM. Egress at about 4 Mbps is about 1.3 TB/month. Measure with the
dry run (`STREAM_DRYRUN_SINK=null`) before going live.

## Not in scope (yet)

Real players, voice, captions beyond the web overlay, live translation. The
director is structured (`src/api.ts`, `src/director.ts`) so a "stream user hosts rooms
and bots fill seats" mode can be added later.

## Legal

Overlay and copy must not make price, yield or financial claims; the owner
approves any token messaging. Check the platform's livestream rules for
24/7 bot streams before going live.
