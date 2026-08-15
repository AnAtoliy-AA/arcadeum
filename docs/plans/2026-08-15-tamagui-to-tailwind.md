# Tamagui → Tailwind Full Migration Implementation Plan

> **STATUS: COMPLETE** — implemented on branch `ARC-tamagui-to-tailwind` (commits `070c85a4`…`19ddc93f`). All phases executed; web (1153 tests) and packages/ui (145 tests) green, type-check 0 errors, production build passes, lockfile tamagui-free. Remaining manual verification: Playwright e2e (`pnpm test:e2e:local`) and 7-theme visual QA. This plan is kept as the historical record.

> **For agentic workers:** implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Each phase ends with a verification gate; do not start the next phase until the gate passes.

**Goal:** Fully remove Tamagui (`tamagui`, `@tamagui/*`, `@arcadeum/ui`'s tamagui-based components, next-plugin, babel/turbo aliases, postinstall patch, test wrappers) from the monorepo and replace every Tamagui-styled element with Tailwind CSS classes. Web is the only consumer of Tamagui today (mobile has zero Tamagui usage — only vestigial deps to prune).

**Non-goals (out of scope):**

- Mobile gets **no** NativeWind adoption. RN has no DOM; mobile already styles via `StyleSheet` + `useThemedStyles` and imports neither `tamagui` nor `@arcadeum/ui`. Action on mobile = prune unused deps only.
- No change to game logic, socket flow, i18n keys, or `data-testid` values.
- No redesign — visual output must match current rendering 1:1 (pixel-faithful, theme-by-theme).

---

## 1. Current state (verified by research)

| Area                                             | Numbers                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `packages/ui` components still importing tamagui | **41 of 76** (35 already class-based)                                               |
| `packages/ui` files importing tamagui            | 87 tsx/ts                                                                           |
| `apps/web` files importing `'tamagui'`           | **294** (170 `'use client'`, 124 server)                                            |
| `apps/web` files importing `@arcadeum/ui`        | 220 (re-exported `XStack/YStack/ZStack/ScrollView/ThemeableStack` from index.ts:79) |
| Files using `styled()` (web)                     | 78                                                                                  |
| Files using `useMedia` / `useTheme` (web)        | 12 / 12                                                                             |
| Test files wrapping `TamaguiProvider`            | web 51, ui 10+                                                                      |
| Mobile tamagui imports                           | 0 (deps declared but unused)                                                        |

Tamagui infra to remove:

- Root: `pnpm.overrides` pinning tamagui@rc.23, `scripts/patch-tamagui-token-init.mjs` postinstall hook.
- `apps/web/next.config.ts`: `withTamagui(...)`, tamagui entries in `transpilePackages`, `turbopack.resolveAlias`, `experimental.optimizePackageImports`.
- `apps/web/src/app/TamaguiConfig.tsx` (orphaned), `apps/web/src/shared/config/tamagui-css-injected.ts`, `apps/web/tamagui.config.ts`.
- `packages/ui/src/tamagui.config.ts`, `packages/ui/src/config/tamagui.test.config.ts`, tamagui import in `packages/ui/src/index.ts`.
- `vitest.config.mts` `server.deps.inline` workaround; both `setup-tests.ts` / `vitest.setup.ts` config imports; both `.storybook/preview.tsx` TamaguiProvider wrappers.
- Deps: `tamagui`, `@tamagui/config`, `@tamagui/shorthands`, `@tamagui/next-plugin`, `@tamagui/avatar`, `@tamagui/core`, `@tamagui/font-inter`, `@tamagui/lucide-icons`, `@tamagui/animations-css` from root/ui/web/mobile manifests.

Already in place (reuse, don't rebuild):

- `apps/web/tailwind.config.ts` + `packages/ui/tailwind.config.ts` (preflight disabled, colors mapped to CSS vars) and `globals.scss` already has `@tailwind base/components/utilities`.
- Theme CSS-var minting is **already independent of Tamagui**: `apps/web/src/app/theme/ThemeContext.tsx` + `packages/ui/src/themeDefinitions.ts` write `--background`, `--primary`, `--glassBg`, etc. onto `<html>`. Tailwind consumes them via `var(...)`. The Tamagui config's `themeClassNameOnRoot` only adds a `t_*` class — removing it must not break var minting.
- `packages/ui/src/utils/cx.ts` class-merge util and the `buttonClasses.ts` pattern (class maps per variant/size/shape).

---

## 2. Target state

- **Zero imports** of `tamagui`, `@tamagui/*`, `react-native-web` anywhere in `apps/*` or `packages/ui`.
- All styling is Tailwind classes (+ SCSS only for page-level legacy styles already migrated to classes where practical; keep `globals.scss`, `tokens.scss`, `reset.scss`).
- `@arcadeum/ui` exports only plain React + Tailwind components; no `'use client'` needed at barrel level unless a component genuinely uses hooks (review: currently barrel is `'use client'` — relax to per-module directives).
- 7 themes (dark/light/neon/violet/teal) produce identical CSS vars via `ThemeContext` alone.
- No `TamaguiProvider` in any test; no `withTamagui`; no postinstall patch; no tamagui in lockfile.
- `pnpm check-file-length`, lint, typecheck, vitest (ui + web), and Playwright e2e all green.

---

## 3. Token mapping contract (the migration dictionary)

Single source of truth for every codemod rule and every manual conversion. Append this as `docs/plans/tamagui-token-map.md` (or keep inline in codemod config `scripts/tamagui-codemod/map.ts` — prefer the script as the contract).

### 3.1 Spacing (`$size`/`$space` — 4px base, `true` = 16px)

Tailwind default scale is also 4px-based → direct 1:1:

| Tamagui        | px   | Tailwind (p/m/gap/inset/w/h) |
| -------------- | ---- | ---------------------------- |
| `$0`           | 0    | `0`                          |
| `$1`…`$12`     | 4…48 | `1`…`12`                     |
| `$true`        | 16   | `4`                          |
| negative `$-N` | −4N  | `-N`                         |

### 3.2 Radius (`$radius`)

| Tamagui       | px  | Tailwind         |
| ------------- | --- | ---------------- |
| `$0`          | 0   | `rounded-none`   |
| `$1`          | 4   | `rounded`        |
| `$2`, `$true` | 8   | `rounded-lg`     |
| `$3`          | 12  | `rounded-xl`     |
| `$4`          | 16  | `rounded-2xl`    |
| `$5`          | 20  | `rounded-3xl`    |
| `$6`          | 24  | `rounded-[24px]` |

### 3.3 zIndex

`$1`=100 … `$5`=500 → `z-[100]` … `z-[500]` (Tailwind scale stops at 50; use arbitrary values).

### 3.4 Colors → CSS vars or static values

Extend both tailwind configs' `theme.extend.colors` with the full token set from `tamagui.config.ts` tokens (`cyberpunkBg`, `rolePremium`, `goldLight`, `successBorder`, `infoBgSoft`, …). Mapping rule: theme-dependent tokens → `var(--x)` with the static fallback from `themeDefinitions`; theme-independent tokens (genre/role/gold/status) → literal hex, except where `ThemeContext` already mints a var (then `var()`). Add a parity test that asserts every color token in `tamagui.config.ts` resolves to a var/hex that exists in the new tailwind color map (see Phase 1).

### 3.5 Media queries

Tailwind has no max-width breakpoints by default; `gt*` map to min-width variants:

| Tamagui media   | Rule           | Tailwind equivalent                                                   |
| --------------- | -------------- | --------------------------------------------------------------------- |
| `sm`            | max 800        | `max-[800px]:`                                                        |
| `md`            | max 1150       | `max-[1150px]:`                                                       |
| `tablet`        | max 1023       | `max-[1023px]:`                                                       |
| `lg`            | max 1280       | `max-[1280px]:`                                                       |
| `xl`            | max 1420       | `max-[1420px]:`                                                       |
| `xxl`           | max 1600       | `max-[1600px]:`                                                       |
| `xs`            | max 660        | `max-[660px]:`                                                        |
| `gtXs`          | min 661        | `sm:`                                                                 |
| `gtSm`          | min 801        | `md:`                                                                 |
| `gtTablet`      | min 1024       | `lg:`                                                                 |
| `gtMd`          | min 1151       | `xl:`                                                                 |
| `gtLg`          | min 1281       | `2xl:`                                                                |
| `short`         | maxH 480       | `[@media(max-height:480px)]:`                                         |
| `tall`          | minH 820       | `[@media(min-height:820px)]:`                                         |
| `hoverNone`     | hover:none     | `[@media(hover:none)]:`                                               |
| `pointerCoarse` | pointer:coarse | `pointer-coarse:` (extend with plugin) or `[@media(pointer:coarse)]:` |

For **JS-driven** `useMedia` (12 files) provide `packages/ui/src/hooks/useMediaQuery.ts` returning a `Record<MediaQueryKey, boolean>` mirroring the old shape so call-site logic (e.g. `if (media.sm) …`) ports with a one-line import change.

### 3.6 Tamagui shorthands → Tailwind (codemod rule table)

`p→p`, `px/py/pt/pb/pl/pr→same`, `m/mx/my/mt/mb/ml/mr→same`, `gap`, `bg→bg`, `color→text`, `fontSize→text-[Npx]`, `fontWeight→font-[weight]`, `w/h→w/h`, `minW/minH/maxW/maxH→min-w/min-h/max-w/max-h`, `radius→rounded-*`, `zIndex→z-*`, `opacity→opacity-[N]`, `display→hidden/flex/block`, `pos→absolute/relative/fixed/sticky`, `top/right/bottom/left→top/right/bottom/left` (values → arbitrary `top-[Npx]` or `inset-*`), `flex→flex`, `fd→flex-row/flex-col`, `fw→flex-wrap`, `ai→items-*`, `jc→justify-*`, `as→*`, `alignSelf→self-*`, `textAlign→text-*`, `borderWidth→border-[Npx]`, `borderColor→border-[var(--…)]`, `borderRadius→rounded-*`, `overflow→overflow-*`, `letterSpacing→tracking-*`, `lineHeight→leading-[Npx]` (or `leading-tight/none` per map), `userSelect→select-*`, `cursor→cursor-*`, `whiteSpace→whitespace-*`, `transform→*`, `scale→scale-*`, `rotate→rotate-*`.

Every rule lands in `scripts/tamagui-codemod/map.ts` so codemod and humans use one dictionary.

### 3.7 Animations

Tamagui `animation="fast|medium|slow|quick"` spring props → Tailwind `transition-*` + durations: fast/quick→150ms, medium→300ms, slow→500ms with `ease-out`. `animate-in`-style keyframes (`btn-pulse`, `btn-shimmer`) already exist in tailwind configs — move remaining keyframes (`hero-float-3d` etc. are already there) from `tamagui.config.ts` animations block into the web tailwind config as needed.

---

## 4. New shared infrastructure (Phase 1 — do first)

### 4.1 `packages/ui/src/components/Stack/Stack.tsx` (NEW — temporary compat, deleted in Phase 8)

Compatibility primitives so 294 files can migrate **without touching their JSX structure first**, only imports + prop classes:

```tsx
export const XStack = ...; // <div class="flex flex-row items-stretch"> + mapped props
export const YStack = ...; // <div class="flex flex-col items-stretch">
export const ZStack = ...; // relative wrapper, children absolutely positioned
export const ScrollView = ...; // overflow-auto div, style={{}} for rn-web leftovers
export const ThemeableStack = ...;
```

These are plain `div`s whose props are **class-mapped at call time via the 3.x dictionary** (e.g. `gap="$3"` → `gap-3`, `ai="center"` → `items-center`, `hoverStyle` → `hover:` classes). This keeps every consumer compiling while components migrate incrementally. Props that can't map (e.g. `animation`, `elevation`, `space`) become inline styles **temporarily**, flagged with `// TAMAGUI-COMPAT` comments for the sweep task. The compat layer is deleted only when the last consumer is gone.

### 4.2 Codemod (NEW)

`scripts/tamagui-codemod/` — a `ts-morph`-based CLI (`node scripts/tamagui-codemod/run.mjs --dir apps/web/src/widgets/X --dry-run`) that:

1. Rewrites imports: `from 'tamagui'` → `from '@arcadeum/ui'` (for Stack members) or plain div conversions for `Text`/`View`/`H1`… (Text → span with mapped classes via the Typography component).
2. Rewrites JSX props per 3.x dictionary (token → class, shorthand → class).
3. Converts `styled(Component, {…})` static style objects into a `className` via `cx()` using the same dictionary (pseudo keys `:hover`/`:active`/`:focus`/`:disabled` → `hover:`/`active:`/`focus:`/`disabled:` variants; `$sm`-keyed variant objects → responsive variants).
4. Prints a per-file report of unhandled constructs (`useMedia`, `useTheme`, `animation=`, `elevation=`, `TamaguiElement`, `GetProps<`, `variants:` blocks) for the manual pass.
5. Never rewrites `data-testid`, i18n keys, or game logic.

Codemod output is **always reviewed**: run `--dry-run`, diff, then apply per feature directory.

---

## 5. Migration phases & tasks

> Order matters: infra → shared components → web by dependency direction (widgets last — they consume components). Every task keeps `pnpm lint`, `pnpm typecheck`, `pnpm test` (affected suites) green.

### Phase 1 — Tailwind infrastructure (foundation)

- [ ] Create `scripts/tamagui-codemod/` with `map.ts` (3.x dictionary) + runner + `--dry-run`.
- [ ] Create `packages/ui/src/components/Stack/Stack.tsx` compat primitives + export from `packages/ui/src/index.ts` (replacing the `from 'tamagui'` re-export line 79 — keep API identical).
- [ ] Add `packages/ui/src/hooks/useMediaQuery.ts` (old `useMedia` shape) + `packages/ui/src/hooks/useThemeColors.ts` (reads CSS vars, mirrors old `useTheme` keys).
- [ ] Extend `apps/web/tailwind.config.ts` + `packages/ui/tailwind.config.ts` `colors` with full token set (3.4); add `pointer-coarse` variant plugin; add remaining keyframes from `tamagui.config.ts`.
- [ ] Add parity test `scripts/tamagui-codemod/token-parity.test.ts` (or vitest in packages/ui): every color/size/radius/zIndex token in `packages/ui/src/tamagui.config.ts` has a mapping in the dictionary.
- [ ] Verify Storybook (`packages/ui/.storybook/preview.tsx`) renders Stack story with Tailwind classes.
- **Gate:** `pnpm --filter @arcadeum/ui test`, `pnpm check-file-length`, Storybook boots; codemod dry-run on one widget produces a sane diff.

### Phase 2 — Migrate `packages/ui` components (41 remaining)

Order: leaf components first (no deps on other tamagui components), then composites. Batch into ~8 tasks of 4–6 components each; within a batch, leaf → composite.

- [ ] Task 2a: `Badge`, `StatusBadge` (already free — verify), `IdleBadge`, `LiveChip`, `RankBadge`, `CosmeticBadge`, `RoleBadge`, `DeltaChip`, `TrendPill`.
- [ ] Task 2b: `Card`, `GlassCard`, `Section`, `Container`, `EmptyState`, `ErrorState`, `LoadingState`, `PageLoading`, `Skeleton`.
- [ ] Task 2c: `FormGroup`, `FormPips`, `FloatingLabelInput`, `Input` (verify), `TextArea` (verify), `Select` (verify), `FloatingLabelTextArea`.
- [ ] Task 2d: `Progress`, `EnergyBar`, `StatTile`, `ActivityTicker`, `EventTicker`, `CountdownClock`, `ModeTab`, `FilterChip`.
- [ ] Task 2e: `ChatHeader`, `ChatMessage`, `ChannelTile`, `ConnectionOverlay`, `ServerLoadingNotice`.
- [ ] Task 2f: `CollapsibleSection`, `ShopItemCard`, `RarityBorder`, `RewardTier`, `RunnerUpCard`, `MythicPortrait`, `MythicSpotlight`, `HeroBackdrop`.
- [ ] Task 2g: `PageTitle`, `PageLayout`, `Footer` (verify), `DownloadButtons`, `LaunchButton`, `Header/LogoInner`, `ProfileMenu`, `MobileLoginIndicator`.
- [ ] Task 2h: `Game/GameContainer`, `Game/GameLayout`, `Game/TurnIndicator`.
- [ ] Remove `TamaguiProvider` self-wrappers from migrated components; update their tests (`packages/ui` 10+ test files) to render without provider; delete `packages/ui/src/config/tamagui.test.config.ts`.
- [ ] Remove `tamagui` import + `'./tamagui.config'` side-effect from `packages/ui/src/index.ts` (keep Stack exports).
- **Gate:** `pnpm --filter @arcadeum/ui test && lint && typecheck`; Storybook visual pass of all components on dark + light; grep confirms 0 tamagui imports left in `packages/ui/src` (except `tamagui.config.ts` itself + Stack compat props that reference the dictionary only).

### Phase 3 — Web config & runtime removal (independent of component sweep)

- [ ] `apps/web/next.config.ts`: drop `withTamagui`, tamagui entries from `transpilePackages`, `turbopack.resolveAlias`, `optimizePackageImports`. Keep `@arcadeum/ui` in transpile/optimize.
- [ ] Delete `apps/web/src/app/TamaguiConfig.tsx`, `apps/web/src/shared/config/tamagui-css-injected.ts`, `apps/web/tamagui.config.ts`.
- [ ] `vitest.config.mts`: remove `server.deps.inline` tamagui workaround. `vitest.setup.ts`: remove tamagui config import + matchMedia mock if only needed by tamagui.
- [ ] `.storybook/preview.tsx` (web + ui): remove TamaguiProvider wrappers; keep theme toolbar (now sets `data-theme`/CSS vars only).
- [ ] Verify `ThemeContext` mints all 7 themes' vars identically pre/post removal (compare `getComputedStyle(document.documentElement)` snapshots for each theme before and after).
- [ ] `apps/web/src/app/layout.tsx`: remove `t_${theme}` class if ThemeContext doesn't need it; keep `data-theme`.
- **Gate:** `pnpm --filter web build` succeeds without tamagui plugin; home page + one themed page SSR and hydrate with no warnings; theme switch works across 7 themes.

### Phase 4 — Migrate `apps/web` shared + app shell (61 files under `app/` incl. tests)

- [ ] Migrate `app/[locale]/layout.tsx`, `app/[locale]/(app)/layout.tsx`, header/nav/footer shell files, root pages.
- [ ] Migrate `shared/` tamagui files (4) — theme, layout helpers.
- [ ] Update the 51 web test files that wrap `TamaguiProvider` → remove wrapper (render plain); delete `TamaguiProvider`/config imports.
- **Gate:** `pnpm --filter web test` green; `pnpm dev` boots and key pages render.

### Phase 5 — Migrate `features/` (100 files) in ~8 batches by domain

- [ ] Task 5a: auth, profile, header-adjacent features.
- [ ] Task 5b: games/catalog, game-lobby, matchmaking.
- [ ] Task 5c: chat, notifications, friends.
- [ ] Task 5d: admin-* (admin-payments, blocked-ips, tournaments, moderation).
- [ ] Task 5e: leaderboards, stats, developers, help, contact.
- [ ] Task 5f: solana-pay, wallet, shop/storefront.
- [ ] Task 5g: home/landing, marketing pages.
- [ ] Task 5h: remaining stragglers (grep `tamagui` per file).
- Each task: codemod dry-run → review → apply → manual pass for `styled()`/`useMedia`/`useTheme`/`animation` → component tests updated → run affected vitest files.
- **Gate:** per-batch `pnpm --filter web test -- <affected>`, typecheck; after 5h: **0 files in `features/` import tamagui** (grep).

### Phase 6 — Migrate `widgets/` (129 files) in ~10 batches (largest area)

- [ ] Task 6a: GameChat + Chat-related widgets.
- [ ] Task 6b: SeaBattleGame (ShipPlacementBoard 495 lines — watch the 500 limit, split if needed).
- [ ] Task 6c: ChessGame (Game.tsx 477 lines).
- [ ] Task 6d: CriticalGame (ui/styles/* huge `styled()` cluster — biggest single job; split `styles/` modules if they cross 500 lines).
- [ ] Task 6e: CascadeGame, TicTacToeGame, other turn-based games.
- [ ] Task 6f: ArcadeGame / action games.
- [ ] Task 6g: GameCard/GameList/GameHubs widgets.
- [ ] Task 6h: header widget (header-stable.scss — keep SCSS where already class-based; migrate only tamagui parts).
- [ ] Task 6i: tournament, events, rewards widgets.
- [ ] Task 6j: remaining widgets + `useAudioPlayer` (498 lines — split if it grows).
- **Gate:** grep shows **0 tamagui imports in `widgets/`**; Playwright widget specs green (see Phase 9).

### Phase 7 — Full sweep & compat-layer retirement

- [ ] `grep -rn "tamagui" apps/web/src packages/ui/src apps/mobile` → 0 hits (excluding lockfile residue before prune).
- [ ] Sweep `// TAMAGUI-COMPAT` inline-style flags from Phase 4.1 → convert to proper Tailwind arbitrary values.
- [ ] Delete `packages/ui/src/components/Stack` compat primitives; remove Stack exports from `index.ts`; update last consumers.
- [ ] Re-check the 124 formerly-tamagui Server Components — remove any accidental `'use client'` added during migration; keep client directive only where hooks/handlers exist (AGENTS.md rule).
- **Gate:** `pnpm typecheck` + `pnpm lint` green; `grep -ri tamagui apps packages` clean.

### Phase 8 — Dependency & config purge

- [ ] Root `package.json`: delete tamagui `pnpm.overrides` block; delete `scripts/patch-tamagui-token-init.mjs` + postinstall reference.
- [ ] `apps/web/package.json`: remove `tamagui`, `@tamagui/config`, `@tamagui/shorthands`, `@tamagui/next-plugin`, `@tamagui/avatar`, `react-native-web` (if nothing else uses it).
- [ ] `packages/ui/package.json`: remove tamagui peerDeps/devDeps; re-check `tailwindcss`/`autoprefixer`/`postcss` are regular devDeps.
- [ ] `apps/mobile/package.json`: remove unused `tamagui`, `@tamagui/config`, `@arcadeum/ui` deps.
- [ ] `pnpm install` → verify lockfile has **zero** `tamagui|@tamagui` entries.
- [ ] Delete `packages/ui/src/tamagui.config.ts`, `apps/web/src/shared/config/tamagui.config.ts`, `packages/ui/src/config/tamagui.test.config.ts`, `scripts/tamagui-codemod` (after final use), `docs/plans/tamagui-token-map.md` if it duplicated the dictionary (or keep as reference).
- **Gate:** fresh `pnpm install && pnpm build` from clean lockfile; `pnpm lint && pnpm test` full suite.

### Phase 9 — Verification & visual QA

- [ ] `pnpm check-file-length` (all files < 500 lines; split any grown files).
- [ ] Full `pnpm test` (ui vitest, web vitest, BE jest unaffected, mobile jest unaffected).
- [ ] Playwright e2e suite (30 specs) — all green; `NEXT_PUBLIC_E2E` shimmer behavior unchanged (Button already class-based).
- [ ] Manual visual pass across **7 themes × dark/light** on: home, a game lobby, active Critical game, chat, leaderboards, admin table, forms (Input/Select errors), mobile widths (375/768/1280).
- [ ] Contrast spot-check on text/buttons (themeDefinitions already encodes AA-safe values — confirm no regression).
- [ ] Hydration check: `next build && next start` on prod build, console clean on first paint + theme switch.
- [ ] Performance: record `next build` bundle-size delta (expect a significant drop — note in PR description).

---

## 6. Conventions & guardrails (apply in every task)

- **Never use `any`** — codemod types through the dictionary; manual code types props via the component's existing types.
- **500-line file limit** — before touching a near-limit file (CriticalGame `styles/`, `ShipPlacementBoard`, `useAudioPlayer`, `LeaderboardsPageContent`, `ComboModal`, Chess `Game.tsx`), split first if the migration would push it over.
- **i18n untouched** — no new user-facing strings; only class changes.
- **`data-testid` stability** — preserve every existing `data-testid`; before each widget/feature batch, snapshot them:
  ```bash
  grep -rn "data-testid" apps/web/src/<area>/ > /tmp/testids-before.txt
  grep -rn "data-testid" apps/web/e2e/ > /tmp/testids-e2e.txt
  ```
  and diff after the batch.
- **No `'use client'` regressions** — don't add client directives where tamagui was the only client dep; don't remove them from files that still use hooks/handlers.
- **Server components stay server** — after migration re-run the 124-file audit; any file that imports tamagui only for styling and had no `'use client'` should _not_ gain one.
- **Commit granularity** — one task = one conventional commit (`refactor(ui): migrate Badge/Card to Tailwind` style with ARC ticket in footer); branch `ARC-XXX`, PR targets `develop`.
- **Migration dictionary is law** — if a token has no mapping, add it to `map.ts` + parity test before using an inline arbitrary value.
- **Never rewrite** game logic, socket code, or API payloads in the same commit as styling.

---

## 7. Risks & mitigations

| Risk                                                                                                 | Mitigation                                                                                                                                |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Hydration mismatch / SSR regression                                                                  | Tailwind classes are static → _fewer_ hydration risks than Tamagui atomic CSS. Phase 3 gate checks SSR + theme switch with clean console. |
| Theme vars not minted after removing `themeClassNameOnRoot`                                          | `ThemeContext` already owns var minting; Phase 3 compares computed styles before/after for all 7 themes.                                  |
| `useMedia` JS logic breaks                                                                           | `useMediaQuery` hook mirrors old shape; migrators port call sites 1:1.                                                                    |
| Codemod produces subtle visual shifts (shorthand collisions like `p` vs `padding`, negative margins) | Per-batch visual pass + Playwright + token parity tests; dry-run review for every batch.                                                  |
| Files growing past 500 lines during `styled()` → class conversion                                    | Split styled style-objects into dedicated `*.classes.ts` modules (buttonClasses pattern) before conversion.                               |
| Bundle size / build regressions from removing next-plugin                                            | Compare `next build` output sizes pre/post; `pnpm --filter web build` gate per phase.                                                     |
| Mobile lockfile churn breaking Expo                                                                  | Mobile deps only removed, no code touched; verify `pnpm --filter mobile test` + Expo start after Phase 8.                                 |
| Storybook breaks (shared package has no app-provided CSS vars)                                       | ui tailwind config supplies literal fallbacks (`var(--primary, #0369a1)`); preview.tsx sets vars for all themes.                          |

---

## 8. Effort estimate & sequencing

- Phases 1–3: ~2–3 sessions (foundation, shared components, config removal).
- Phases 4–6: bulk of the work (~18 batches); parallelizable with 2 workers: features ↔ widgets.
- Phases 7–9: ~1–2 sessions (sweep, purge, QA).

Ordering note: Phase 3 (config removal) can run **in parallel with** Phases 5–6 as long as no file imports tamagui — the next-plugin compile list is additive; removing it before the sweep breaks the build. **Recommendation: run Phase 3 _after_ Phases 5–6 reach ~50%**, or keep `withTamagui` until Phase 8 and only remove the plugin then. Adjust: Phase 3 splits into 3a (storybook/vitest/layout cleanups — safe early) and 3b (next.config purge — after zero imports).
