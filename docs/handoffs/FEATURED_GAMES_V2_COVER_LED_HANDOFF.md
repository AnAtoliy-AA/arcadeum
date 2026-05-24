# Featured Games — V2 Cover-led Card · Implementation

> **For:** Claude Code, working on the home page Featured Games section
> **Visual reference:** `Featured Games Cards.html` → middle variant ("V2 — Cover-led")
> **Scope:** Frontend-only restyle of the featured-game card. Data model, routing, gameplay code unchanged. One new field on the game record (`accentColor`) + one new symbol asset per game.
> **Why V2 (vs V1/V3):** Cover-led is the art-forward direction — large visual panel takes the top of the card, title floats on the art, refined mint solid CTA underneath. It's the most "store / gaming" feel of the three, while still calmer than today's loud yellow-glow design. Best long-term direction once real key art lands; the placeholder we ship now slots out cleanly when art arrives.

---

## TL;DR — what changes

The current card has three loud problems. V2 fixes them like this:

1. **Rainbow gradient title** → plain weight-600 Space Grotesk title **on the cover**, white with a subtle text-shadow so it reads over the art.
2. **Glowing yellow "Play Now" brick** → flat mint solid (`--accent`) with a play triangle and ink-on-mint text. No glow, no gradient.
3. **Inconsistent heights / empty space** → cover is a fixed 200px; the body's `flex-direction: column` + CTA-at-bottom keeps every card the same total height regardless of description length.

Plus:

- **Emoji removed.** Each game ships a small abstract SVG symbol (line-art, `currentColor`) centered in the cover. Slots out for real key art later — same component, just swap the `<Symbol/>` child for an `<img>`.
- **Genre + pace fused** into a single glassy pill in the cover's top-left (`Card · Strategy`) with a glowing dot in the game tint.
- **Demo badge** demoted from a gradient lozenge to a small rounded pill in the cover's top-right.
- **Tag chip soup** removed — meta becomes a tight 3-item row beneath the desc (`2–6 players · 10 min match · 540 playing now`).
- **Lonely `?` circle** absorbed into a quiet ghost icon button next to the CTA.

---

## Anatomy

```
┌──────────────────────────────────────────┐
│ ┌─Card·Strategy─┐               ┌─Demo─┐ │  ← 200px cover, radial in --game-accent
│                                          │     + diagonal stripe placeholder
│                  ╲╳╱   ← game symbol     │     (line-art SVG, currentColor)
│                  ╳╳╳                     │
│                                          │
│            Critical                      │  ← title floats on art (z:1, shadow)
├──────────────────────────────────────────┤
│ A strategic card game where you avoid    │  ← 14px desc, min-height 42px
│ critical hazards.                        │
│                                          │
│ 3–5 players  ·  15 min match  ·  1.2k    │  ← 12.5px meta row (b: stat, normal: label)
│ playing now                              │
│                                          │
│ ┌──────────────────────────┐ ┌─────────┐ │
│ │ ▶ Play now               │ │   ⓘ    │ │  ← mint solid CTA + ghost info button
│ └──────────────────────────┘ └─────────┘ │
└──────────────────────────────────────────┘
```

Vertical rhythm: **cover 200** + body padding `16 18 18` + gap `14` between desc / meta / foot. Card border-radius `20`, body radius inherits via overflow.

---

## Files

```
apps/web/src/widgets/HomeFeaturedGames/
├── FeaturedGameCard.tsx          REWRITE
├── FeaturedGamesSection.tsx      MINOR — header + carousel wiring
├── featured-games.module.css     REWRITE (or whatever the current style file is)
├── symbols/                      NEW
│   ├── CriticalSymbol.tsx
│   ├── SeaBattleSymbol.tsx
│   ├── GlimwormSymbol.tsx
│   └── index.ts
└── types.ts                      MINOR — add accentColor, monogram
```

If the section currently lives directly inside `app/page.tsx` (or anywhere else) — grep for `"growing library of tabletop experiences"` and refactor whatever component renders the row into `HomeFeaturedGames/` first.

---

## TSX — `FeaturedGameCard.tsx`

```tsx
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ACCENT, SYMBOL } from './gameMeta';
import styles from './featured-games.module.css';

interface Props {
  game: {
    id: 'critical' | 'sea_battle' | 'glimworm';
    slug: string;
    name: string;
    description: string;
    genre: string; // "Card", "Board", "Arcade"
    pace: string; // "Strategy", "Real-time"
    players: string; // "3–5"
    duration: string; // "15 min"
    playingNow: number | null;
    isDemo: boolean;
  };
}

export function FeaturedGameCard({ game }: Props) {
  const { t } = useTranslation();
  const Symbol = SYMBOL[game.id];
  const accent = ACCENT[game.id];

  return (
    <article
      className={styles.card}
      style={{ ['--game-accent' as any]: accent }}
    >
      <div className={styles.cover}>
        <span className={styles.cornerPill}>
          <span className={styles.dot} aria-hidden />
          {game.genre} · {game.pace}
        </span>

        {game.isDemo && (
          <span className={styles.demo} aria-label={t('featured.demoLabel')}>
            {t('featured.demo')}
          </span>
        )}

        <Symbol className={styles.symbol} aria-hidden />

        <h3 className={styles.title}>{game.name}</h3>
      </div>

      <div className={styles.body}>
        <p className={styles.desc}>{game.description}</p>

        <ul className={styles.meta}>
          <li>
            <b>{game.players}</b> {t('featured.players')}
          </li>
          <li>
            <b>{game.duration}</b> {t('featured.match')}
          </li>
          {game.playingNow != null && (
            <li>
              <b>{formatCount(game.playingNow)}</b> {t('featured.playingNow')}
            </li>
          )}
        </ul>

        <div className={styles.foot}>
          <Link href={`/games/${game.slug}`} className={styles.cta}>
            <PlayTriangle aria-hidden />
            {game.isDemo ? t('featured.tryDemo') : t('featured.playNow')}
          </Link>
          <button
            type="button"
            className={styles.info}
            aria-label={t('featured.howToPlay')}
          >
            <InfoIcon aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function PlayTriangle() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <polygon points="6 4 20 12 6 20" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
```

---

## CSS — `featured-games.module.css`

```css
.card {
  --game-accent: var(--accent); /* fallback to theme accent if game omits one */

  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: var(--bg-elev);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 24px 40px -22px rgba(0, 0, 0, 0.7);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease;
  isolation: isolate;
}
.card:hover {
  transform: translateY(-3px);
  border-color: color-mix(
    in srgb,
    var(--game-accent) 30%,
    var(--glass-border-hover)
  );
}

/* --- cover --- */
.cover {
  position: relative;
  height: 200px;
  display: flex;
  align-items: flex-end;
  padding: 18px;
  background: radial-gradient(
      120% 80% at 30% 20%,
      color-mix(in srgb, var(--game-accent) 35%, transparent),
      transparent 60%
    ),
    radial-gradient(
      80% 80% at 100% 100%,
      color-mix(in srgb, var(--game-accent) 12%, transparent),
      transparent 60%
    ),
    repeating-linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.03) 0 2px,
      transparent 2px 16px
    ),
    #08191a;
}
.cover::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 60%;
  background: linear-gradient(
    180deg,
    transparent,
    color-mix(in srgb, var(--bg-elev) 90%, transparent)
  );
  pointer-events: none;
}

.symbol {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -65%);
  width: 108px;
  height: 108px;
  color: color-mix(in srgb, var(--game-accent) 82%, white 12%);
  filter: drop-shadow(
    0 6px 28px color-mix(in srgb, var(--game-accent) 30%, transparent)
  );
}

.title {
  position: relative; /* lifts above cover ::after gradient */
  z-index: 1;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 26px;
  letter-spacing: -0.015em;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}

.cornerPill {
  position: absolute;
  top: 14px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--game-accent) 80%, white);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid color-mix(in srgb, var(--game-accent) 35%, transparent);
  border-radius: 999px;
  padding: 4px 9px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--game-accent);
  box-shadow: 0 0 8px var(--game-accent);
}

.demo {
  position: absolute;
  top: 14px;
  right: 14px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0b0f12;
  background: #fde68a;
  padding: 4px 9px;
  border-radius: 999px;
  font-weight: 700;
}

/* --- body --- */
.body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.desc {
  margin: 0;
  color: var(--color);
  font-size: 14px;
  line-height: 1.5;
  min-height: 42px; /* keeps cards aligned when descriptions differ */
}

.meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--color-muted);
  font-size: 12.5px;
}
.meta li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.meta b {
  color: var(--color);
  font-weight: 500;
}

.foot {
  display: flex;
  gap: 8px;
  margin-top: auto; /* anchors CTA to bottom */
}

.cta {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 10px;
  background: var(--accent);
  color: #06141a;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.01em;
  border: 0;
  text-decoration: none;
  cursor: pointer;
  transition:
    filter 0.18s,
    transform 0.18s;
}
.cta:hover {
  filter: brightness(1.08);
}
.cta:active {
  transform: translateY(1px);
}
.cta:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.info {
  padding: 11px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border-hover);
  color: var(--color-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: color 0.15s;
}
.info:hover {
  color: var(--color-strong);
}
.info:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## `gameMeta.ts` — accent + symbol mapping

```ts
import type { ComponentType, SVGProps } from 'react';
import { CriticalSymbol } from './symbols/CriticalSymbol';
import { SeaBattleSymbol } from './symbols/SeaBattleSymbol';
import { GlimwormSymbol } from './symbols/GlimwormSymbol';

export type GameId = 'critical' | 'sea_battle' | 'glimworm';

export const ACCENT: Record<GameId, string> = {
  critical: '#f97316', // orange — keeps the warm tone of today's gradient
  sea_battle: '#38bdf8', // sky — matches the page's --accent family
  glimworm: '#a78bfa', // violet — keeps the cool tone of today's gradient
};

export const SYMBOL: Record<GameId, ComponentType<SVGProps<SVGSVGElement>>> = {
  critical: CriticalSymbol,
  sea_battle: SeaBattleSymbol,
  glimworm: GlimwormSymbol,
};
```

If product wants accent + monogram on the game record itself, add to the DB or the `games` config table instead — but a static map is fine for v1 since only three games exist.

---

## Symbol components

All three are stroked with `currentColor` so the wrapper's `color: …` propagates. Drop these straight into `symbols/`.

### `symbols/CriticalSymbol.tsx`

```tsx
import type { SVGProps } from 'react';

export function CriticalSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect
        x="14"
        y="10"
        width="28"
        height="42"
        rx="4"
        transform="rotate(-8 28 31)"
      />
      <rect
        x="22"
        y="12"
        width="28"
        height="42"
        rx="4"
        transform="rotate(6 36 33)"
      />
      <line x1="30" y1="22" x2="42" y2="34" />
      <line x1="42" y1="22" x2="30" y2="34" />
    </svg>
  );
}
```

Two overlapping cards with an X — reads as "card game with hazard" without leaning on the bomb emoji.

### `symbols/SeaBattleSymbol.tsx`

```tsx
import type { SVGProps } from 'react';

export function SeaBattleSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="12" y="12" width="40" height="40" rx="3" />
      <line x1="22" y1="12" x2="22" y2="52" />
      <line x1="32" y1="12" x2="32" y2="52" />
      <line x1="42" y1="12" x2="42" y2="52" />
      <line x1="12" y1="22" x2="52" y2="22" />
      <line x1="12" y1="32" x2="52" y2="32" />
      <line x1="12" y1="42" x2="52" y2="42" />
      <circle cx="27" cy="27" r="3" fill="currentColor" stroke="none" />
      <circle
        cx="47"
        cy="47"
        r="3"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
      />
    </svg>
  );
}
```

4×4 grid with a hit-peg and a faded miss-peg.

### `symbols/GlimwormSymbol.tsx`

```tsx
import type { SVGProps } from 'react';

export function GlimwormSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      {...props}
    >
      <path d="M8 44 Q18 26 28 44 T48 44 T62 28" />
      <circle cx="62" cy="28" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="36" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="36" cy="36" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="52" cy="36" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
```

Wavy trail with a glowing head dot — speaks to the "glow-in-the-dark snake" copy.

### `symbols/index.ts`

```ts
export * from './CriticalSymbol';
export * from './SeaBattleSymbol';
export * from './GlimwormSymbol';
```

When real key art arrives, leave the symbol files as a fallback and add a new optional `coverImage` field on the game record. In `FeaturedGameCard`, render `<img src={game.coverImage} className={styles.symbol} alt="" />` if present, else `<Symbol className={styles.symbol} aria-hidden />`. Same slot, same sizing.

---

## Section header

The current pager (two grey ghost arrows in the dead-zone _below_ the cards) doesn't belong there — move it up into the section header so the section reads as a single unit.

```tsx
<header className={styles.sectionHead}>
  <div>
    <h2>{t('featured.title')}</h2>
    <p className={styles.sub}>{t('featured.subtitle')}</p>
  </div>

  {/* If we have ≤ 3 games, hide pager and show a View all link instead */}
  {games.length > 3 ? (
    <nav className={styles.pager} aria-label={t('featured.pagerLabel')}>
      <button onClick={prev} aria-label={t('featured.prev')}>
        <ChevronLeft />
      </button>
      <button onClick={next} aria-label={t('featured.next')}>
        <ChevronRight />
      </button>
    </nav>
  ) : (
    <Link href="/games" className={styles.viewAll}>
      {t('featured.viewAll', { count: totalGames })} →
    </Link>
  )}
</header>
```

```css
.sectionHead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}
.sectionHead h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-strong);
}
.sectionHead .sub {
  margin: 6px 0 0;
  color: var(--color-muted);
  font-size: 14px;
}

.pager {
  display: flex;
  gap: 8px;
}
.pager button {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--glass-border-hover);
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.pager button:hover {
  color: var(--color-strong);
  border-color: var(--accent);
}
.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.viewAll {
  color: var(--accent);
  font-size: 13px;
  text-decoration: none;
}
.viewAll:hover {
  text-decoration: underline;
}
```

---

## i18n

Add to `apps/web/src/shared/i18n/messages/home/en.ts` (or wherever the home messages live):

```ts
featured: {
  title: 'Featured Games',
  subtitle: 'Explore our growing library of tabletop experiences',
  playNow: 'Play now',
  tryDemo: 'Try demo',
  howToPlay: 'How to play',
  players: 'players',
  match: 'match',
  playingNow: 'playing now',
  demo: 'Demo',
  demoLabel: 'Demo build',
  prev: 'Previous game',
  next: 'Next game',
  pagerLabel: 'Featured games carousel',
  viewAll: 'View all {{count}}',
}
```

No copy is hardcoded in JSX.

---

## Grid + carousel

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

If there's an existing horizontal-scroll carousel in `FeaturedGamesSection.tsx`, **keep its mechanics**. Only restyle the buttons per the header spec above; don't rewrite the scroll logic.

For ≤ 3 games today, render a static 3-up grid and hide the pager (per the conditional in the section header above).

---

## Accessibility

- The whole card is **not** a single anchor. Activation surface is the CTA + (optionally) the title. The info button has its own click target.
- All non-text controls carry `aria-label`s sourced from i18n.
- Symbol SVGs are `aria-hidden`; the title and meta carry the semantic content.
- The "Demo" badge is decorative if the CTA text already says "Try demo", but if the CTA text doesn't disambiguate, give the badge `aria-label="Demo build"`.
- `:focus-visible` rings on CTA and info button (already in CSS above) — ensure 3:1 contrast with both `var(--bg-elev)` and `var(--accent)`.
- Pager buttons get `disabled` when at the start/end of the carousel; CSS already dims them.

---

## Acceptance

- [ ] All three cards in a row are the **same height**, even when descriptions differ in length.
- [ ] No gradient on titles. No glow on CTAs. No floating circle icon next to the title.
- [ ] No emoji anywhere in the card. Each game's cover shows its dedicated SVG symbol; symbols pick up `--game-accent` automatically.
- [ ] "Demo" pill sits in the cover's top-right; genre + pace pill in the top-left.
- [ ] Section header carries the pager (cards are no longer floating beneath two disconnected arrows).
- [ ] Hover lifts the card 3px and brightens the per-game border; mint CTA brightens 8%.
- [ ] Mobile ≤ 640px: grid collapses to 1 column, cover stays 200px tall.
- [ ] Lighthouse contrast passes for the desc (14px var(--color) on `--bg-elev`), the meta (12.5px var(--color-muted)), and the corner pill (10px on rgba(0,0,0,0.35) with backdrop blur).
- [ ] Keyboard: Tab order is CTA → info button → next card's CTA. Focus rings visible on both.

---

## Out of scope (notes for later)

- **Real key art per game** — replace the `<Symbol />` slot with `<img>`; everything else stays. Recommended ratio: 16:9 cropped to the 200px cover (so source assets ≈ 600×340).
- **Live "playing now"** counts — already wired conditionally; hide if BE returns `null`.
- **Demo build flag** — assumes a boolean on the game record. If product wants finer states (Beta, Early access, Demo), promote it to an enum + extend the badge styling.
- **Carousel autoplay** — out of scope. If product wants it, gate behind `prefers-reduced-motion: no-preference`.
- **Per-game accent in the DB** — currently a static map. Promote to a `games.accentColor` column when product wants editorial control without a code deploy.
