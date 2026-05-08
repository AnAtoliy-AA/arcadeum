# Critical Game Header & Variant Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shrink the Critical game header from ~140px to ≤56px with a glassy pill design, and extend crime/horror/adventure variants from card-only theming to full layout/table/player immersion.

**Architecture:** Header is rebuilt as a single XStack row (no wrap) in `styles/header.tsx` and wired up in `CriticalGameHeader.tsx`. Three new full variant files (`crime-full.ts`, `horror-full.ts`, `adventure-full.ts`) each follow the `underwater.ts` flat-file pattern, then `index.ts` switches from shallow card merges to full spreads.

**Tech Stack:** Tamagui styled components, TypeScript, Next.js (apps/web). All work is inside `apps/web/src/widgets/CriticalGame/ui/`.

---

## File Map

| Action | Path |
|--------|------|
| Modify | `styles/header.tsx` |
| Modify | `CriticalGameHeader.tsx` |
| Modify | `styles/variants/base.ts` |
| Modify | `styles/variants/cyberpunk/header.ts` |
| Modify | `styles/variants/underwater.ts` |
| Modify | `styles/variants/index.ts` |
| Create | `styles/variants/crime-full.ts` |
| Create | `styles/variants/horror-full.ts` |
| Create | `styles/variants/adventure-full.ts` |

All paths are relative to `apps/web/src/widgets/CriticalGame/ui/`.

---

## Task 1: Neutralise `getTitleTextStyles` in existing variant configs

The glitch (cyberpunk) and water-reflection (underwater) title text effects are incompatible with the compact header. Safe-no-op them before touching the header component.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/cyberpunk/header.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/underwater.ts`

- [ ] **Step 1: Patch `base.ts`**

In `baseVariantStyles.header`, add the no-op (it doesn't currently define `getTitleTextStyles`):

```ts
// styles/variants/base.ts — inside header section, after getTitleBackground:
getTitleTextStyles: () => ({}),
```

- [ ] **Step 2: Patch `cyberpunk/header.ts`**

Replace the entire `getTitleTextStyles` implementation with a no-op:

```ts
// styles/variants/cyberpunk/header.ts
getTitleTextStyles: () => ({}),
```

Delete the old `before`/`after` glitch pseudo-element block entirely.

- [ ] **Step 3: Patch `underwater.ts`**

Replace the `getTitleTextStyles` implementation with a no-op:

```ts
// styles/variants/underwater.ts — inside header section
getTitleTextStyles: () => ({}),
```

Delete the old `textShadow` + water-reflection `before` block.

- [ ] **Step 4: Type-check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: zero errors related to `getTitleTextStyles`. Fix any type issues before continuing.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts \
        apps/web/src/widgets/CriticalGame/ui/styles/variants/cyberpunk/header.ts \
        apps/web/src/widgets/CriticalGame/ui/styles/variants/underwater.ts
git commit -m "refactor(ARC-456): no-op getTitleTextStyles in all existing variant configs"
```

---

## Task 2: Rebuild `styles/header.tsx` — compact pill layout

Replace the two-row structure with a single-row compact header. This is purely styled-component definitions; no JSX changes yet.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/header.tsx`

- [ ] **Step 1: Read the current file**

Read `apps/web/src/widgets/CriticalGame/ui/styles/header.tsx` in full before editing.

- [ ] **Step 2: Replace `GameHeader`**

Replace the `GameHeader` styled component with:

```ts
export const GameHeader = styled(XStack, {
  name: 'GameHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$7',
  paddingVertical: '$2',           // reduced from $4
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(16px)',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  marginHorizontal: -28,
  marginTop: -28,
  // no flexWrap — single row always
  position: 'relative',
  zIndex: 30,
  flexShrink: 0,
  overflow: 'hidden',

  $sm: {
    paddingHorizontal: '$4',
    paddingVertical: '$2',
    marginHorizontal: -8,
    marginTop: -8,
    gap: '$2',
  },

  variants: {
    $variant: (val: string, { theme }: { theme: TamaguiTheme }) => {
      const config = getVariantStyles(val).header;
      return {
        backgroundColor: config.getBackground(theme),
        borderBottomColor: config.getBorder(theme),
        // accent line at top via pseudo-element
        before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 28,
          right: 28,
          height: 2,
          background: config.getLineBackground(),
          boxShadow: config.getLineShadow(),
          borderRadius: 1,
        },
      };
    },
  } as const,
});
```

- [ ] **Step 3: Replace `GameInfo`**

Change from `YStack` (full-width) to `XStack` (compact inline):

```ts
export const GameInfo = styled(XStack, {
  name: 'GameInfo',
  alignItems: 'center',
  gap: '$2',
  minWidth: 0,
  flex: 1,
});
```

- [ ] **Step 4: Replace `GameTitle`**

```ts
export const GameTitle = styled(Text, {
  name: 'GameTitle',
  margin: 0,
  fontSize: 16,            // reduced from 24
  fontWeight: '800',
  letterSpacing: -0.3,
  position: 'relative',
  numberOfLines: 1,

  $sm: {
    fontSize: 14,
  },

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).header;
      return {
        background: config.getTitleBackground(),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        // getTitleTextStyles is now always () => ({}) — no spread needed
      };
    },
  } as const,
});
```

- [ ] **Step 5: Add `TurnStatusPill`**

Add below `TurnStatus`:

```ts
export const TurnStatusPill = styled(XStack, {
  name: 'TurnStatusPill',
  borderRadius: 20,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderWidth: 1,
  alignItems: 'center',
  flexShrink: 0,

  variants: {
    $status: {
      yourTurn: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: 'rgba(16,185,129,0.4)',
      },
      waiting: {
        backgroundColor: 'rgba(234,179,8,0.1)',
        borderColor: 'rgba(234,179,8,0.35)',
      },
      completed: {
        backgroundColor: 'rgba(148,163,184,0.1)',
        borderColor: 'rgba(148,163,184,0.25)',
      },
      default: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
      },
    },
  } as const,

  defaultVariants: {
    $status: 'default',
  },
});
```

- [ ] **Step 6: Add `VariantIconBadge`**

Add a new export for the variant emoji badge:

```ts
export const VariantIconBadge = styled(YStack, {
  name: 'VariantIconBadge',
  width: 30,
  height: 30,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  flexShrink: 0,

  $sm: {
    width: 24,
    height: 24,
  },
});
```

- [ ] **Step 7: Type-check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors. The `GameInfo` shape change (YStack → XStack) may surface type warnings in `CriticalGameHeader.tsx` — that's fine, they'll be fixed in Task 3.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/header.tsx
git commit -m "refactor(ARC-456): compact glassy pill header styled components"
```

---

## Task 3: Rewrite `CriticalGameHeader.tsx` JSX

Wire the new styled components into a single-row layout.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/CriticalGameHeader.tsx`

- [ ] **Step 1: Read the current file**

Read `apps/web/src/widgets/CriticalGame/ui/CriticalGameHeader.tsx` in full.

- [ ] **Step 2: Update imports**

Replace the imported names from `./styles/header`:

```ts
import {
  GameHeader,
  GameInfo,
  GameTitle,
  TurnStatus,
  TurnStatusPill,
  VariantIconBadge,
  HeaderActions,
  TimerControlsWrapper,
  FullscreenButton,
} from './styles/header';
```

Remove imports of `RoomNameBadge`, `RoomNameIcon`, `RoomNameText`, `FastBadge` from `./styles/lobby`.

- [ ] **Step 3: Rewrite the return JSX**

Replace everything inside the `return (...)` with:

```tsx
return (
  <GameHeader $variant={cardVariant as GameVariant}>
    <RulesModal
      isOpen={showRules}
      onClose={() => setShowRules(false)}
      currentVariant={cardVariant || 'default'}
      isFastMode={idleTimerEnabled}
      isPrivate={room.visibility === 'private'}
      t={t}
    />

    {/* Left: variant identity */}
    <GameInfo>
      <VariantIconBadge>
        <Text fontSize={15}>
          {CARD_VARIANTS.find((v) => v.id === cardVariant)?.emoji ?? '🎲'}
        </Text>
      </VariantIconBadge>

      <YStack gap={0} minWidth={0} flex={1}>
        <GameTitle $variant={cardVariant as GameVariant} numberOfLines={1}>
          {t('games.critical_v1.name')}
          {' · '}
          {(() => {
            const variant = CARD_VARIANTS.find((v) => v.id === cardVariant);
            return variant
              ? t(variant.name as TranslationKey)
              : t('games.critical_v1.variants.cyberpunk.name' as TranslationKey);
          })()}
        </GameTitle>

        <Text
          fontSize={11}
          opacity={0.45}
          numberOfLines={1}
          $sm={{ display: 'none' }}
        >
          {room.name}
          {idleTimerEnabled ? ' · ⚡' : ''}
        </Text>
      </YStack>
    </GameInfo>

    {/* Center: turn status */}
    <TurnStatusPill $status={turnStatusVariant}>
      <TurnStatus $status={turnStatusVariant}>{turnStatusText}</TurnStatus>
    </TurnStatusPill>

    {/* Right: actions */}
    <HeaderActions>
      {isLongPending && (
        <ServerLoadingNotice
          title={t('common.loading.title')}
          message={t('common.loading.message')}
          progress={progress}
          elapsedSeconds={elapsedSeconds}
          supportLabel={t('common.support')}
          onSupportClick={() => window.open(appConfig.supportCta.href, '_blank')}
        />
      )}

      {!isGameOver && currentPlayer && (
        <TimerControlsWrapper $sm={{ display: 'none' }}>
          <IdleTimerDisplay
            enabled={idleTimerEnabled}
            isMyTurn={isMyTurn}
            canAct={canAct}
            onTimeout={handleIdleTimeout}
            autoplayTriggered={idleTimerTriggered}
            onStop={handleStopAutoplay}
            t={t}
          />
          <AutoplayControls autoplayState={autoplayState} t={t} />
        </TimerControlsWrapper>
      )}

      <FullscreenButton
        onPress={() => setShowRules(true)}
        title="Game Rules"
      >
        📖
      </FullscreenButton>

      <FullscreenButton
        onPress={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
      </FullscreenButton>
    </HeaderActions>
  </GameHeader>
);
```

Note: `TimerControlsWrapper` now needs a `$sm={{ display: 'none' }}` prop — add it as an inline prop in JSX (Tamagui supports this).

- [ ] **Step 4: Type-check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors. Fix any import or prop-type issues before continuing.

- [ ] **Step 5: File length check**

```bash
cd /path/to/repo && pnpm check-file-length 2>&1 | grep CriticalGameHeader
```

Expected: no violation (file should be well under 500 lines).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/CriticalGameHeader.tsx
git commit -m "feat(ARC-456): compact single-row CriticalGameHeader with glassy pill"
```

---

## Task 4: Create `crime-full.ts` — full crime variant styles

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/variants/crime-full.ts`

The crime theme is **noir**: deep charcoal backgrounds, red primary (`#dc2626`), gold/amber accents. Think dark detective office, rain-slicked streets.

- [ ] **Step 1: Create the file**

```ts
// apps/web/src/widgets/CriticalGame/ui/styles/variants/crime-full.ts
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';
import { crimeVariantStyles } from './crime';

const C = VARIANT_COLORS.crime;

export const crimeFullVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      after: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(220,38,38,0.015) 2px,
          rgba(220,38,38,0.015) 3px
        )`,
        pointerEvents: 'none',
        zIndex: 0,
      },
    }),
    getRoomBackground: () => `
      radial-gradient(ellipse at 30% 0%, rgba(220,38,38,0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 100%, rgba(39,39,42,0.4) 0%, transparent 50%),
      linear-gradient(165deg, ${C.background} 0%, #0f0f0f 100%)
    `,
    getRoomBorder: (isMyTurn) =>
      isMyTurn ? `3px solid ${C.primary}cc` : `1px solid ${C.primary}33`,
    getRoomShadow: (isMyTurn) =>
      isMyTurn
        ? `0 0 20px ${C.primary}66, 0 0 40px ${C.primary}33, inset 0 0 20px ${C.primary}1a`
        : `0 25px 80px rgba(0,0,0,0.7), 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
  },

  header: {
    getBackground: () => `linear-gradient(135deg, ${C.background}f2, #0f0f0fe6)`,
    getBorder: () => `${C.primary}33`,
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${C.primary}99 25%, #f59e0b66 50%, ${C.primary}99 75%, transparent 100%)`,
    getLineShadow: () => `0 0 8px ${C.primary}66, 0 0 16px ${C.primary}33`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${C.primary} 0%, #f97316 50%, #f59e0b 100%)`,
    getTitleTextStyles: () => ({}),
  },

  table: {
    getBackground: () =>
      `linear-gradient(180deg, #0f0f0f 0%, ${C.secondary} 50%, #0f0f0f 100%)`,
    getBorder: () => `1px solid ${C.primary}4d`,
    getShadow: () =>
      `0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.3)`,
    center: {
      getBackground: () => `linear-gradient(145deg, #1a1a1a, ${C.secondary})`,
      getBorder: () => `2px solid ${C.primary}4d`,
      getShadow: () =>
        `0 12px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.03), inset 0 -2px 8px rgba(0,0,0,0.4)`,
      getGlow: () => `conic-gradient(
        from 0deg,
        ${C.primary}80 0deg,
        #f59e0b66 60deg,
        ${C.primary}4d 120deg,
        ${C.primary}33 180deg,
        #27272a 240deg,
        ${C.primary}66 300deg,
        ${C.primary}80 360deg
      )`,
    },
    actions: {
      getContainerStyles: () => ({}),
      getTitleStyles: () => ({}),
      getButtonStyles: () => ({}),
    },
  },

  header_unused: undefined as never, // satisfy TS — remove this line, header already defined above

  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser, isAlive) => {
      if (!isAlive) return 'rgba(39,39,42,0.4)';
      if (isCurrentTurn) return `linear-gradient(145deg, #3f0a0a, #1a0000)`;
      if (isCurrentUser) return `linear-gradient(145deg, #27272a, #18181b)`;
      return `linear-gradient(145deg, #1f1f1f, #18181b)`;
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return C.primary;
      if (isCurrentUser) return `${C.primary}80`;
      return `${C.primary}2a`;
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return `0 0 20px ${C.primary}66, 0 8px 28px rgba(0,0,0,0.5)`;
      if (isCurrentUser) return '0 6px 20px rgba(0,0,0,0.5)';
      return '0 4px 16px rgba(0,0,0,0.35)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '4px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '85px', maxWidth: '105px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? C.secondary : theme?.background?.val || 'inherit',
    getAvatarBorder: (isCurrentTurn) =>
      isCurrentTurn ? C.primary : `${C.primary}50`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn ? '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)' : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255,255,255,0.08)';
      if (isCurrentTurn) return `3px solid ${C.primary}`;
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 14px ${C.primary}80` : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${C.primary}99 0%, transparent 70%)`,
    getTurnIndicatorStyles: () => ({
      background: `linear-gradient(135deg, ${C.primary}, #f97316)`,
      border: '2px solid rgba(255,255,255,0.7)',
      boxShadow: `0 0 8px ${C.primary}99`,
      animation: 'bounce 1s ease-in-out infinite',
    }),
    getCardCountStyles: () => null,
  },

  tableInfo: {
    getBackground: () => `linear-gradient(135deg, #1a1a1ae6, ${C.secondary}d9)`,
    getBorder: () => `${C.primary}33`,
    getShadow: () => `0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
    getTextGlow: () => C.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : C.primary),
    getInfoCardBackground: () => `linear-gradient(135deg, #1a1a1ae6, ${C.secondary}d9)`,
    getInfoCardBorder: () => `${C.primary}33`,
    getInfoCardShadow: () => `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
    getInfoCardPattern: () => `repeating-linear-gradient(
      45deg, transparent, transparent 10px,
      rgba(220,38,38,0.02) 10px, rgba(220,38,38,0.02) 20px
    )`,
  },

  chat: {
    getBackground: () => `${C.secondary}cc`,
    getBorder: () => `1px solid ${C.primary}33`,
    getShadow: () => 'none',
    getInputBackground: () => `${C.secondary}cc`,
    getInputBorder: () => `${C.primary}33`,
    getInputFocusBorder: () => C.primary,
    getInputFocusShadow: () => `0 0 10px ${C.primary}4d`,
  },

  cards: crimeVariantStyles.cards!,
};
```

**Note:** Remove the `header_unused` line — that was a placeholder in the template above. The `header` key is already defined. The TS type requires all keys in `VariantStyleConfig`; if any are missing, the compiler will tell you exactly which ones.

- [ ] **Step 2: Type-check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep crime
```

Expected: no errors. If TypeScript reports missing required fields on `VariantStyleConfig`, add the missing methods using the `underwater.ts` reference.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/crime-full.ts
git commit -m "feat(ARC-456): full variant immersion styles for crime theme"
```

---

## Task 5: Create `horror-full.ts` — full horror variant styles

The horror theme is **emerald-on-dark**: deep black backgrounds, emerald primary (`#10b981`), gothic atmosphere.

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/variants/horror-full.ts`

- [ ] **Step 1: Create the file**

```ts
// apps/web/src/widgets/CriticalGame/ui/styles/variants/horror-full.ts
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';
import { horrorVariantStyles } from './horror';

const C = VARIANT_COLORS.horror;

export const horrorFullVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      before: {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, ${C.primary}08 0%, transparent 60%)`,
        animation: 'ambientGlow 8s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      },
    }),
    getRoomBackground: () => `
      radial-gradient(ellipse at 20% 0%, ${C.primary}0f 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, ${C.primary}0a 0%, transparent 50%),
      linear-gradient(165deg, ${C.background} 0%, #010410 100%)
    `,
    getRoomBorder: (isMyTurn) =>
      isMyTurn ? `3px solid ${C.primary}cc` : `1px solid ${C.primary}2a`,
    getRoomShadow: (isMyTurn) =>
      isMyTurn
        ? `0 0 20px ${C.primary}66, 0 0 40px ${C.primary}33, inset 0 0 20px ${C.primary}1a`
        : `0 25px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)`,
  },

  header: {
    getBackground: () => `linear-gradient(135deg, ${C.background}f5, ${C.secondary}e8)`,
    getBorder: () => `${C.primary}2a`,
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${C.primary}80 25%, ${C.primary}40 50%, ${C.primary}80 75%, transparent 100%)`,
    getLineShadow: () => `0 0 10px ${C.primary}66, 0 0 20px ${C.primary}33`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${C.primary} 0%, #059669 50%, #34d399 100%)`,
    getTitleTextStyles: () => ({}),
  },

  table: {
    getBackground: () =>
      `linear-gradient(180deg, ${C.background} 0%, ${C.secondary} 50%, ${C.background} 100%)`,
    getBorder: () => `1px solid ${C.primary}33`,
    getShadow: () =>
      `0 20px 60px rgba(0,0,0,0.9), inset 0 0 60px ${C.primary}08`,
    center: {
      getBackground: () => `linear-gradient(145deg, ${C.secondary}, #0a1628)`,
      getBorder: () => `2px solid ${C.primary}4d`,
      getShadow: () =>
        `0 12px 40px rgba(0,0,0,0.7), inset 0 0 20px ${C.primary}0d`,
      getGlow: () => `conic-gradient(
        from 0deg,
        ${C.primary}99 0deg,
        #0f172a 60deg,
        ${C.primary}66 120deg,
        ${C.primary}4d 180deg,
        #0f172a 240deg,
        ${C.primary}80 300deg,
        ${C.primary}99 360deg
      )`,
    },
    actions: {
      getContainerStyles: () => ({}),
      getTitleStyles: () => ({}),
      getButtonStyles: () => ({}),
    },
  },

  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser, isAlive) => {
      if (!isAlive) return `${C.secondary}66`;
      if (isCurrentTurn) return `linear-gradient(145deg, #0a2a1e, #051a10)`;
      if (isCurrentUser) return `linear-gradient(145deg, ${C.secondary}, ${C.background})`;
      return `linear-gradient(145deg, #0d1f17, ${C.background})`;
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return C.primary;
      if (isCurrentUser) return `${C.primary}80`;
      return `${C.primary}2a`;
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return `0 0 20px ${C.primary}66, 0 8px 24px rgba(0,0,0,0.5)`;
      if (isCurrentUser) return '0 6px 20px rgba(0,0,0,0.4)';
      return '0 4px 16px rgba(0,0,0,0.3)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '4px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '85px', maxWidth: '105px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? C.secondary : theme?.background?.val || 'inherit',
    getAvatarBorder: (isCurrentTurn) =>
      isCurrentTurn ? C.primary : `${C.primary}50`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 8px ${C.primary}99` : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255,255,255,0.06)';
      if (isCurrentTurn) return `3px solid ${C.primary}`;
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 15px ${C.primary}80` : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${C.primary}99 0%, transparent 70%)`,
    getTurnIndicatorStyles: () => ({
      background: `linear-gradient(135deg, ${C.primary}, #059669)`,
      border: '2px solid rgba(255,255,255,0.6)',
      boxShadow: `0 0 10px ${C.primary}99`,
      animation: 'bounce 1s ease-in-out infinite',
    }),
    getCardCountStyles: () => null,
  },

  tableInfo: {
    getBackground: () => `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getBorder: () => `${C.primary}33`,
    getShadow: () => `0 8px 32px rgba(0,0,0,0.6), inset 0 0 0 1px ${C.primary}1a`,
    getTextGlow: () => C.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : C.primary),
    getInfoCardBackground: () => `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getInfoCardBorder: () => `${C.primary}33`,
    getInfoCardShadow: () => `0 8px 32px rgba(0,0,0,0.5)`,
    getInfoCardPattern: () => `radial-gradient(circle at 50% 50%, ${C.primary}0d 0%, transparent 60%)`,
  },

  chat: {
    getBackground: () => `${C.secondary}cc`,
    getBorder: () => `1px solid ${C.primary}2a`,
    getShadow: () => 'none',
    getInputBackground: () => `${C.secondary}cc`,
    getInputBorder: () => `${C.primary}2a`,
    getInputFocusBorder: () => C.primary,
    getInputFocusShadow: () => `0 0 10px ${C.primary}4d`,
  },

  cards: horrorVariantStyles.cards!,
};
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep horror
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/horror-full.ts
git commit -m "feat(ARC-456): full variant immersion styles for horror theme"
```

---

## Task 6: Create `adventure-full.ts` — full adventure variant styles

The adventure theme is **amber-on-dark-brown**: ancient stone, gold, jungle warmth.

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure-full.ts`

- [ ] **Step 1: Create the file**

```ts
// apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure-full.ts
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';
import { adventureVariantStyles } from './adventure';

const C = VARIANT_COLORS.adventure;

export const adventureFullVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      before: {
        content: '""',
        position: 'absolute',
        top: '-60%',
        left: '-60%',
        width: '220%',
        height: '220%',
        background: `radial-gradient(circle at 30% 30%, rgba(245,158,11,0.1) 0%, transparent 35%),
                     radial-gradient(circle at 70% 70%, rgba(120,53,15,0.12) 0%, transparent 35%)`,
        animation: 'ambientGlow 12s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      },
    }),
    getRoomBackground: () => `
      radial-gradient(ellipse at 20% 0%, rgba(245,158,11,0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(120,53,15,0.2) 0%, transparent 50%),
      linear-gradient(165deg, ${C.background} 0%, #1a0a00 100%)
    `,
    getRoomBorder: (isMyTurn) =>
      isMyTurn ? `3px solid ${C.primary}cc` : `1px solid ${C.primary}33`,
    getRoomShadow: (isMyTurn) =>
      isMyTurn
        ? `0 0 20px ${C.primary}66, 0 0 40px ${C.primary}33, inset 0 0 20px ${C.primary}1a`
        : `0 25px 80px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
  },

  header: {
    getBackground: () => `linear-gradient(135deg, ${C.background}f2, #1a0a00e6)`,
    getBorder: () => `${C.primary}33`,
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${C.primary}99 25%, #d97706 50%, ${C.primary}99 75%, transparent 100%)`,
    getLineShadow: () => `0 0 8px ${C.primary}66, 0 0 16px ${C.primary}33`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${C.primary} 0%, #d97706 50%, #fbbf24 100%)`,
    getTitleTextStyles: () => ({}),
  },

  table: {
    getBackground: () =>
      `linear-gradient(180deg, #1a0a00 0%, ${C.secondary} 50%, #1a0a00 100%)`,
    getBorder: () => `1px solid ${C.primary}4d`,
    getShadow: () =>
      `0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,158,11,0.06)`,
    center: {
      getBackground: () => `linear-gradient(145deg, ${C.secondary}, #3d1f00)`,
      getBorder: () => `2px solid ${C.primary}4d`,
      getShadow: () =>
        `0 12px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(245,158,11,0.08)`,
      getGlow: () => `conic-gradient(
        from 0deg,
        ${C.primary}80 0deg,
        #d9770660 60deg,
        ${C.primary}4d 120deg,
        ${C.secondary} 180deg,
        #d9770640 240deg,
        ${C.primary}66 300deg,
        ${C.primary}80 360deg
      )`,
    },
    actions: {
      getContainerStyles: () => ({}),
      getTitleStyles: () => ({}),
      getButtonStyles: () => ({}),
    },
  },

  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser, isAlive) => {
      if (!isAlive) return `${C.secondary}66`;
      if (isCurrentTurn) return `linear-gradient(145deg, #5a2800, #3d1f00)`;
      if (isCurrentUser) return `linear-gradient(145deg, ${C.secondary}, ${C.background})`;
      return `linear-gradient(145deg, #2d1500, ${C.background})`;
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return C.primary;
      if (isCurrentUser) return `${C.primary}80`;
      return `${C.primary}2a`;
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return `0 0 20px ${C.primary}66, 0 8px 24px rgba(0,0,0,0.5)`;
      if (isCurrentUser) return '0 6px 20px rgba(0,0,0,0.4)';
      return '0 4px 16px rgba(0,0,0,0.3)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '8px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '85px', maxWidth: '105px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? C.secondary : theme?.background?.val || 'inherit',
    getAvatarBorder: (isCurrentTurn) =>
      isCurrentTurn ? C.primary : `${C.primary}50`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 1px 3px rgba(0,0,0,0.8), 0 0 8px ${C.primary}66` : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255,255,255,0.08)';
      if (isCurrentTurn) return `3px solid ${C.primary}`;
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 15px ${C.primary}80` : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${C.primary}99 0%, transparent 70%)`,
    getTurnIndicatorStyles: () => ({
      background: `linear-gradient(135deg, ${C.primary}, #d97706)`,
      border: '2px solid rgba(255,255,255,0.7)',
      boxShadow: `0 0 8px ${C.primary}99`,
      animation: 'bounce 1s ease-in-out infinite',
    }),
    getCardCountStyles: () => null,
  },

  tableInfo: {
    getBackground: () => `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getBorder: () => `${C.primary}33`,
    getShadow: () => `0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(245,158,11,0.06)`,
    getTextGlow: () => C.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : C.primary),
    getInfoCardBackground: () => `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getInfoCardBorder: () => `${C.primary}33`,
    getInfoCardShadow: () => `0 8px 24px rgba(0,0,0,0.4)`,
    getInfoCardPattern: () => `repeating-linear-gradient(
      45deg, transparent, transparent 10px,
      rgba(245,158,11,0.025) 10px, rgba(245,158,11,0.025) 20px
    )`,
  },

  chat: {
    getBackground: () => `${C.secondary}cc`,
    getBorder: () => `1px solid ${C.primary}33`,
    getShadow: () => 'none',
    getInputBackground: () => `${C.secondary}cc`,
    getInputBorder: () => `${C.primary}33`,
    getInputFocusBorder: () => C.primary,
    getInputFocusShadow: () => `0 0 10px ${C.primary}4d`,
  },

  cards: adventureVariantStyles.cards!,
};
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep adventure
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure-full.ts
git commit -m "feat(ARC-456): full variant immersion styles for adventure theme"
```

---

## Task 7: Wire `index.ts` + final validation

Connect the three new full variant configs in `getVariantStyles()` and run all checks.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts`

- [ ] **Step 1: Read `index.ts`**

Read `apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts` in full.

- [ ] **Step 2: Add imports and update switch cases**

Add three imports at the top:

```ts
import { crimeFullVariantStyles } from './crime-full';
import { horrorFullVariantStyles } from './horror-full';
import { adventureFullVariantStyles } from './adventure-full';
```

Replace the three shallow-merge cases:

```ts
case GAME_VARIANT.CRIME:
  return {
    ...baseVariantStyles,
    ...crimeFullVariantStyles,
  };
case GAME_VARIANT.HORROR:
  return {
    ...baseVariantStyles,
    ...horrorFullVariantStyles,
  };
case GAME_VARIANT.ADVENTURE:
  return {
    ...baseVariantStyles,
    ...adventureFullVariantStyles,
  };
```

Remove the old `crimeVariantStyles`, `horrorVariantStyles`, `adventureVariantStyles` imports from `index.ts` if they are no longer used there (the new full files import them directly).

- [ ] **Step 3: Full TypeScript check**

```bash
cd apps/web && pnpm tsc --noEmit 2>&1
```

Expected: zero errors. This is the most important check — fix any issues before proceeding.

- [ ] **Step 4: File length check**

```bash
pnpm check-file-length
```

Expected: no violations. If any of the new variant files exceed 500 lines, split the `players` section into a separate file (e.g., `crime-players.ts`) and import it.

- [ ] **Step 5: Build check**

```bash
pnpm --filter web build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/styles/variants/index.ts
git commit -m "feat(ARC-456): wire crime/horror/adventure full variant styles in getVariantStyles"
```

---

## Verification Checklist

After all tasks complete:

- [ ] Header height ≤ 56px desktop — measure visually or with browser devtools
- [ ] Header height ≤ 48px mobile — test at 375px viewport width
- [ ] No wrapping in the header row (title truncates with ellipsis if needed)
- [ ] All 6 variants show distinct board backgrounds when switching `cardVariant`
- [ ] Particle animations still play (snow for high-altitude, bubbles for underwater, etc.)
- [ ] Circular table layout unchanged
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm check-file-length` → no violations
