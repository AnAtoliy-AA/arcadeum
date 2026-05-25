# Games / Create — Redesign Implementation Handoff

**Status:** Design approved · ready for engineering
**Owner:** Design → handed to Claude Code
**Route:** `/games/create` (existing — full UI replacement; route + server logic unchanged)
**Preview file (this repo):** `Games Create.html` + `games-create/create.css`

---

## 0. tl;dr

Replace the current dense, single-column form on `/games/create` with a **two-column editorial layout**:

- **Left column:** Game picker → expansion packs → theme → house rules → room details, each as a numbered section (`01 ·` … `05 ·`) with hairline dividers.
- **Right column (sticky):** Live preview card with authentic game art per theme, summary table, gold gradient Create CTA pinned at the top of the viewport.
- **Header:** Editorial display H1 ("A new table. _Set in seconds._") + Quick-preset pill row (Ranked 1v1 / Friends / Big party).
- **Game art:** Authentic — real System Overload-style cards per Critical theme; real 10×10 boards with ships/hits/misses per Sea Battle theme.

Keep all existing data, schemas, API calls, and i18n keys — this is purely a presentation rebuild.

---

## 1. Files

### 1.1 New / modified

| File                                                         | Action   | Notes                                           |
| ------------------------------------------------------------ | -------- | ----------------------------------------------- |
| `apps/web/src/app/games/create/page.tsx`                     | **edit** | Wrap with new `GameCreateView`                  |
| `apps/web/src/app/games/create/GameCreateView.tsx`           | **new**  | Top-level client component, owns local state    |
| `apps/web/src/app/games/create/GamePicker.tsx`               | **new**  | 3-card horizontal selector with poster art      |
| `apps/web/src/app/games/create/ExpansionPacks.tsx`           | **new**  | Collapsible packs section (Critical only)       |
| `apps/web/src/app/games/create/ThemePicker.tsx`              | **new**  | Poster-style theme grid w/ authentic art        |
| `apps/web/src/app/games/create/HouseRules.tsx`               | **new**  | 2×2 toggle grid                                 |
| `apps/web/src/app/games/create/RoomDetails.tsx`              | **new**  | Name / max players / visibility / notes         |
| `apps/web/src/app/games/create/PreviewRail.tsx`              | **new**  | Sticky live preview + summary + Create CTA      |
| `apps/web/src/app/games/create/QuickPresets.tsx`             | **new**  | "Ranked 1v1 / Friends / Big party" pill tabs    |
| `apps/web/src/app/games/create/art/CriticalCardPoster.tsx`   | **new**  | Render a themed System-Overload-style card      |
| `apps/web/src/app/games/create/art/SeaBattleBoardPoster.tsx` | **new**  | Render a themed 10×10 board with ships          |
| `apps/web/src/app/games/create/art/GameArt.tsx`              | **new**  | Large poster art per game (cards / grid / glow) |
| `apps/web/src/app/games/create/data/themes.ts`               | **new**  | Theme registry (per-game)                       |
| `apps/web/src/app/games/create/data/presets.ts`              | **new**  | Quick preset config                             |
| `apps/web/src/app/games/create/GameCreateView.module.css`    | **new**  | Page styles — port `games-create/create.css`    |

### 1.2 Routes / wiring

- Existing `routes.gameCreate` already points here. **Do not change.**
- The hero CTAs in `SeaBattleLanding.tsx` already pass `?gameId=sea_battle_v1` — preserve that. On mount, read the `gameId` query param and pre-select.

---

## 2. Data model

### 2.1 Form state

```ts
type Visibility = 'public' | 'unlisted' | 'private';
type GameId = 'critical' | 'sea_battle' | 'glimworm';
type MaxPlayers = number | 'auto';

interface CreateRoomForm {
  gameId: GameId;
  themeId: string; // per-game; '' for glimworm
  expansionPackIds: string[]; // 'core' always present; only used when gameId === 'critical'
  maxPlayers: MaxPlayers;
  visibility: Visibility;
  roomName: string; // required, 1–40 chars
  notes: string; // optional
  rules: {
    combos: boolean; // Critical only
    idle: boolean; // all games
    teams: boolean; // Sea Battle only
    spectators: boolean;
  };
  preset: 'ranked' | 'friends' | 'party' | 'custom';
}
```

### 2.2 Game registry (`data/themes.ts`)

```ts
export const GAMES = {
  critical: {
    title: 'Critical',
    desc: 'A strategic card game where you avoid critical hazards.',
    players: { min: 2, max: 6, label: '2–6' },
    duration: '12 min',
    kind: 'Card · bluff',
    hasExpansion: true,
    hasThemes: true,
    rules: ['combos'] as const, // game-specific rules surfaced
  },
  sea_battle: {
    title: 'Sea Battle',
    desc: 'Classic naval combat for up to 6 players.',
    players: { min: 2, max: 4, label: '2–4' },
    duration: '20 min',
    kind: 'Strategy',
    hasExpansion: false,
    hasThemes: true,
    rules: ['teams'] as const,
  },
  glimworm: {
    title: 'Glimworm',
    desc: 'A glow-in-the-dark snake battle for 2–10 players.',
    players: { min: 2, max: 10, label: '2–10' },
    duration: '8 min',
    kind: 'Arcade',
    hasExpansion: false,
    hasThemes: false,
    rules: [] as const,
  },
} as const;

export const CRITICAL_THEMES = [
  {
    id: 'short_circuit',
    name: 'The Short Circuit',
    desc: '…',
    color: '#f472b6',
    accent: '#f9a8d4',
    glyph: '⚠',
    cardName: 'SYSTEM OVERLOAD',
    effect: 'Defuse or you explode.',
  },
  {
    id: 'deep_sea',
    name: 'Deep Sea Pressure',
    desc: '…',
    color: '#38bdf8',
    accent: '#7dd3fc',
    glyph: '≋',
    cardName: 'HULL BREACH',
    effect: 'Patch the leak or sink.',
  },
  {
    id: 'heist',
    name: 'The Heist',
    desc: '…',
    color: '#fbbf24',
    accent: '#fcd34d',
    glyph: '⏲',
    cardName: 'VAULT ALARM',
    effect: 'Disarm or every cop hears it.',
  },
  {
    id: 'cursed_banquet',
    name: 'The Cursed Banquet',
    desc: '…',
    color: '#c084fc',
    accent: '#e9d5ff',
    glyph: '☠',
    cardName: 'CURSED TOAST',
    effect: 'Pass the wine or you\u2019re next.',
  },
  {
    id: 'ancient_temple',
    name: 'The Ancient Temple',
    desc: '…',
    color: '#a78bfa',
    accent: '#c4b5fd',
    glyph: '◐',
    cardName: 'TRAP TRIGGERED',
    effect: 'Spot the seam or get crushed.',
  },
  {
    id: 'high_altitude',
    name: 'High-Altitude Hike',
    desc: '…',
    color: '#60a5fa',
    accent: '#93c5fd',
    glyph: '△',
    cardName: 'AVALANCHE',
    effect: 'Anchor in or get buried.',
  },
] as const;

export const SEA_BATTLE_THEMES = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Cobalt grids on dark navy — the original.',
    palette: {
      bg: '#0b1726',
      cell: '#1e293b',
      ship: '#94a3b8',
      hit: '#ef4444',
      miss: '#64748b',
    },
    color: '#7dd3fc',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    desc: 'Neon pink salvos over carbon mesh.',
    palette: {
      bg: '#1a0033',
      cell: '#2d0a4f',
      ship: '#06b6d4',
      hit: '#ec4899',
      miss: '#a78bfa',
    },
    color: '#06b6d4',
  },
  {
    id: 'nebula',
    name: 'Nebula',
    desc: 'Star-flecked grid drifting through purple cloud.',
    palette: {
      bg: '#06011b',
      cell: '#1e1b4b',
      ship: '#a78bfa',
      hit: '#fb7185',
      miss: '#c4b5fd',
    },
    color: '#a78bfa',
  },
  {
    id: 'forest',
    name: 'Forest',
    desc: 'Topographic green-on-moss for the patient admiral.',
    palette: {
      bg: '#062a23',
      cell: '#0f3d33',
      ship: '#34d399',
      hit: '#fb923c',
      miss: '#6ee7b7',
    },
    color: '#34d399',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    desc: 'Warm coral grid over deepening dusk.',
    palette: {
      bg: '#2a1106',
      cell: '#4a1f0e',
      ship: '#fb923c',
      hit: '#fbbf24',
      miss: '#fca5a5',
    },
    color: '#fb923c',
  },
  {
    id: 'mono',
    name: 'Mono',
    desc: 'Pure black ink on bone — competition-grade.',
    palette: {
      bg: '#0a0a0a',
      cell: '#1c1c1c',
      ship: '#e5e7eb',
      hit: '#ef4444',
      miss: '#737373',
    },
    color: '#e5e7eb',
  },
] as const;
```

> **Reuse the canonical Sea Battle palette** from `@/widgets/SeaBattleGame/lib/SeaBattleThemeContext` instead of duplicating colors. The values above are the visual targets; resolve them at runtime from `SeaBattleThemeProvider` so any palette tweak in the lobby variant picker stays in sync here.

### 2.3 Expansion packs

```ts
export const EXPANSION_PACKS = [
  {
    id: 'core',
    name: 'Core',
    desc: 'The base 31-card deck.',
    count: 31,
    locked: true,
  },
  {
    id: 'overload',
    name: 'Overload',
    desc: 'Adds System Overload variants.',
    count: 12,
  },
  {
    id: 'firewall',
    name: 'Firewall+',
    desc: 'New defuse variants and chain combos.',
    count: 8,
  },
  {
    id: 'voidpack',
    name: 'Voidpack',
    desc: 'Deep Scan, Rewrite, System Override.',
    count: 10,
  },
  {
    id: 'kaiju',
    name: 'Kaiju Edition',
    desc: 'Six themed card art swaps.',
    count: 6,
  },
] as const;
```

`core` is always selected and cannot be unchecked. The "Select all" button toggles between **add all extras** and **clear extras** based on current state.

### 2.4 Quick presets (`data/presets.ts`)

```ts
export const PRESETS = {
  ranked: {
    visibility: 'public',
    maxPlayers: 2,
    rules: { idle: true, spectators: true, combos: false, teams: false },
  },
  friends: {
    visibility: 'unlisted',
    maxPlayers: 'auto',
    rules: { idle: false, spectators: true, combos: false, teams: false },
  },
  party: {
    visibility: 'public',
    maxPlayers: 'auto',
    rules: { idle: true, spectators: true, combos: true, teams: true },
  },
} as const;
```

Selecting a preset shallow-merges its keys into form state. Editing any field after that flips `preset` back to `'custom'` and visually deselects all preset pills.

---

## 3. Page structure (JSX skeleton)

```tsx
// GameCreateView.tsx
'use client';

export function GameCreateView({ initialGameId }: { initialGameId?: GameId }) {
  const [form, setForm] = useState<CreateRoomForm>(() => initialForm(initialGameId));
  const isValid = form.roomName.trim().length > 0;

  return (
    <main className={s.page}>
      <div className={s.container}>
        <Topbar />
        <Breadcrumb />

        <header className={s.head}>
          <div>
            <span className={s.eyebrow}>New room</span>
            <h1>A new table. <em>Set in seconds.</em></h1>
            <p>Pick a game, dial in the rules, and we&apos;ll spin up a room and shareable link.</p>
          </div>
          <QuickPresets value={form.preset} onChange={applyPreset} />
        </header>

        <div className={s.grid}>
          <section className={s.colLeft}>
            <SectionGroup num="01" title="Select a game" action={<a>Browse all →</a>}>
              <GamePicker value={form.gameId} onChange={setGame} />
            </SectionGroup>

            {GAMES[form.gameId].hasExpansion && (
              <SectionGroup num="02" title="Expansion packs">
                <ExpansionPacks value={form.expansionPackIds} onChange={setPacks} />
              </SectionGroup>
            )}

            {GAMES[form.gameId].hasThemes && (
              <SectionGroup num={hasExp ? '03' : '02'} title="Game theme" action={<a>Game rules</a>}>
                <ThemePicker gameId={form.gameId} value={form.themeId} onChange={setTheme} />
              </SectionGroup>
            )}

            <SectionGroup num={…} title="House rules" hint="Optional">
              <HouseRules gameId={form.gameId} value={form.rules} onChange={setRules} />
            </SectionGroup>

            <SectionGroup num={…} title="Room details">
              <RoomDetails value={form} onChange={setDetails} />
            </SectionGroup>
          </section>

          <aside className={s.rail}>
            <PreviewRail form={form} isValid={isValid} onCreate={createRoom} />
          </aside>
        </div>
      </div>
    </main>
  );
}
```

### Section numbering

Numbers re-index dynamically based on whether expansion packs section is shown. Use a helper:

```ts
const sectionNum = (i: number) => (GAMES[gameId].hasExpansion ? i : i - 1);
```

So Critical sees `01 02 03 04 05`, Sea Battle sees `01 02 03 04`, Glimworm sees `01 02 03`.

---

## 4. Components

### 4.1 `<GamePicker>`

Three cards in a CSS grid `grid-template-columns: repeat(3, 1fr)`. Each card:

- Top: `<GameArt gameId={…}/>` with `aspect-ratio: 16/11`
- Body: title + player range badge (mono, right-aligned, `white-space: nowrap`)
- Description (`color: var(--gc-text-dim)`, 13.5px)
- Meta row: `<duration> · <kind>` mono uppercase

Selected state:

- `border-color: var(--gc-accent)`
- `box-shadow: 0 0 0 1px var(--gc-accent), 0 24px 48px -24px <accent-50%>`
- Show "Selected" ribbon top-left in accent gold

Hover: `translateY(-3px)` + softer shadow.

### 4.2 `<ThemePicker>`

`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`.

Each theme card has:

- **Authentic poster art at `aspect-ratio: 16/9`** — see §5
- Theme name with a glowing dot in theme color
- One-line description

Selected: `border-color: var(--theme-color)`, `box-shadow: 0 0 0 1px var(--theme-color)`, corner check badge in theme color.

CSS custom property for per-card theming:

```tsx
<button style={{ '--theme-color': theme.color } as CSSProperties}>
```

### 4.3 `<ExpansionPacks>`

Collapsed by default. Bar shows:

- Left: title + sub ("Mix card packs to spice up the deck")
- Right: "Select all" link button + "Show" chevron toggle

Expanded list: each pack is a row with:

- Checkbox (left) — locked variant for `core`
- Name + card-count chip + (if locked) "always on" chip
- Description below

Click anywhere on the row toggles the pack.

### 4.4 `<HouseRules>`

```tsx
<div className={s.rules}>  {/* CSS grid 1fr 1fr, gapless, divided */}
  {rules.map(r => (
    <Rule key={r.id} title={r.title} desc={r.desc} value={form.rules[r.id]} onChange={…} />
  ))}
</div>
```

Compute visible rules:

```ts
const ruleIds = ['idle', 'spectators'];
if (GAMES[form.gameId].rules.includes('combos')) ruleIds.unshift('combos');
if (GAMES[form.gameId].rules.includes('teams')) ruleIds.push('teams');
```

### 4.5 `<RoomDetails>`

- **Room name** — required, 40 char limit, live counter, suggestion icon button.
- **Max players** — stepper component with custom "Auto" state. Decrement from `min` falls back to `'auto'`. Increment from `'auto'` jumps to `min`. Show min–max hint under the value as `<small>`.
- **Visibility** — `<SegmentedControl>` with Public / Unlisted / Private. Inverted white-on-ink for selected.
- **Notes** — textarea, max 240 chars, placeholder "No bots · EU evenings · first-timers welcome."

### 4.6 `<PreviewRail>`

Sticky (`position: sticky; top: 22px`). Three stacked regions:

1. **Art**: `aspect-ratio: 5/4`, render `<GameArt big={true}/>` themed.
   - Top-left: pulsing "LIVE PREVIEW" pill.
   - Bottom-left: room title (h3, 22px) + game / theme sub (mono uppercase).
   - Bottom-right: theme badge (dot + name).
2. **Summary**: gapless rows with hairline dividers — Game / Expansion / Theme / Max players / Visibility / House rules. Hide rows that don't apply (expansion for non-Critical; theme for Glimworm).
3. **CTA**: Gold gradient `Create room` button, disabled until valid. Caption below: `⌘ ↵ to create · share link is generated instantly`.

Keyboard: `Cmd/Ctrl + Enter` submits when valid.

---

## 5. Authentic game art

> **The whole point of the redesign.** Don't ship abstract gradients — render real game artifacts themed per variant.

### 5.1 Critical theme posters — `<CriticalCardPoster>`

For each Critical theme, render a card stack with one featured System-Overload-style card in the center:

```tsx
function CriticalCardPoster({ theme }: { theme: CriticalTheme }) {
  const { color, accent, glyph, cardName, effect } = theme;
  const cardBg = `color-mix(in srgb, ${color} 8%, #0a0510)`;

  return (
    <svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg-${theme.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".18" />
          <stop offset="1" stopColor="#0a0510" />
        </linearGradient>
        <radialGradient id={`rg-${theme.id}`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="240" height="135" fill={`url(#bg-${theme.id})`} />
      <rect width="240" height="135" fill={`url(#rg-${theme.id})`} />

      {/* left ghost card */}
      <g transform="translate(28 32) rotate(-10)" opacity=".4">
        <rect
          width="64"
          height="92"
          rx="7"
          fill={cardBg}
          stroke={color}
          strokeWidth="1"
          strokeOpacity=".55"
        />
      </g>

      {/* right ghost card */}
      <g transform="translate(150 28) rotate(9)" opacity=".4">
        <rect
          width="64"
          height="92"
          rx="7"
          fill={cardBg}
          stroke={color}
          strokeWidth="1"
          strokeOpacity=".55"
        />
      </g>

      {/* featured card (center) */}
      <g transform="translate(80 18) rotate(-2)">
        <rect
          width="84"
          height="108"
          rx="9"
          fill={cardBg}
          stroke={color}
          strokeWidth="1.4"
        />
        <text
          x="9"
          y="18"
          fill={color}
          fontFamily="JetBrains Mono"
          fontSize="11"
          fontWeight="700"
        >
          {glyph}
        </text>
        <text
          x="75"
          y="100"
          textAnchor="end"
          fill={color}
          fontFamily="JetBrains Mono"
          fontSize="11"
          fontWeight="700"
          transform="rotate(180 75 100)"
        >
          {glyph}
        </text>
        <text
          x="42"
          y="60"
          textAnchor="middle"
          fill={color}
          fontFamily="JetBrains Mono"
          fontSize="34"
          fontWeight="700"
        >
          {glyph}
        </text>
        <text
          x="42"
          y="80"
          textAnchor="middle"
          fill="#f5f3ff"
          fontFamily="Space Grotesk"
          fontSize="8"
          fontWeight="600"
        >
          {cardName}
        </text>
        <line
          x1="14"
          y1="86"
          x2="70"
          y2="86"
          stroke={color}
          strokeOpacity=".3"
          strokeWidth=".4"
        />
        <text
          x="42"
          y="96"
          textAnchor="middle"
          fill={accent}
          fontFamily="JetBrains Mono"
          fontSize="5.5"
        >
          {effect}
        </text>
      </g>
    </svg>
  );
}
```

**Big preview-rail variant** scales the same card up to `viewBox="0 0 400 320"`, increases the featured card to `128×184`, font sizes go up proportionally (`62px` glyph, `12px` name, `8px` effect). Keep ghost cards larger (`108×156`) on either side.

### 5.2 Sea Battle theme posters — `<SeaBattleBoardPoster>`

Render an actual 10×10 grid with the theme's canonical palette and a fixed ship/hit/miss layout so all themes are visually comparable:

```tsx
const SHIPS = [
  { r: 1, c: 1, len: 4, dir: 'h' as const },
  { r: 4, c: 0, len: 3, dir: 'h' as const },
  { r: 6, c: 5, len: 5, dir: 'h' as const },
  { r: 2, c: 8, len: 4, dir: 'v' as const },
];
const HITS = [
  { r: 1, c: 2 },
  { r: 6, c: 6 },
  { r: 6, c: 7 },
];
const MISSES = [
  { r: 0, c: 4 },
  { r: 3, c: 6 },
  { r: 5, c: 2 },
  { r: 8, c: 3 },
  { r: 7, c: 8 },
];

function SeaBattleBoardPoster({ theme, size = 'sm' }: Props) {
  const { bg, cell, ship, hit, miss } = theme.palette;
  const cellW = size === 'sm' ? 22 : 30;
  const cellH = size === 'sm' ? 12 : 22;
  // ... render rect cells, overlay hit circle on ship, miss dot on cell.
}
```

Same component used in card (`240×135` viewBox, `cellW=22, cellH=12`) and in preview rail (`400×320` viewBox, `cellW=30, cellH=22, padX=50, padY=30`).

### 5.3 Game art for the game picker — `<GameArt>`

Critical: three rotated cards fanning across the frame (`-14°`, `-2°`, `8°`), with a fourth tucked behind. Color palette violet/purple. Add a soft radial accent in `#a855f7`.

Sea Battle: 18×12 cell grid in a 320×220 viewBox with two ships, a hit marker (pink), three misses (white dots), and a crosshair (pink). Same palette as the existing landing-page board art.

Glimworm: two glowing serpentine paths (green and pink) across pitch black, each ending in a glow dot. Multiple bg star specks.

> All three should ship as one component (`<GameArt gameId={…}/>`) with internal switch.

### 5.4 Reuse, don't duplicate (recommended)

If `SeaBattleThemePreview` from `@/widgets/SeaBattleGame/ui/SeaBattleThemePreview` can render at the small/medium sizes needed here, **use it directly** rather than duplicating board logic. Same goes for `<Card>` from the Critical widget if it can render with override theme colors. Only fall back to the SVG above if the existing components can't be coaxed into the right size/palette.

---

## 6. Styling

### 6.1 Tokens

The HTML preview defines its own scoped tokens at `:root` (`--gc-ink`, `--gc-bg-card`, etc.) because the existing `styles/tokens.css` doesn't have the exact warm-gold premium palette. **In production**, add these as new tokens scoped to a `[data-section='games-create']` block or — preferred — promote them into `packages/ui/src/tamagui.config.ts` as a new `premiumDark` theme variant:

```css
--gc-ink: #0a0510;
--gc-bg-deep: #08050f;
--gc-bg-card: #0e0a18;
--gc-bg-card-2: #120c1f;
--gc-line: rgba(255, 255, 255, 0.06);
--gc-line-strong: rgba(255, 255, 255, 0.12);
--gc-text: #f5f3ff;
--gc-text-dim: #8a8499;
--gc-text-faint: #5a5468;
--gc-accent: #ffd166; /* warm gold */
--gc-accent-2: #ff9f4a; /* peach (gradient stop) */
--gc-accent-violet: #b794ff;
--gc-accent-cyan: #7dd3fc;
```

### 6.2 Typography

Already loaded site-wide:

- `Space Grotesk` 500/600/700 — headings
- `Inter` 400/500/600/700 — body
- `JetBrains Mono` 400/500/600 — eyebrows, mono labels, code/section numbers, card glyphs

H1 (`<h1>`) is `clamp(2.6rem, 5vw, 4rem)`, `line-height: 0.98`, `letter-spacing: -0.04em`. The `<em>` inside is gradient-clipped from `--gc-accent` → `--gc-accent-2`.

### 6.3 Layout

```css
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 32px;
  align-items: start;
}
@media (max-width: 1080px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.colLeft {
  display: flex;
  flex-direction: column;
  gap: 56px;
} /* generous spacing between sections */

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--gc-line); /* hairline dividers, not cards */
}
```

The whole left column has **no card chrome** — sections are separated by hairline dividers, not boxed cards. The right rail is the only card.

### 6.4 Text-wrap safety

Several flex rows use `justify-content: space-between`. Add `white-space: nowrap` to:

- `.gc-game-players` (player range badge)
- `.gc-preset` (preset pill labels)
- `.gc-link-btn` ("Select all", "Show / Hide")
- `.gc-form-row label .gc-counter` (input counter labels)

(These were flagged during design review — keep them on.)

### 6.5 Animations

Subtle staggered fade-in only:

```css
@keyframes gcFade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade {
  animation: gcFade 0.5s cubic-bezier(0.2, 0.6, 0.2, 1) both;
}
.fade-2 {
  animation-delay: 0.06s;
}
.fade-3 {
  animation-delay: 0.12s;
}
.fade-4 {
  animation-delay: 0.18s;
}
.fade-5 {
  animation-delay: 0.24s;
}
@media (prefers-reduced-motion: reduce) {
  [class*='fade'] {
    animation: none;
  }
}
```

No parallax, no scroll-jank effects.

---

## 7. Interactions

### 7.1 Game switch

When `gameId` changes:

1. If current `themeId` is not in the new game's theme list → set to `themesFor(newGameId)[0]?.id ?? ''`.
2. Re-clamp `maxPlayers` if it's a number outside `[min, max]` for the new game.
3. Section numbering re-flows because `hasExpansion` changes.
4. Right rail preview swaps art with a 250ms cross-fade (`opacity` transition).
5. House rules visible set changes (combos appears for Critical only, teams for Sea Battle only).

### 7.2 Preset apply

Selecting a preset overrides `visibility`, `maxPlayers`, and `rules` fields. Does **not** touch `gameId`, `themeId`, `expansionPackIds`, `roomName`, or `notes`. Manual edit afterward flips `preset` to `'custom'`.

### 7.3 Stepper

```
Min ←  …  ← (Auto)  → Min  → … → Max
```

- Start at `'auto'`.
- Decrement from `'auto'` → `g.max - 1` (sensible default just below cap).
- Decrement from `g.min` → `'auto'`.
- Increment from `'auto'` → `g.min`.
- Increment is disabled at `g.max`.

### 7.4 Validation

`isValid = form.roomName.trim().length > 0`.

Disabled state on Create button: `opacity: 0.4`, `cursor: not-allowed`, no shadow. No inline error — focus the field if the user keyboard-submits while empty.

### 7.5 Submit

```ts
async function createRoom() {
  if (!isValid) return;
  const room = await gamesApi.createRoom({
    gameId: form.gameId,
    themeId: form.themeId || null,
    expansionPackIds: form.gameId === 'critical' ? form.expansionPackIds : null,
    maxPlayers: form.maxPlayers === 'auto' ? null : form.maxPlayers,
    visibility: form.visibility,
    name: form.roomName.trim(),
    notes: form.notes.trim() || null,
    rules: form.rules,
  });
  router.push(routes.gameRoom(room.id));
}
```

While in-flight: swap CTA label to "Creating room…" with a spinner; lock the form.

---

## 8. Accessibility

- All `radiogroup`s use `role="radiogroup"` + `role="radio"` + `aria-pressed`/`aria-checked`.
- Toggles use `role="switch"` + `aria-pressed`.
- Expansion bar uses `aria-expanded` + `aria-controls`.
- Live preview tag has `aria-hidden="true"` (decorative).
- Sticky rail still keyboard-accessible at `<= 1080px` because it flattens into the doc flow.
- `prefers-reduced-motion` kills all entrance animations and the pulsing live-preview dot.
- Color contrast: body text on bg cards ≥ 4.5:1 verified for default palette; accent gold on ink is for backgrounds only, never small text.

---

## 9. i18n

The preview uses English strings inline. Move all visible copy to `apps/web/src/shared/i18n/messages/pages/en.ts` under a new `gameCreate` namespace mirroring the structure used by `seaBattle.landing`. Key list:

```
gameCreate.eyebrow                  "New room"
gameCreate.title                    "A new table."
gameCreate.titleAccent              "Set in seconds."
gameCreate.intro                    "Pick a game…"
gameCreate.presets.ranked           "Ranked 1v1"
gameCreate.presets.friends          "Friends"
gameCreate.presets.party            "Big party"
gameCreate.sections.game.title      "Select a game"
gameCreate.sections.game.action     "Browse all"
gameCreate.sections.expansion.title       "Expansion packs"
gameCreate.sections.expansion.bar.title   "Mix card packs to spice up the deck"
gameCreate.sections.expansion.bar.desc    "Combine multiple expansions for chaotic, dense games."
gameCreate.sections.expansion.selectAll   "Select all"
gameCreate.sections.expansion.clearExtras "Clear extras"
gameCreate.sections.expansion.show        "Show"
gameCreate.sections.expansion.hide        "Hide"
gameCreate.sections.theme.title           "Game theme"
gameCreate.sections.theme.action          "Game rules"
gameCreate.sections.rules.title           "House rules"
gameCreate.sections.rules.hint            "Optional"
gameCreate.sections.details.title         "Room details"
gameCreate.fields.roomName                "Room name"
gameCreate.fields.required                "required"
gameCreate.fields.maxPlayers              "Max players"
gameCreate.fields.maxPlayers.auto         "Auto"
gameCreate.fields.maxPlayers.upTo         "Up to {n}"
gameCreate.fields.visibility              "Visibility"
gameCreate.fields.visibility.public       "Public"
gameCreate.fields.visibility.unlisted     "Unlisted"
gameCreate.fields.visibility.private      "Private"
gameCreate.fields.notes                   "Notes"
gameCreate.fields.notes.help              "shown to joiners"
gameCreate.rules.combos.title             "Action card combos"
gameCreate.rules.combos.desc              "Allow any pair as a combo, not just official sets."
gameCreate.rules.idle.title               "Idle timer autoplay"
gameCreate.rules.idle.desc                "Auto-play a sensible move after 15s of inactivity."
gameCreate.rules.teams.title              "Team mode"
gameCreate.rules.teams.desc               "Pair players into fleets — 2v2 or 3v3."
gameCreate.rules.spectators.title         "Allow spectators"
gameCreate.rules.spectators.desc          "Anyone with the link can watch silently."
gameCreate.preview.tag                    "LIVE PREVIEW"
gameCreate.preview.summary.game           "Game"
gameCreate.preview.summary.expansion      "Expansion"
gameCreate.preview.summary.theme          "Theme"
gameCreate.preview.summary.maxPlayers     "Max players"
gameCreate.preview.summary.visibility     "Visibility"
gameCreate.preview.summary.rules          "House rules"
gameCreate.cta.create                     "Create room"
gameCreate.cta.creating                   "Creating room…"
gameCreate.cta.shortcut                   "{cmd}{return} to create · share link is generated instantly"
```

Theme names/descriptions go under `games.<gameId>.themes.<themeId>.name|desc`.

---

## 10. Telemetry

Fire analytics for:

- `game_create_view` on mount, with `{ gameId, source: queryParam || 'direct' }`.
- `game_create_preset_apply` `{ preset }`.
- `game_create_game_switch` `{ from, to }`.
- `game_create_theme_switch` `{ gameId, themeId }`.
- `game_create_submit` `{ gameId, themeId, visibility, maxPlayers, expansionPackCount, rules }`.

---

## 11. Acceptance criteria

- [ ] Visiting `/games/create` lands on the new layout — no flash of the old page.
- [ ] `?gameId=sea_battle_v1` (slug from `SEA_BATTLE_SLUG`) pre-selects Sea Battle.
- [ ] All 3 games selectable; Critical shows expansion section, Sea Battle/Glimworm do not.
- [ ] Each Critical theme renders an authentic themed System-Overload-style card in the card poster and a larger version in the rail preview.
- [ ] Each Sea Battle theme renders a real 10×10 grid using the canonical theme palette (`SeaBattleThemeProvider`), with at least two ships, one hit, and three misses visible.
- [ ] Glimworm hides theme + expansion sections; section numbers renumber correctly.
- [ ] Stepper allows `'auto'` and any integer in `[min, max]`; transitions in/out of `'auto'` work both directions.
- [ ] Visibility segmented control: selected button is inverted (white bg, ink text); others are dim.
- [ ] House rule toggles flip to gold; toggle handle slides 18px left → 20px right.
- [ ] Quick presets apply atomically; editing any field flips preset to `'custom'` and visually deselects.
- [ ] Sticky rail stays in view while scrolling the left column on ≥ 1081px viewports.
- [ ] Sticky rail flattens into doc flow at ≤ 1080px.
- [ ] Create button is disabled until `roomName` non-empty; ⌘+Enter triggers it.
- [ ] On submit, `gamesApi.createRoom(payload)` is called, then `router.push(routes.gameRoom(room.id))`.
- [ ] `prefers-reduced-motion: reduce` disables all entrance fades and the live-preview pulse.
- [ ] No console errors at any viewport from 360px to 1920px.
- [ ] All i18n keys load from the messages bundle, not inline.
- [ ] Lighthouse a11y score ≥ 95 on the page.

---

## 12. Out of scope (defer)

- **Team-mode pairing UI** — the toggle exists but the actual roster-slot UI ships with ARC-7XX (post-MVP).
- **Region picker** — current `/games/create` doesn't have one; not adding here.
- **Custom rules editor** — beyond the four toggles, no per-game knobs (drawback: combos, idle timer length, etc.). Open follow-up ticket if needed.
- **Save room as template** — a "save preset" affordance is nice-to-have; defer.

---

## 13. Risks / open questions

1. **`SeaBattleThemePreview` reusability.** If the lobby's variant picker component can't render comfortably at `aspect-ratio: 16/9` and `~220px` wide, we'll fall back to the SVG board in §5.2. Visually identical, just duplicated state for hit/miss positions.
2. **Critical themes don't exist server-side yet.** The themes in §2.2 are new. Confirm with backend whether `themeId` is a no-op on `POST /rooms` for Critical until rendering supports it, or whether it should be accepted now (forward-compat) and surface in the match scene later.
3. **Glimworm has no themes/expansion** — confirm with PM that this is correct. If Glimworm gets themes later, only `data/themes.ts` needs to grow.

---

## 14. Design references

- Live preview in this repo: `Games Create.html`
- Tokens: `games-create/create.css` (the `:root` block at the top is the canonical color/spacing scale)
- Adjacent pages for visual consistency:
  - `Sea Battle Landing.html` — same display H1 treatment, same gradient buttons, same hero approach
  - `Shop.html` / `Settings.html` — same chrome (topbar, breadcrumb)
- Critical card vocabulary (glyph + name + effect): `critical/shared.jsx` `CARDS` map
- Sea Battle theme colors (canonical): `apps/web/src/widgets/SeaBattleGame/lib/SeaBattleThemeContext.ts`
