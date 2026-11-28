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
