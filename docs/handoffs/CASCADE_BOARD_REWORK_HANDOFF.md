# Cascade Board — Modern Card Rework (ARC-760 follow-up)

> **For:** Claude Code, working on the in-game Cascade widget
> **Visual reference:** `Cascade Board.html` (fully playable preview vs. bots — open it and play a round)
> **Scope:** Frontend restyle of the Cascade play surface. **No game logic, aria-labels, data-testids, or engine changes.** > **Supersedes:** the card treatment shipped in PR #772. Keeps that PR's structure (fan, pods, stacked piles, glass turn bar, blurred picker) but **replaces the card faces.**

---

## TL;DR — why this exists

PR #772 modernized the board but the card faces landed on the **UNO look**: a tilted white center oval, flat primary-color faces, corner indices. That reads as a clone of a copyrighted physical deck and clashes with Arcadeum's dark-neon brand.

This rework keeps every layout/motion win from #772 and **only changes the card visual language** to something original and on-brand:

> **Dark glass "energy cards."** Colour identity reads through a **luminous coloured edge + glowing numeral + faint oversized ghost glyph**, on a consistent dark body — never a flat colour flood with a white oval. Wilds get a **prismatic aura** instead of a flat face.

Everything else (overlapping hand fan, opponent glass pods with scaled fanned backs, stacked draw/discard decks, glass turn bar, blurred wild picker, `prefers-reduced-motion` fallbacks) stays as-is.

---

## Files to touch

```
apps/web/src/widgets/CascadeGame/ui/
├── CascadeGame.module.css   REWRITE the .card / .swatch face rules (see below)
├── Card.tsx                 MINOR — drop the centre-oval node, add a ghost glyph + wild flag
├── ColorPicker.tsx          UNCHANGED markup (picker swatches restyle is pure CSS)
├── CascadeBoard.tsx         UNCHANGED
└── TurnBadge.tsx            UNCHANGED
```

The prototype mirrors these as `cascade/components.jsx` (≈ `Card.tsx`) and `cascade/board.css` (≈ `CascadeGame.module.css`). Lift values directly from `cascade/board.css`.

---

## The card system

### Construction (per card)

```
┌───────────────────────┐
│ 7                     │  ← corner index: colour-mixed text + soft colour glow
│                       │
│        ⏹  7           │  ← ghost glyph (huge, ~0.16 opacity) behind
│          ▏            │     main glyph (bright colour-mix + colour text-glow)
│                       │
│                     7 │  ← bottom-right index, rotated 180°
└───────────────────────┘
   dark glass body
   + colour-tinted top glow
   + 1.6px colour edge
   + slim inner frame
```

Three text layers share the same symbol: **ghost** (depth), **main glyph** (centre), **two corner indices**. No white oval.

### Tokens (already flow in from the board root + per-card)

Inline on each card: `--card-bg` = the colour hex (`theme.palette[card.color]`, aliased to `--face` in CSS).
On the board root (`CascadeBoard`): `--cascade-card-text`, plus this rework reads the theme **accent** for the playable glow — pass it down as `--cascade-accent` / `--cascade-accent-rgb` from `theme.ts` (see "Theme additions").

### CSS — replace `.card` and its parts

```css
/* dark glass body, colour reads via edge + tint, NOT a flood */
.card {
  /* was: white-oval + colour-flood gradient */
  --face: var(--card-bg, #221c47);
  position: relative;
  border-radius: 14%;
  background: radial-gradient(
      125% 78% at 50% -8%,
      color-mix(in srgb, var(--face) 42%, transparent),
      transparent 56%
    ),
    linear-gradient(158deg, #262c3c 0%, #141a28 52%, #0a0d16 100%);
  border: 1.6px solid color-mix(in srgb, var(--face) 76%, white 8%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 18px color-mix(in srgb, var(--face) 26%, transparent),
    0 4px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.card::after {
  /* slim luminous inner frame */
  content: '';
  position: absolute;
  inset: 8%;
  border-radius: 12%;
  border: 1px solid
    color-mix(in srgb, var(--face) 32%, rgba(255, 255, 255, 0.08));
  pointer-events: none;
}
.ghost {
  /* big faint background glyph (NEW node) */
  position: absolute;
  left: 50%;
  top: 56%;
  transform: translate(-50%, -50%);
  font-weight: 900;
  line-height: 1;
  z-index: 1;
  pointer-events: none;
  color: color-mix(in srgb, var(--face) 60%, white 10%);
  opacity: 0.16;
}
.centerGlyph {
  /* was a tilted translucent oval wrapper */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-weight: 900;
  letter-spacing: -1px;
  color: color-mix(in srgb, var(--face) 52%, white 48%);
  text-shadow:
    0 0 14px color-mix(in srgb, var(--face) 75%, transparent),
    0 1px 2px rgba(0, 0, 0, 0.6);
}
.corner {
  /* colour-mixed, soft glow — not plain white */
  position: absolute;
  z-index: 2;
  font-weight: 800;
  line-height: 1;
  color: color-mix(in srgb, var(--face) 55%, white 45%);
  text-shadow: 0 0 6px color-mix(in srgb, var(--face) 70%, transparent);
}
.cornerTL {
  top: 8%;
  left: 10%;
}
.cornerBR {
  bottom: 8%;
  right: 10%;
  transform: rotate(180deg);
}

/* WILD — prismatic aura on dark glass, not a single colour */
.card.wild {
  background: conic-gradient(
      from 200deg at 50% 118%,
      rgba(244, 63, 94, 0.55),
      rgba(251, 191, 36, 0.55),
      rgba(34, 197, 94, 0.55),
      rgba(59, 130, 246, 0.55),
      rgba(168, 85, 247, 0.55),
      rgba(244, 63, 94, 0.55)
    ),
    linear-gradient(158deg, #262c3c 0%, #131826 50%, #0a0d16 100%);
  background-blend-mode: screen, normal;
  border-color: rgba(255, 255, 255, 0.55);
}
.card.wild .centerGlyph,
.card.wild .corner {
  color: #fff;
  text-shadow:
    0 0 16px rgba(255, 255, 255, 0.7),
    0 1px 2px rgba(0, 0, 0, 0.6);
}
.card.wild .ghost {
  color: #fff;
  opacity: 0.12;
}

/* playable glow now keyed off the THEME ACCENT, not hard-coded amber */
.playable {
  border-color: color-mix(in srgb, var(--cascade-accent, #a78bfa) 90%, white);
  box-shadow:
    0 0 0 2px rgba(var(--cascade-accent-rgb, 167, 139, 250), 0.55),
    0 0 20px rgba(var(--cascade-accent-rgb, 167, 139, 250), 0.45),
    0 6px 16px rgba(0, 0, 0, 0.4);
  animation: cascade-playable 1600ms ease-in-out infinite; /* keep existing keyframes, swap colours to accent */
}

/* dimmed (non-playable, your turn): cards are already dark — keep it gentle */
.disabled {
  opacity: 0.82;
  filter: saturate(0.9);
} /* was brightness(.55) — too dark on a dark card */
```

> **Face-down `.faceDown`** stays essentially as PR #772 had it (dark + accent stripes). It was never UNO-like; leave it, optionally swap its tint to the accent token.

### `Card.tsx` markup change

Remove the empty centre-oval span, add the ghost glyph, and add the wild class:

```tsx
const isWild =
  !faceDown && (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR');

const className = [
  styles.card,
  faceDown && styles.faceDown,
  isWild && styles.wild, // NEW
  isClickable && styles.clickable,
  playable && styles.playable,
  selected && styles.selected,
  disabled && !faceDown && styles.disabled,
]
  .filter(Boolean)
  .join(' ');

// inside the face (not faceDown):
<>
  <span
    aria-hidden
    className={styles.ghost}
    style={{
      fontSize: (card.kind === 'NUMBER' ? dims.glyph : dims.glyph * 0.82) * 1.9,
    }}
  >
    {symbol}
  </span>
  <span
    aria-hidden
    className={`${styles.corner} ${styles.cornerTL}`}
    style={{ fontSize: dims.corner }}
  >
    {symbol}
  </span>
  <span
    aria-hidden
    className={styles.centerGlyph}
    style={{
      fontSize: card.kind === 'NUMBER' ? dims.glyph : dims.glyph * 0.82,
    }}
  >
    {symbol}
  </span>
  <span
    aria-hidden
    className={`${styles.corner} ${styles.cornerBR}`}
    style={{ fontSize: dims.corner }}
  >
    {symbol}
  </span>
</>;
```

The old `.centerGlyph > span { transform: rotate(32deg) }` counter-rotation can be deleted — there's no tilted oval anymore.

---

## Wild colour picker (CSS only)

`ColorPicker.tsx` markup is unchanged. Restyle `.swatch` in the module to match the new cards so the dialog reads as the same deck:

```css
.swatch {
  --face: var(--swatch-bg, #221c47);
  background: radial-gradient(
      125% 78% at 50% -8%,
      color-mix(in srgb, var(--face) 45%, transparent),
      transparent 56%
    ),
    linear-gradient(158deg, #262c3c, #141a28 52%, #0a0d16);
  border: 1.6px solid color-mix(in srgb, var(--face) 78%, white 8%);
  color: color-mix(in srgb, var(--face) 50%, white 50%);
  box-shadow:
    inset 0 0 18px color-mix(in srgb, var(--face) 28%, transparent),
    0 4px 12px rgba(0, 0, 0, 0.45);
}
.swatch::after {
  /* inner frame, matches cards */
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 9px;
  border: 1px solid
    color-mix(in srgb, var(--face) 30%, rgba(255, 255, 255, 0.08));
  pointer-events: none;
}
```

Show the **themed colour name** in the swatch (`theme.colorNames[c]` → "Red Giant", "Pulsar", …) rather than the bare `R/Y/G/B`. The prototype does this and it sells the variant; keep the `aria-label="Pick {color}"` exactly as-is.

---

## Theme additions (`lib/theme.ts`)

The playable glow and centre ring should use each variant's **accent**, so add two tokens per theme and surface them on the board root:

```ts
// add to CascadeThemeTokens
accent: string;       // hover/glow colour
accentRGB: string;    // same colour as "r,g,b" for rgba()

// suggested values
cosmic:    { accent: '#a78bfa', accentRGB: '167,139,250' }
arcane:    { accent: '#e879f9', accentRGB: '232,121,249' }
cyberpunk: { accent: '#22d3ee', accentRGB: '34,211,238'  }
elemental: { accent: '#fbbf24', accentRGB: '251,191,36'  }
```

In `CascadeBoard.tsx`, add to the existing inline custom-prop style block:

```tsx
'--cascade-accent': theme.accent,
'--cascade-accent-rgb': theme.accentRGB,
```

`TurnBadge`'s active-color chip and the opponent avatar discs already use `theme.palette` — fine to leave; those are small UI dots, not card faces.

---

## Optional — a second face style

The prototype ships a `data-cardstyle` switch with two **both-dark** options the design team can A/B:

- **`neon`** (default, documented above) — colour edge + glow on near-black glass.
- **`aurora`** — same body with a colour sweep pooling in the lower-left/upper-right corners (radial gradients of `--face`), slightly more colour presence.

If you want it in-app, drive it off `room.gameOptions` (or a user setting) and gate with a `data-cardstyle` attribute on the board root. Not required to ship the rework — `neon` alone resolves the UNO problem.

---

## Do NOT change

- Game logic, deck rules, stacking, the last-card "Cascade!" race.
- `aria-label`s, `role="dialog"`, `data-testid`s (`cascade-turn-avatar`, etc.).
- The hand-fan math, pod fan scaling, stacked-pile offsets, turn-bar layout, picker backdrop/animation — all from #772, all kept.
- `prefers-reduced-motion` block — keep it; the new glow/animation names map 1:1 to the existing ones.

## Acceptance check

1. No card shows a white centre oval; no flat primary-colour face.
2. Card colour is legible at a glance via edge + numeral glow on the dark body.
3. Wild / Wild +4 render with the prismatic aura.
4. Playable-card glow matches the active variant's accent (purple cosmic, magenta arcane, cyan cyberpunk, amber elemental).
5. Cascade unit tests (`Card`, `CascadeBoard`) still pass; `tsc --noEmit` and ESLint clean.
