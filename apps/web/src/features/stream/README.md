# Stream broadcast scenes

Chrome-less pages that a headless browser captures for the 24/7 bot-vs-bot
live stream. English only, no audio in the MVP.

| Route                                                                         | Purpose                                                          |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `/{locale}/stream/{roomId}`                                                   | Game scene: spectates one AI-vs-AI room, board plus HTML overlay |
| `/{locale}/stream/idle?next={gameId}&seconds={n}&last={gameId}&result={text}` | Between games: last result, countdown, next game preview, QR     |

Both accept `?lang=` (only `en` exists, accepted for forward compatibility) and
`?debug=1` (diagnostics strip and the "Reconnecting" badge; never shown
otherwise).

## How the chrome is removed

`src/proxy.ts` tags `/{locale}/stream/**` requests with `x-arcadeum-stream: 1`
and `noindex`. The root layout and `[locale]/layout.tsx` read that header and
render only the language provider: no header, footer, banners, socket registry,
modals, pets widget, daily reward chip, live stats, analytics or skip link.

## Capture guidance

- Use a 1920x1080 viewport (1280x720 also works). The scene is a letterboxed
  16:9 frame sized with `cqw` units, so there is no reflow between sizes.
- Game widgets are laid out on a fixed 1312x874 canvas and scaled to the panel
  (`BoardStage`, `lib/gameLayout.ts`), so capture size does not change layout.
- No backdrop-filter and no looping animation in the overlay.
- The page never shows an error. If the socket drops it keeps the last state;
  a watchdog redials every 5s with no attempt cap.
- The join target is `NEXT_PUBLIC_STREAM_JOIN_URL` (default
  `https://arcadeum.games`). The only token mention is the small "ARC" label:
  keep price, yield and financial claims out of the overlay.

## Game readiness (reviewed at 1280x720 and 1920x1080 with real engine states)

Good: chess, checkers, tic-tac-toe, cascade, go, backgammon, pachisi.

Needs follow-up: hearts and spades (spectators still see the pass-cards and
bid controls), critical (draw/"tap to draw" hints), sea-battle (spectator sees
the ship placement board, not a battle view), cat-dash (dense console, small
text). See `lib/gameLayout.ts` (`verdict`).

## Backend note

`filterSessionForSpectators` only filters logs. Card-game `hands` are present
in the spectator payload; the widgets do not render other players' hands, and
the overlay only reads hand sizes, but a BE-side strip would be safer.
