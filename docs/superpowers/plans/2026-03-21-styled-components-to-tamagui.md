# Styled-Components → Tamagui Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all `styled-components` usage from `apps/web/src/` and replace with Tamagui primitives and `@arcadeum/ui` / `@/shared/ui` components.

**Architecture:** 6 independent agents run in parallel, each owning one feature area. After all agents complete, the main session converts the styled-components registry to a passthrough, strips the styled theme provider, and deletes type augmentation. No automated tests exist for this UI-only migration — verification is TypeScript (`tsc --noEmit`) plus a visual browser check.

**Tech Stack:** Tamagui (`styled`, `XStack`, `YStack`, `Text`, `H1`–`H3`), `@arcadeum/ui` (`Card`, `Button`, `Modal*`, `PageLayout`, `Container`, `Section`, `Typography`, `PageTitle`, `EmptyState`, `ErrorState`, `LoadingState`, `Spinner`, `Badge`, `Avatar`, `GlassCard`, `Divider`), Next.js, TypeScript.

**Reference:** See `apps/web/src/app/payment/` for the established migration pattern. Key rules are in `docs/superpowers/specs/2026-03-21-styled-components-to-tamagui-migration-design.md`.

**IMPORTANT — token mapping quick reference:**
- `theme.text.primary` → `$color`
- `theme.text.secondary` → `color: 'rgba(236, 239, 238, 0.7)'`
- `theme.text.muted` → `color: 'rgba(236, 239, 238, 0.45)'`
- `theme.text.accent` / `theme.text.notice` / `theme.copyNotice` → `$accent`
- `theme.background.base` / `theme.surfaces.card.background` / `theme.surfaces.panel.background` → `$background`
- `theme.surfaces.card.border` / `theme.surfaces.panel.border` / `theme.interactive.option.border` → `$borderColor`
- `theme.buttons.primary.gradientStart` → `$primaryGradientStart`
- `theme.buttons.primary.gradientEnd` → `$primaryGradientEnd`
- `theme.buttons.primary.text` → `'#050316'` (hardcoded)
- `theme.buttons.secondary.*` → `$secondary` / `$secondaryGradientStart`
- `theme.interactive.option.background` / `theme.interactive.pill.*` → `$backgroundHover`
- `theme.background.radialStart` → `$backgroundRadialStart`
- `theme.outlines.focus` → `$borderColorFocus`

**IMPORTANT — breakpoints:**
- `max-width: 480px` → no Tamagui equivalent, use inline `<style>` tag
- `max-width: 640px` → `$xs` (20px gap, add comment)
- `max-width: 768px` / `max-width: 800px` → `$sm`
- `max-width: 1024px` → `$tablet`
- `min-width: 768px` / `min-width: 801px` → `$gtSm`
- `min-width: 1151px` → `$gtMd`

**IMPORTANT — patterns with no Tamagui equivalent:**
- `::before`, `::after`, child selectors (`& > button`), `:fullscreen`, `@media (hover: hover)`, `@media (prefers-reduced-motion)` → inline `<style>` tag with CSS class, applied via `className` prop
- `.attrs()` → replace with native element + CSS class
- `keyframes` animations → inline `<style>` tag or Tamagui `enterStyle` for simple fadeIn/slideIn

---

## Tasks 1–6 run IN PARALLEL (dispatch all simultaneously)

---

### Task 1: Migrate `home` area

**Files:**
- Modify: `apps/web/src/app/home/components/styles/Footer.styles.ts`
- Modify: `apps/web/src/app/home/components/modals/HomeGameDetailsModal.tsx`

#### Footer.styles.ts

- [ ] **Step 1: Read the file**

  Open `apps/web/src/app/home/components/styles/Footer.styles.ts`. Note:
  - `FooterSection` = `styled.footer` with `theme.surfaces.panel.background`, `theme.surfaces.card.border`
  - `FooterContent` = `styled.div` with max-width centering
  - `SocialContainer`, `SocialLinks` = flex divs
  - `SocialTitle` = `styled.h3` with `theme.text.muted`
  - `SocialIcon` = `styled.a` with `::before` pseudo-element gradient + hover — must use inline `<style>`
  - `Copyright`, `VersionText`, `LegalLinks` = simple divs/spans
  - `LegalLink` = `styled.a` with hover color change

- [ ] **Step 2: Rewrite as Tamagui**

  Replace the entire file:
  ```ts
  'use client';

  import { styled, YStack, XStack, Text } from 'tamagui';

  export const FooterSection = styled(YStack, {
    name: 'FooterSection',
    tag: 'footer',
    padding: '$10',
    paddingBottom: '$6',
    backgroundColor: '$background',
    borderTopWidth: 1,
    borderTopColor: '$borderColor',
    position: 'relative',
    zIndex: 10,
  });

  export const FooterContent = styled(YStack, {
    name: 'FooterContent',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: '$9',
    alignItems: 'center',
  });

  export const SocialContainer = styled(YStack, {
    name: 'SocialContainer',
    alignItems: 'center',
    gap: '$5',
  });

  export const SocialTitle = styled(Text, {
    name: 'SocialTitle',
    fontSize: '$2',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(236, 239, 238, 0.45)',
    margin: 0,
  });

  export const SocialLinks = styled(XStack, {
    name: 'SocialLinks',
    gap: '$5',
    flexWrap: 'wrap',
    justifyContent: 'center',
  });

  export const Copyright = styled(Text, {
    name: 'Copyright',
    fontSize: '$2',
    color: 'rgba(236, 239, 238, 0.45)',
    textAlign: 'center',
  });

  export const VersionText = styled(Text, {
    name: 'VersionText',
    opacity: 0.5,
    marginLeft: '$2',
    fontVariantNumeric: 'tabular-nums',
  });

  export const LegalLinks = styled(XStack, {
    name: 'LegalLinks',
    gap: '$5',
    marginTop: '$4',
    flexWrap: 'wrap',
    justifyContent: 'center',
  });
  ```

  For `SocialIcon` (has `::before` pseudo-element), keep it as a plain `<a>` element in the component that uses it and add an inline `<style>` tag there. Export a CSS class name constant instead:
  ```ts
  export const SOCIAL_ICON_CLASS = 'footer-social-icon';
  ```

  For `LegalLink` (hover color), use inline `style` or a plain `<a>` with `className` in the consuming component.

- [ ] **Step 3: Find the Footer component that consumes Footer.styles.ts**

  Run: `grep -r "Footer.styles" apps/web/src --include="*.tsx" --include="*.ts" -l`

  Open the consuming component. Locate `SocialIcon` and `LegalLink` usages.

- [ ] **Step 4: Update the Footer component**

  - Replace `<SocialIcon href={...}>` with `<a href={...} className="footer-social-icon" target="_blank" rel="noopener noreferrer">...</a>`
  - Add inline styles block with the `SocialIcon` CSS (from Footer.styles.ts lines 45–94) — convert theme tokens to CSS variables or hardcoded values:
  ```tsx
  const footerStyles = `
    .footer-social-icon {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--background, #151718);
      border: 1px solid var(--border, #32353d);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: #ecefee;
      transition: all 0.2s ease; position: relative; overflow: hidden;
      text-decoration: none;
    }
    .footer-social-icon::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, #7ad7ff, #57c3ff);
      opacity: 0; transition: opacity 0.2s;
    }
    .footer-social-icon span, .footer-social-icon svg { position: relative; z-index: 1; }
    .footer-social-icon:hover { transform: translateY(-2px); border-color: transparent; color: white; box-shadow: 0 4px 12px rgba(87,195,255,0.25); }
    .footer-social-icon:hover::before { opacity: 1; }
    .footer-social-icon:hover svg { fill: currentColor; }
    .footer-legal-link { font-size: 0.85rem; color: rgba(236,239,238,0.45); text-decoration: none; transition: color 0.2s; }
    .footer-legal-link:hover { color: #ecefee; }
  `;
  ```
  Inject via `<style>{footerStyles}</style>` at top of the Footer render.
  Replace `<LegalLink href={...}>` with `<a href={...} className="footer-legal-link">`.

- [ ] **Step 5: Verify no styled-components imports remain**

  Run: `grep "from 'styled-components'" apps/web/src/app/home/components/styles/Footer.styles.ts`
  Expected: no output.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/app/home/components/styles/Footer.styles.ts
  git add apps/web/src/app/home/  # pick up any consuming component changes
  git commit -m "refactor(home): replace Footer.styles styled-components with Tamagui"
  ```

#### HomeGameDetailsModal.tsx

- [ ] **Step 7: Read the file**

  Open `apps/web/src/app/home/components/modals/HomeGameDetailsModal.tsx`. Note:
  - `ModalGlassContent` = `styled(ModalContent)` — glassmorphism, convertible to `styled(ModalContent, {...})` from tamagui
  - `HeaderBackgroundEmoji` = absolute positioned div, simple `YStack`
  - `StyledModalTitle` = `styled(ModalTitle)` with gradient text — needs inline `<style>` for `-webkit-background-clip: text`
  - `TabsWrapper` = pill container, `XStack`
  - `TabPill` = conditional active state `<button>`, keep as native `<button>` with className
  - `ContentGrid`, `RulesGrid`, `ThemeCardsGrid` = grid divs — use inline `style` grid
  - `RuleCard` = card with hover — use `Card` from `@arcadeum/ui`
  - `RuleIcon`, `RuleText` = simple layout, `XStack`/`YStack`
  - `ThemeCard`, `ThemeName`, `StatusBadge`, `ModalActionFooter` = simple divs/spans

- [ ] **Step 8: Rewrite styled-components in HomeGameDetailsModal.tsx**

  Remove the `import styled from 'styled-components'` line.

  Add imports:
  ```tsx
  import { YStack, XStack, Text, styled } from 'tamagui';
  import { Card } from '@arcadeum/ui';
  ```

  Replace each styled component:

  ```tsx
  // ModalGlassContent — use Tamagui styled()
  import { ModalContent } from '@arcadeum/ui'; // already imported
  const ModalGlassContent = styled(ModalContent, {
    backgroundColor: 'rgba(21,23,24,0.8)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: '$borderColor',
    position: 'relative',
    overflow: 'hidden',
  } as any);

  // HeaderBackgroundEmoji — YStack
  const HeaderBackgroundEmoji = styled(YStack, {
    position: 'absolute',
    top: -20,
    right: -20,
    fontSize: 160,
    opacity: 0.1,
    pointerEvents: 'none',
    zIndex: 0,
  } as any);

  // ContentGrid — plain div with inline style (CSS grid)
  // Replace <ContentGrid> with <div style={{ display:'grid', gap:'1.5rem', position:'relative', zIndex:1 }}>

  // RulesGrid — plain div with inline style
  // Replace <RulesGrid> with <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.25rem' }}>

  // RuleCard — use Card from @arcadeum/ui with interactive + padding props
  // Replace <RuleCard> with <Card variant="default" cardPadding="md" style={{ borderRadius:20, display:'flex', flexDirection:'row', gap:'1.25rem', transition:'transform 0.2s ease' }}>

  // RuleIcon — XStack
  const RuleIconEl = ({ gradient, children }: { gradient?: string; children: React.ReactNode }) => (
    <XStack
      width={44} height={44} borderRadius={12}
      style={{ background: gradient ?? 'linear-gradient(135deg, #ff4d4d, #f9cb28)' }}
      alignItems="center" justifyContent="center"
      flexShrink={0}
    >
      {children}
    </XStack>
  );

  // RuleText — YStack with native h5/p inside
  // Replace <RuleText><h5>...</h5><p>...</p></RuleText> with:
  // <YStack gap="$1"><Text tag="h5" color="$color" fontSize="$4" fontWeight="700" margin={0}>{name}</Text><Text tag="p" color="rgba(236,239,238,0.7)" fontSize="$3" lineHeight={1.5} margin={0}>{desc}</Text></YStack>

  // ThemeCardsGrid — plain div with inline style
  // <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'1rem' }}>

  // ThemeCard — YStack
  const ThemeCardEl = styled(YStack, {
    borderRadius: 16,
    padding: '$4',
    gap: '$3',
    transition: 'all 0.2s ease',
    variants: {
      isPlayable: {
        true: { borderWidth: 1, borderColor: '$borderColor' },
        false: { opacity: 0.6 },
      },
    },
  } as any);

  // ThemeName — Text
  const ThemeNameEl = styled(Text, { color: '$color', fontWeight: '700', fontSize: '$4' });

  // StatusBadge — Text
  const StatusBadgeEl = styled(Text, {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: '$1',
    paddingHorizontal: '$2',
    borderRadius: 6,
  } as any);

  // ModalActionFooter — XStack
  const ModalActionFooter = styled(XStack, {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '$7',
    paddingTop: '$6',
    borderTopWidth: 1,
    borderTopColor: '$borderColor',
  } as any);
  ```

  For `StyledModalTitle` (gradient text with `-webkit-background-clip`): keep `ModalTitle` as-is and add gradient text via inline style:
  ```tsx
  <ModalTitle style={{
    background: game.gradient ?? 'linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '2.25rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
  }}>
    {t(game.nameKey)}
  </ModalTitle>
  ```

  For `TabPill` (native button with active state): keep as `<button>` with `className`:
  ```tsx
  const tabStyles = `
    .tab-pill { background: transparent; border: none; border-radius: 999px; padding: 0.6rem 2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); text-transform: uppercase; letter-spacing: 0.05em; color: rgba(236,239,238,0.7); }
    .tab-pill.active { background: #151718; color: #ecefee; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .tab-pill:hover { color: #ecefee; }
  `;
  // Wrap TabsWrapper with XStack, inject <style>{tabStyles}</style>
  ```

- [ ] **Step 9: Verify no styled-components imports remain**

  Run: `grep "from 'styled-components'" apps/web/src/app/home/components/modals/HomeGameDetailsModal.tsx`
  Expected: no output.

- [ ] **Step 10: Commit**

  ```bash
  git add apps/web/src/app/home/components/modals/HomeGameDetailsModal.tsx
  git commit -m "refactor(home): replace HomeGameDetailsModal styled-components with Tamagui"
  ```

---

### Task 2: Migrate `games` area

**Files:**
- Modify: `apps/web/src/app/games/styles.ts`
- Modify: `apps/web/src/app/games/room-card.styles.ts`
- Modify: `apps/web/src/app/games/create/styles.ts`
- Modify: `apps/web/src/app/games/rooms/[id]/components/styles.ts`
- Modify: `apps/web/src/app/games/[id]/GameDetailPage.tsx`
- Modify: `apps/web/src/app/games/components/InviteCodeModal.tsx`

#### games/styles.ts

- [ ] **Step 1: Read `apps/web/src/app/games/styles.ts`**

  Note: `Page`, `Container`, `Header`, `HeaderControls`, `ViewToggle`, `Title`, `Filters`, `SearchContainer`, `FilterGroup`, `FilterLabel`, `FilterChips`, `RoomsContainer`, `Loading`, `Spinner`, `Error`, `Empty`, `ServerWakeUpContainer`, `ScrollSentinel`, `EndOfListText`. Also `keyframes fadeIn` animation.

- [ ] **Step 2: Rewrite games/styles.ts**

  ```ts
  import { styled, YStack, XStack, Text } from 'tamagui';
  import { Spinner as SharedSpinner, Card, PageTitle as SharedPageTitle } from '@/shared/ui';

  const fadeInStyles = `
    @keyframes arcFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .games-container { animation: arcFadeIn 0.5s ease-out; }
  `;
  export { fadeInStyles };

  export const Page = styled(YStack, {
    name: 'GamesPage',
    tag: 'main',
    minHeight: '100vh',
    padding: '$5',
    paddingHorizontal: '$4',
    backgroundColor: '$background',
    color: '$color',
  });

  export const Container = styled(YStack, {
    name: 'GamesContainer',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: '$6',
  });

  export const Header = styled(XStack, {
    name: 'GamesHeader',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '$4',
    flexWrap: 'wrap',
  });

  export const HeaderControls = styled(XStack, {
    name: 'GamesHeaderControls',
    alignItems: 'center',
    gap: '$4',
  });

  export const ViewToggle = styled(XStack, {
    name: 'ViewToggle',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '$borderColor',
    $sm: { display: 'none' },
  });

  export const Title = styled(SharedPageTitle, {
    name: 'GamesTitle',
    // @ts-ignore
    size: 'xl',
    gradient: true,
    fontWeight: '800',
  } as any);

  export const Filters = styled(XStack, {
    name: 'GamesFilters',
    gap: '$6',
    flexWrap: 'wrap',
    padding: '$4',
    paddingHorizontal: '$5',
    backgroundColor: '$background',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '$borderColor',
  });

  export const SearchContainer = styled(XStack, {
    name: 'SearchContainer',
    flex: 1,
    minWidth: 200,
    maxWidth: 400,
    gap: '$2',
  });

  export const FilterGroup = styled(XStack, {
    name: 'FilterGroup',
    alignItems: 'center',
    gap: '$3',
  });

  export const FilterLabel = styled(Text, {
    name: 'FilterLabel',
    fontSize: '$1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'rgba(236, 239, 238, 0.45)',
  });

  export const FilterChips = styled(XStack, {
    name: 'FilterChips',
    flexWrap: 'wrap',
    gap: '$2',
  });

  export const Loading = styled(YStack, {
    name: 'GamesLoading',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '$5',
    padding: '$12',
    color: 'rgba(236, 239, 238, 0.45)',
    fontSize: '$3',
  });

  export const Spinner = SharedSpinner;

  export const Empty = styled(YStack, {
    name: 'GamesEmpty',
    padding: '$12',
    paddingHorizontal: '$6',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(236, 239, 238, 0.45)',
    fontSize: '$4',
    backgroundColor: '$background',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '$borderColor',
  });

  export const ServerWakeUpContainer = styled(XStack, {
    name: 'ServerWakeUp',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: '50vh',
    flex: 1,
  });

  export const ScrollSentinel = styled(XStack, {
    name: 'ScrollSentinel',
    justifyContent: 'center',
    padding: '$6',
    width: '100%',
  });

  export const EndOfListText = styled(Text, {
    name: 'EndOfListText',
    textAlign: 'center',
    padding: '$6',
    color: 'rgba(236, 239, 238, 0.45)',
    fontSize: '$3',
    fontWeight: '500',
  });
  ```

  For `RoomsContainer` (CSS grid with viewMode prop) and `Error` (styled Card), keep as inline style / plain element in the consuming component since CSS grid with variants is complex. Export a helper:
  ```ts
  export function getRoomsContainerStyle(viewMode?: 'grid' | 'list'): React.CSSProperties {
    if (viewMode === 'list') return { display: 'flex', flexDirection: 'column', gap: '1.25rem' };
    return { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' };
  }
  ```

- [ ] **Step 3: Find and update consuming pages**

  Run: `grep -r "from.*games/styles" apps/web/src --include="*.tsx" -l`
  Open each file. Replace `<RoomsContainer $viewMode={viewMode}>` with `<div style={getRoomsContainerStyle(viewMode)}>`. Add `import { fadeInStyles, getRoomsContainerStyle } from './styles'` and inject `<style>{fadeInStyles}</style>` plus `className="games-container"` on the container.

- [ ] **Step 4: Commit**

  ```bash
  git add apps/web/src/app/games/styles.ts
  git add apps/web/src/app/games/  # pick up consuming page changes
  git commit -m "refactor(games): replace games/styles.ts styled-components with Tamagui"
  ```

#### games/room-card.styles.ts

- [ ] **Step 5: Read `apps/web/src/app/games/room-card.styles.ts`**

  Note: `RoomCard` has `::before` pseudo-element, fadeIn + nth-child animation delays, `@media (max-width: 768px)`. `RoomTitle` has `gradientFlow` keyframe animation with `-webkit-background-clip`. These need inline `<style>`. Other components (`RoomHeader`, `StatusBadge`, `FastBadge`, `BadgeIcon`, `RoomMeta`, `MetaRow`, `MetaIcon`, `MetaLabel`, `MetaValue`, `ParticipantsLabel`, `MetaListContainer`, `RoomActions`, `ParticipantsList`, `ParticipantChip`, `GameNameValue`) are simpler.

- [ ] **Step 6: Rewrite room-card.styles.ts**

  Export a CSS string for complex styles and Tamagui `styled()` for the rest:

  ```ts
  import { styled, YStack, XStack, Text } from 'tamagui';

  export const roomCardStyles = `
    @keyframes arcFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .room-card {
      border-radius: 20px; border: 1px solid #32353d;
      background: linear-gradient(145deg, #151718, #1a1c1e);
      display: flex; flex-direction: column; gap: 1rem;
      transition: all 0.3s ease; animation: arcFadeIn 0.5s ease-out both;
      position: relative; overflow: hidden; padding: 1.5rem;
    }
    .room-card.list-view { flex-direction: row; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1rem 1.5rem; border-radius: 14px; }
    @media (max-width: 800px) { /* approx 768px → $sm */ .room-card.list-view { flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 1rem; padding: 1.5rem; border-radius: 20px; } }
    .room-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, #7ad7ff, transparent); opacity: 0; transition: opacity 0.3s ease; }
    .room-card:hover { transform: translateY(-4px); border-color: rgba(122,215,255,0.25); box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 20px rgba(122,215,255,0.12); }
    .room-card:hover::before { opacity: 1; }
    .room-card:nth-child(1) { animation-delay: 0s; }
    .room-card:nth-child(2) { animation-delay: 0.1s; }
    .room-card:nth-child(3) { animation-delay: 0.2s; }
    .room-card:nth-child(4) { animation-delay: 0.3s; }
    .room-card:nth-child(5) { animation-delay: 0.4s; }
    .room-title {
      margin: 0; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px;
      background: linear-gradient(-45deg, #ecefee, #7ad7ff, #57c3ff, #ecefee);
      background-size: 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; animation: gradientFlow 5s ease infinite;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;
    }
  `;

  export const RoomHeader = styled(XStack, {
    name: 'RoomHeader',
    gap: '$4',
    variants: {
      viewMode: {
        list: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '$2', minWidth: 200 },
        grid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      },
    },
  } as any);

  export const RoomMeta = styled(YStack, {
    name: 'RoomMeta',
    gap: '$3',
    fontSize: '$2',
    color: '$color',
  });

  export const MetaRow = styled(XStack, {
    name: 'MetaRow',
    alignItems: 'center',
    gap: '$2',
    color: '$color',
  });

  export const MetaIcon = styled(Text, { fontSize: '$2' });
  export const MetaLabel = styled(Text, { fontWeight: '500', color: 'rgba(236,239,238,0.45)', fontSize: '$1' });
  export const MetaValue = styled(Text, { color: '$color', fontWeight: '600' });
  export const ParticipantsLabel = styled(MetaLabel, { display: 'flex', marginBottom: '$1' });
  export const MetaListContainer = styled(XStack, { gap: '$5', alignItems: 'center', flex: 1, flexWrap: 'wrap' });

  export const RoomActions = styled(XStack, {
    name: 'RoomActions',
    gap: '$3',
    variants: {
      viewMode: {
        list: { marginTop: 0, paddingTop: 0, flexShrink: 0 },
        grid: { marginTop: '$2', paddingTop: '$4', borderTopWidth: 1, borderTopColor: '$borderColor' },
      },
    },
  } as any);

  export const ParticipantsList = styled(XStack, {
    name: 'ParticipantsList',
    flexWrap: 'wrap',
    gap: '$2',
    marginTop: '$1',
  });

  export const ParticipantChip = styled(Text, {
    name: 'ParticipantChip',
    display: 'inline-flex',
    alignItems: 'center',
    paddingVertical: '$1',
    paddingHorizontal: '$3',
    borderRadius: 6,
    fontSize: '$1',
    fontWeight: '600',
    color: '$color',
    borderWidth: 1,
    borderColor: '$borderColor',
    variants: {
      isHost: {
        true: { borderColor: '$primaryGradientStart' },
      },
    },
  } as any);
  ```

  For `StatusBadge`, `FastBadge`, `BadgeIcon`: these use static colors, keep as styled `Text`:
  ```ts
  export const BadgeIcon = styled(Text, { marginRight: '$1' });
  // StatusBadge and FastBadge: export plain functions using inline style for the dynamic gradient colors
  export function getStatusBadgeStyle(status: string): React.CSSProperties {
    const bg = status === 'lobby'
      ? 'linear-gradient(135deg, #10B981, #059669)'
      : status === 'in_progress'
        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
        : 'linear-gradient(135deg, #6B7280, #4B5563)';
    return { background: bg, color: 'white', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap', flexShrink: 0 };
  }
  ```

  For `GameNameValue`: replace with inline `style` in consuming component.

- [ ] **Step 7: Find and update consuming components**

  Run: `grep -r "room-card.styles" apps/web/src --include="*.tsx" -l`
  Open each file. Replace `<RoomCard $viewMode={v}>` with `<div className={cn('room-card', v === 'list' ? 'list-view' : '')} ...>`. Add `<style>{roomCardStyles}</style>` to the consuming component. Replace `<RoomTitle>` with `<h3 className="room-title">`. Replace `StatusBadge` with `<span style={getStatusBadgeStyle(status)}>`. Inject `import { roomCardStyles, ... }`.

- [ ] **Step 8: Commit**

  ```bash
  git add apps/web/src/app/games/room-card.styles.ts
  git add apps/web/src/app/games/  # consuming components
  git commit -m "refactor(games): replace room-card.styles styled-components with Tamagui"
  ```

#### games/create/styles.ts

- [ ] **Step 9: Read and rewrite `apps/web/src/app/games/create/styles.ts`**

  Note: `SelectionIndicator` has `::after { content: '✓' }`, `GameTile` uses `${SelectionIndicator}` nested selector and `${GameTile}:hover & {}` pattern in `GameTileIcon` — must use inline `<style>`. `Row` has `@media (max-width: 640px)` → `$xs`.

  Rewrite:
  ```ts
  import { styled, YStack, XStack, Text } from 'tamagui';
  import { Card } from '@/shared/ui';

  export const gameTileStyles = `
    .selection-indicator { position: absolute; top: 0.75rem; right: 0.75rem; width: 1.25rem; height: 1.25rem; border-radius: 50%; background: #7ad7ff; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; opacity: 0; transform: scale(0.5); transition: all 0.2s ease; }
    .selection-indicator::after { content: '✓'; font-weight: bold; }
    .game-tile:hover .selection-indicator, .game-tile.active .selection-indicator { opacity: 1; transform: scale(1); }
    .game-tile:hover .game-tile-icon { transform: scale(1.1); }
    .game-tile-icon { transition: transform 0.3s ease; }
  `;

  export const Form = styled(YStack, { name: 'CreateForm', tag: 'form', gap: '$5' });

  export const GameSelector = styled(YStack, {
    name: 'GameSelector',
    // CSS grid via inline style in consuming component
  });

  export const GameTile = styled(Card, {
    name: 'GameTile',
    padding: '$4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '$borderColor',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    variants: {
      active: {
        true: { borderColor: '$primaryGradientStart', backgroundColor: 'rgba(87,195,255,0.05)' },
        false: { backgroundColor: 'rgba(255,255,255,0.03)' },
      },
    },
  } as any);

  export const GameTileIcon = styled(Text, { name: 'GameTileIcon', fontSize: 40, marginBottom: '$3', display: 'inline-block' });
  export const GameTileName = styled(Text, { fontWeight: '700', fontSize: '$4', marginBottom: '$1', color: '$color' });
  export const GameTileSummary = styled(Text, { fontSize: '$2', color: 'rgba(236,239,238,0.7)', lineHeight: 1.4 });
  export const ComingSoonBadge = styled(Text, {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '$background', color: 'rgba(236,239,238,0.45)',
    fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
    paddingVertical: '$1', paddingHorizontal: '$2', borderRadius: 4,
    borderWidth: 1, borderColor: '$borderColor',
  } as any);

  export const Row = styled(XStack, {
    name: 'CreateRow',
    gap: '$4',
    $xs: { flexDirection: 'column' }, // approx 640px, Tamagui $xs=660px
  });

  export const ExpansionGrid = styled(YStack, { name: 'ExpansionGrid', gap: '$3' });

  export const ExpansionCheckbox = styled(XStack, {
    name: 'ExpansionCheckbox',
    tag: 'label',
    alignItems: 'center',
    gap: '$3',
    padding: '$3',
    paddingHorizontal: '$4',
    borderRadius: 8,
    backgroundColor: '$background',
    borderWidth: 1,
    borderColor: '$borderColor',
    transition: 'all 0.2s ease',
  } as any);

  export const ExpansionLabel = styled(Text, { flex: 1, fontSize: '$2', fontWeight: '500' });
  export const ExpansionBadge = styled(Text, { fontSize: '$1', color: 'rgba(236,239,238,0.45)', backgroundColor: '$background', paddingVertical: '$0', paddingHorizontal: '$2', borderRadius: 12 } as any);

  export const ExpandablePackContainer = styled(YStack, { gap: '$2' });
  export const ExpandablePackHeader = styled(XStack, {
    alignItems: 'center', gap: '$3', padding: '$3', paddingHorizontal: '$4',
    borderRadius: 8, backgroundColor: '$background', borderWidth: 1, borderColor: '$borderColor',
    transition: 'all 0.2s ease',
  } as any);
  export const ExpandToggle = styled(Text, { marginLeft: 'auto', fontSize: '$2' });
  export const PackCardList = styled(YStack, { gap: '$1', paddingLeft: '$5', marginTop: -2 });
  export const PackCardRow = styled(XStack, {
    tag: 'label', alignItems: 'center', gap: '$2', padding: '$2', paddingHorizontal: '$3',
    borderRadius: 6, backgroundColor: '$background', transition: 'background 0.15s ease',
  } as any);
  export const PackCardName = styled(Text, { flex: 1, fontSize: 13, color: 'rgba(236,239,238,0.7)' });
  export const QuantityControl = styled(XStack, { alignItems: 'center', gap: '$1' });
  export const QuantityValue = styled(Text, { minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: '600', color: '$color' });
  export const SelectAllRow = styled(XStack, {
    tag: 'label', alignItems: 'center', gap: '$3', padding: '$3', paddingHorizontal: '$4',
    marginBottom: '$2', borderRadius: 8, backgroundColor: '$background',
    borderWidth: 1, borderColor: '$borderColor', transition: 'all 0.2s ease',
  } as any);
  export const ThemeHeader = styled(XStack, { justifyContent: 'space-between', alignItems: 'center', marginBottom: '$4' });
  ```

  Find consuming components and inject `<style>{gameTileStyles}</style>`, add `className="game-tile"` + `className="game-tile-icon"` + `className="selection-indicator"`.

- [ ] **Step 10: Commit**

  ```bash
  git add apps/web/src/app/games/create/styles.ts
  git add apps/web/src/app/games/create/
  git commit -m "refactor(games): replace create/styles.ts styled-components with Tamagui"
  ```

#### games/rooms/[id]/components/styles.ts

- [ ] **Step 11: Read and rewrite `apps/web/src/app/games/rooms/[id]/components/styles.ts`**

  Key: `Container` has `:fullscreen` / `:-webkit-full-screen` / `:-moz-full-screen` blocks → inline `<style>`. `LoginLink` uses `theme.text.notice` → `$accent`. `NoticeMessage` extends `ErrorMessage` with `theme.interactive.pill.*` → `$backgroundHover` / `$borderColor`.

  ```ts
  import { styled, YStack, XStack, Text } from 'tamagui';

  export const fullscreenStyles = `
    .game-room-container:fullscreen,
    .game-room-container:-webkit-full-screen,
    .game-room-container:-moz-full-screen {
      max-width: 100%; width: 100%; height: 100%;
      background: #151718; padding: 1rem 2rem;
      overflow-y: auto; overflow-x: hidden;
    }
  `;

  export const Page = styled(YStack, {
    name: 'GameRoomPage', tag: 'main', height: '100vh',
    flexDirection: 'column', backgroundColor: '$background',
    color: '$color', position: 'relative', overflow: 'hidden',
  });

  export const Container = styled(YStack, {
    name: 'GameRoomContainer',
    maxWidth: 1400, width: '100%', alignSelf: 'center',
    padding: '$4', gap: '$4', flex: 1, minHeight: 0, overflowY: 'auto',
  } as any);

  export const LoadingContainer = styled(XStack, {
    name: 'LoadingContainer', alignItems: 'center', justifyContent: 'center',
    minHeight: '50vh', fontSize: '$4', color: 'rgba(236,239,238,0.7)',
  });

  export const ErrorContainer = styled(YStack, {
    name: 'ErrorContainer', padding: '$6', alignItems: 'center', color: '#dc2626',
  });

  export const GameWrapper = styled(YStack, {
    name: 'GameWrapper', flex: 1, minWidth: 0, minHeight: 0, flexDirection: 'column',
  });

  export const Card = styled(YStack, {
    name: 'GlassCard',
    backgroundColor: 'rgba(30,30,40,0.6)',
    backdropFilter: 'blur(12px)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24, padding: '$8', paddingHorizontal: '$6',
    maxWidth: 480, width: '100%', alignSelf: 'center',
    alignItems: 'center', textAlign: 'center',
    shadowColor: 'rgba(0,0,0,0.2)', shadowRadius: 32,
  } as any);

  export const Title = styled(Text, {
    name: 'RoomTitle', tag: 'h2', fontSize: '$7', fontWeight: '700',
    marginBottom: '$3',
    style: { background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  } as any);

  export const Description = styled(Text, {
    name: 'Description', color: 'rgba(236,239,238,0.7)', marginBottom: '$6', lineHeight: 1.6, fontSize: '$3',
  });

  export const Form = styled(YStack, { name: 'RoomForm', tag: 'form', width: '100%', gap: '$4' });
  export const InputGroup = styled(XStack, { gap: '$3', width: '100%' });

  export const ErrorMessage = styled(YStack, {
    name: 'ErrorMessage', color: '#ef4444', fontSize: '$2',
    backgroundColor: 'rgba(239,68,68,0.1)', padding: '$2', paddingHorizontal: '$3',
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  });

  export const Input = styled(YStack, {
    // Use @arcadeum/ui Input component instead of this custom styled input
    // This export kept for reference only — replace usages with <Input from '@arcadeum/ui'>
  } as any);

  export const LoginLink = styled(Text, {
    name: 'LoginLink', tag: 'a', color: '$accent', // theme.text.notice → $accent (note: differs in violet/teal themes)
    textDecorationLine: 'underline', marginTop: '$4', display: 'inline-flex',
  } as any);

  export const LockIcon = styled(XStack, {
    name: 'LockIcon', fontSize: 48, marginBottom: '$4', justifyContent: 'center', alignItems: 'center',
  });

  export const NoticeMessage = styled(YStack, {
    name: 'NoticeMessage', color: '$accent',
    backgroundColor: '$backgroundHover', // theme.interactive.pill.activeBackground
    padding: '$2', paddingHorizontal: '$3', borderRadius: 6,
    borderWidth: 1, borderColor: '$borderColor', // theme.interactive.pill.activeBorder
    fontSize: '$2',
  } as any);
  ```

  Find consuming component and add `<style>{fullscreenStyles}</style>` + `className="game-room-container"` on the `Container` element. Replace `<Input>` styled component usages with `<Input from '@arcadeum/ui'>`.

- [ ] **Step 12: Commit**

  ```bash
  git add apps/web/src/app/games/rooms/
  git commit -m "refactor(games): replace rooms/[id]/components/styles.ts styled-components with Tamagui"
  ```

#### games/[id]/GameDetailPage.tsx

- [ ] **Step 13: Read `apps/web/src/app/games/[id]/GameDetailPage.tsx`**

  Note: `RoomCard` extends `Card` from `@arcadeum/ui` with `.attrs({ interactive: true, padding: 'md' })` — `.attrs()` has no Tamagui equivalent. Also `RoomHeader`, `RoomMeta`, `JoinButton`, `EmptyRooms`, `BadgesRow`, `CreatedAtText`.

- [ ] **Step 14: Rewrite inline styled-components in GameDetailPage.tsx**

  Remove `import styled from 'styled-components'`. Add `import { YStack, XStack, Text, styled } from 'tamagui'`.

  Replace styled components at bottom of file:
  ```tsx
  // RoomCard: was styled(Card).attrs({ interactive:true, padding:'md' })
  // Replace with: <Card interactive padding="md" ...> directly in JSX, remove RoomCard styled component
  // Use the Card component inline with tag="a" for the link behavior

  const RoomHeader = styled(XStack, { justifyContent: 'space-between', alignItems: 'center', gap: '$3' });
  const RoomMeta = styled(XStack, { gap: '$4', flexWrap: 'wrap', alignItems: 'center' });
  const JoinButton = styled(YStack, { marginTop: '$3' }); // or remove if just wrapping a button
  const EmptyRooms = styled(YStack, { alignItems: 'center', gap: '$4', padding: '$8' });
  const BadgesRow = styled(XStack, { gap: '$2', flexWrap: 'wrap' });
  const CreatedAtText = styled(Text, { fontSize: '$1', color: 'rgba(236,239,238,0.45)' });
  ```

  In JSX, replace `<RoomCard>` with `<Card interactive padding="md" style={{ textDecoration:'none', display:'flex', flexDirection:'column', gap:'0.75rem' }}>`.

- [ ] **Step 15: Commit**

  ```bash
  git add apps/web/src/app/games/[id]/GameDetailPage.tsx
  git commit -m "refactor(games): replace GameDetailPage styled-components with Tamagui"
  ```

#### games/components/InviteCodeModal.tsx

- [ ] **Step 16: Rewrite inline styled-components in InviteCodeModal.tsx**

  Remove `import styled from 'styled-components'`. Add `import { YStack, Text, styled } from 'tamagui'; import { Input as UiInput } from '@arcadeum/ui'`.

  Replace the 4 styled components at the bottom:
  ```tsx
  const InputContainer = styled(YStack, { gap: '$2' });
  const Label = styled(Text, { tag: 'label', fontSize: '$2', fontWeight: '500', color: 'rgba(236,239,238,0.7)' } as any);
  // Input: replace with <UiInput> from @arcadeum/ui (drop the styled.input)
  const ErrorMessageEl = styled(Text, { color: '#ef4444', fontSize: '$2', marginTop: '$1' });
  const HelperText = styled(Text, { tag: 'p', color: 'rgba(236,239,238,0.7)', fontSize: 13, marginTop: '$2', lineHeight: 1.4, margin: 0 } as any);
  ```

  In JSX, replace `<Input ...>` with `<UiInput ...>` and `<ErrorMessage>` with `<ErrorMessageEl>`.

- [ ] **Step 17: Commit**

  ```bash
  git add apps/web/src/app/games/components/InviteCodeModal.tsx
  git commit -m "refactor(games): replace InviteCodeModal styled-components with Tamagui"
  ```

---

### Task 3: Migrate `stats` area

**Files:**
- Modify: `apps/web/src/app/stats/styles.ts`
- Modify: `apps/web/src/app/stats/StatsPage.tsx`
- Modify: `apps/web/src/app/stats/components/Leaderboard.tsx`
- Modify: `apps/web/src/app/stats/components/StatsHeader.tsx`
- Modify: `apps/web/src/app/stats/components/GameBreakdown.tsx`
- Modify: `apps/web/src/app/stats/components/StatsOverview.tsx`

- [ ] **Step 1: Read all 6 stats files**

  Open each file and note all styled-components. Pay attention to:
  - `stats/styles.ts`: `Page`, `Container`, `Grid`, `Card`, `CardTitle`, `StatValue`, `StatLabel`, `BreakdownTable`
  - `StatsPage.tsx`: imports from `stats/styles.ts` plus possibly inline styled
  - `Leaderboard.tsx`: complex component with many styled elements
  - `StatsHeader.tsx`: header with filters
  - `GameBreakdown.tsx`: breakdown table rows
  - `StatsOverview.tsx`: overview cards

- [ ] **Step 2: Rewrite `stats/styles.ts`**

  ```ts
  import { styled, YStack, XStack, Text } from 'tamagui';
  import { Card as SharedCard, PageTitle as SharedPageTitle } from '@/shared/ui';

  export const Page = styled(YStack, {
    name: 'StatsPage', minHeight: '100vh', backgroundColor: '$background', paddingTop: 80,
  });

  export const Container = styled(YStack, {
    name: 'StatsContainer', maxWidth: 1200, width: '100%', alignSelf: 'center', padding: '$6', paddingHorizontal: '$4',
  });

  export const Grid = styled(YStack, {
    name: 'StatsGrid', marginTop: '$6',
    // CSS grid needs inline style: display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem'
  });

  export const Card = styled(SharedCard, { name: 'StatCard' }); // use variant="default" cardPadding="md" in JSX

  export const CardTitle = styled(Text, {
    name: 'StatCardTitle', tag: 'h3', fontSize: '$4', fontWeight: '600', color: '$color', margin: 0,
  } as any);

  export const StatValue = styled(Text, {
    name: 'StatValue', fontSize: '$9', fontWeight: '700', color: '$primaryGradientStart',
  });

  export const StatLabel = styled(Text, {
    name: 'StatLabel', fontSize: '$2', color: 'rgba(236,239,238,0.7)',
    textTransform: 'uppercase', letterSpacing: 1,
  });

  export const BreakdownTable = styled(YStack, {
    name: 'BreakdownTable', width: '100%', marginTop: '$6',
    backgroundColor: '$background', borderWidth: 1, borderColor: '$borderColor',
    borderRadius: 12, overflow: 'hidden',
  });
  ```

  Update consuming `StatsPage.tsx` to pass `style={{ display:'grid', ... }}` to `<Grid>` or replace `<Grid>` with `<div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem', marginTop:'2rem' }}>`.

- [ ] **Step 3: Read and rewrite `StatsPage.tsx`**

  Remove `styled-components` import. Replace any inline styled components with Tamagui. Use `PageLayout`, `Container`, `PageTitle` from `@/shared/ui`.

- [ ] **Step 4: Read and rewrite `Leaderboard.tsx`**

  Remove `styled-components` import. Replace each styled component:
  - Layout wrappers → `YStack`/`XStack`
  - Text elements → `Text`
  - Card containers → `Card` from `@arcadeum/ui`
  - Any shimmer keyframes → export `shimmerStyles` string and inject `<style>` in component

- [ ] **Step 5: Read and rewrite `StatsHeader.tsx`**

  Remove `styled-components` import. Replace each styled component with Tamagui primitives. Filter chips → `XStack` wrapping `Badge` components from `@arcadeum/ui`.

- [ ] **Step 6: Read and rewrite `GameBreakdown.tsx`**

  Remove `styled-components` import. Table rows → `XStack`. Use `Card` from `@arcadeum/ui` for card containers. Text → `Text`.

- [ ] **Step 7: Read and rewrite `StatsOverview.tsx`**

  Remove `styled-components` import. Cards → `Card` from `@arcadeum/ui`. Stats values → `Text` with `$primaryGradientStart` color. Labels → `Text` with muted color.

- [ ] **Step 8: Verify no styled-components imports remain in stats/**

  Run: `grep -r "from 'styled-components'" apps/web/src/app/stats/`
  Expected: no output.

- [ ] **Step 9: Commit**

  ```bash
  git add apps/web/src/app/stats/
  git commit -m "refactor(stats): replace all styled-components with Tamagui"
  ```

---

### Task 4: Migrate `chats-notes` area

**Files:**
- Modify: `apps/web/src/app/chats/ChatListPage.tsx`
- Modify: `apps/web/src/app/notes/NotesPage.tsx`

#### ChatListPage.tsx

- [ ] **Step 1: Read `apps/web/src/app/chats/ChatListPage.tsx`**

  Note all styled-components used. Identify layout wrappers, list items, text elements, action buttons.

- [ ] **Step 2: Rewrite ChatListPage.tsx**

  Remove `import styled from 'styled-components'`. Add `import { YStack, XStack, Text, styled } from 'tamagui'`.

  Replace each styled component:
  - Page/layout wrappers → `PageLayout`, `Container` from `@/shared/ui` where applicable, else `YStack`/`XStack`
  - Chat list items → `YStack` with `pressStyle` for hover effect
  - Avatar → `Avatar` from `@arcadeum/ui`
  - Text elements → `Text`
  - Empty state → `EmptyState` from `@arcadeum/ui`
  - Loading state → `LoadingState` from `@arcadeum/ui`

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/src/app/chats/ChatListPage.tsx
  git commit -m "refactor(chats): replace ChatListPage styled-components with Tamagui"
  ```

#### NotesPage.tsx

- [ ] **Step 4: Read `apps/web/src/app/notes/NotesPage.tsx`**

  Note: `NoteCard` has `::before` pseudo-element (accent stripe at top). `SkeletonCard` has `::after` with shimmer animation. Both need inline `<style>`. Other elements are layout wrappers and text.

- [ ] **Step 5: Rewrite NotesPage.tsx**

  Export a CSS styles string:
  ```tsx
  const noteStyles = `
    @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    .note-card { position: relative; }
    .note-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #7ad7ff, #57c3ff); border-radius: 3px 3px 0 0; }
    .skeleton-card { position: relative; overflow: hidden; }
    .skeleton-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%); animation: shimmer 1.5s infinite; }
  `;
  ```

  Inject `<style>{noteStyles}</style>` in render. Add `className="note-card"` and `className="skeleton-card"` on respective `YStack`/`Card` elements.

  Replace all other styled components with `YStack`/`XStack`/`Text`/`Card`.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/app/notes/NotesPage.tsx
  git commit -m "refactor(notes): replace NotesPage styled-components with Tamagui"
  ```

---

### Task 5: Migrate `misc-pages` area

**Files:**
- Modify: `apps/web/src/app/settings/styles.tsx`
- Modify: `apps/web/src/app/support/styles.ts`
- Modify: `apps/web/src/app/error.tsx`
- Modify: `apps/web/src/app/offline/page.tsx`
- Modify: `apps/web/src/app/payment/cancel/page.tsx`

#### settings/styles.tsx

- [ ] **Step 1: Read `apps/web/src/app/settings/styles.tsx`**

  Note: `ToggleInput = styled.input.attrs({ type: 'checkbox' })` with `::after` and `:checked::after` → native `<input>` + CSS class. Other components: `Container`, `OptionList`, `OptionLabel`, `OptionDescription`, `PillGroup`, `DownloadGrid`, `DownloadLink`. Do NOT touch `UnblockButton` (already Tamagui).

- [ ] **Step 2: Rewrite settings/styles.tsx**

  ```tsx
  import { styled, YStack, XStack, Text } from 'tamagui';
  import { Button, ButtonProps } from '@arcadeum/ui';

  export const toggleStyles = `
    .toggle-input { width: 44px; height: 24px; appearance: none; -webkit-appearance: none; border-radius: 12px; background: #32353d; position: relative; cursor: pointer; transition: background 0.2s; }
    .toggle-input:checked { background: #57c3ff; }
    .toggle-input::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: white; transition: transform 0.2s; }
    .toggle-input:checked::after { transform: translateX(20px); }
  `;

  export const Container = styled(YStack, { maxWidth: 900, alignSelf: 'center', gap: '$8' });

  export const OptionList = styled(YStack, {
    // CSS grid: use inline style display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.25rem'
  });

  export const OptionLabel = styled(Text, { fontSize: '$4', fontWeight: '600', color: '$color' });
  export const OptionDescription = styled(Text, { fontSize: '$3', color: 'rgba(236,239,238,0.7)' });
  export const PillGroup = styled(XStack, { flexWrap: 'wrap', gap: '$4' });

  export const DownloadGrid = styled(YStack, {
    // CSS grid: use inline style display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1.25rem'
  });

  // DownloadLink: use plain <a> with className in consuming component
  export const DOWNLOAD_LINK_CLASS = 'settings-download-link';
  export const downloadLinkStyles = `
    .settings-download-link { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1.25rem 1.75rem; border-radius: 12px; border: 1px solid #32353d; background: #151718; color: #ecefee; text-decoration: none; transition: all 0.2s; }
    .settings-download-link:hover { border-color: #7ad7ff; color: #7ad7ff; }
  `;

  // UnblockButton stays as-is (already Tamagui)
  export { UnblockButton } from './styles'; // re-export the existing Tamagui component — but since we're rewriting this file, just keep it inline
  ```

  Keep `UnblockButton` as it was. Find consuming components and add `<style>{toggleStyles}{downloadLinkStyles}</style>`, replace `<ToggleInput>` with `<input type="checkbox" className="toggle-input">`, replace `<DownloadLink>` with `<a className="settings-download-link">`.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/src/app/settings/
  git commit -m "refactor(settings): replace settings/styles.tsx styled-components with Tamagui"
  ```

#### support/styles.ts

- [ ] **Step 4: Read `apps/web/src/app/support/styles.ts`**

  Note: `css` helper, `keyframes`, `BackgroundBlob`, `ContentWrapper`, shared `ctaStyles`, `CtaLink`/`ExternalCta`/`LinkedInButton` (composed from `ctaStyles`), `CopyActionWrapper` (child selectors `& > button`, `& > span`), `@media (hover: hover)`, `@media (prefers-reduced-motion)`.

- [ ] **Step 5: Rewrite support/styles.ts**

  ```ts
  import { styled, YStack, XStack, Text } from 'tamagui';

  // CTA, hover capability, and reduced motion styles go in a CSS string
  export const supportStyles = `
    @keyframes supportFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .support-fade-in { animation: supportFadeIn 0.5s ease-out; }
    .cta-link { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; font-size: 0.95rem; transition: all 0.2s; text-decoration: none; border: 1px solid #32353d; color: #ecefee; }
    .cta-link.primary { background: linear-gradient(135deg, #7ad7ff, #57c3ff); color: #050316; border-color: transparent; }
    .cta-link:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(87,195,255,0.25); }
    @media (hover: hover) and (pointer: fine) { .cta-link:hover { opacity: 0.9; } }
    @media (prefers-reduced-motion: reduce) { .cta-link { transition: none; } }
    .copy-action-wrapper > button { background: none; border: none; cursor: pointer; padding: 0; }
    .copy-action-wrapper > button:hover { opacity: 0.8; }
    .linkedin-button { background: linear-gradient(135deg, #0a66c2, #0077b5); }
  `;

  export const BackgroundBlob = styled(YStack, {
    name: 'BackgroundBlob',
    position: 'absolute', top: '-10%', left: '50%',
    width: '140vw', height: 800,
    backgroundColor: '$backgroundRadialStart',
    opacity: 0.6, zIndex: 0, pointerEvents: 'none',
    style: { transform: 'translateX(-50%)', filter: 'blur(60px)' },
  } as any);

  export const ContentWrapper = styled(YStack, { name: 'ContentWrapper', zIndex: 1 });

  // CTA components: replace with plain <a className="cta-link"> in consuming components
  // CopyActionWrapper: replace with <div className="copy-action-wrapper">
  ```

  Find `apps/web/src/app/support/` consuming components. Inject `<style>{supportStyles}</style>`. Replace `<BackgroundBlob>` with the Tamagui styled version. Replace `<CtaLink>` with `<a className="cta-link">`, `<ExternalCta>` with `<a className="cta-link" target="_blank">`, `<LinkedInButton>` with `<a className="cta-link linkedin-button" target="_blank">`, `<CopyActionWrapper>` with `<div className="copy-action-wrapper">`.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/app/support/
  git commit -m "refactor(support): replace support/styles.ts styled-components with Tamagui"
  ```

#### error.tsx, offline/page.tsx, payment/cancel/page.tsx

- [ ] **Step 7: Rewrite `apps/web/src/app/error.tsx`**

  Remove `import styled from 'styled-components'`. Replace:
  ```tsx
  // Before: const Container = styled.div`padding: 4rem 2rem; display: flex; justify-content: center; align-items: center; min-height: 50vh;`
  // After: wrap ErrorState in:
  import { XStack } from 'tamagui';
  // <XStack padding="$10" justifyContent="center" alignItems="center" minHeight="50vh">
  ```

- [ ] **Step 8: Rewrite `apps/web/src/app/offline/page.tsx`**

  Remove `import styled from 'styled-components'`. Note: `Container`, `Icon`, `Title`, `Subtitle`, `Description`. Replace:
  ```tsx
  import { YStack, Text } from 'tamagui';
  // Container: <YStack alignItems="center" justifyContent="center" minHeight="100vh" padding="$6" textAlign="center" backgroundColor="$background">
  // Icon: <Text fontSize={80} marginBottom="$5" opacity={0.8}>
  // Title: <Text tag="h1" fontSize="$8" fontWeight="700" color="$color" margin={0} marginBottom="$4">
  // Subtitle: <Text fontSize="$4" color="rgba(236,239,238,0.7)" ...>
  ```

- [ ] **Step 9: Rewrite `apps/web/src/app/payment/cancel/page.tsx`**

  Remove `import styled from 'styled-components'`. Replace styled components with `YStack`/`XStack`/`Text` from tamagui. Use `Card` from `@arcadeum/ui` for any card-shaped containers.

- [ ] **Step 10: Commit**

  ```bash
  git add apps/web/src/app/error.tsx apps/web/src/app/offline/page.tsx apps/web/src/app/payment/cancel/
  git commit -m "refactor(misc): replace error, offline, payment/cancel styled-components with Tamagui"
  ```

---

### Task 6: Migrate `shared-features` area

**Files:**
- Modify: `apps/web/src/shared/lib/styles.ts`
- Modify: `apps/web/src/features/referrals/ui/styles.ts`
- Modify: `apps/web/src/features/pwa/InstallPWAModalContent.tsx`

#### shared/lib/styles.ts

- [ ] **Step 1: Rewrite `apps/web/src/shared/lib/styles.ts`**

  Replace the styled-components `css` export with a plain string:
  ```ts
  // Before: import { css } from 'styled-components'; export const scrollbarStyles = css`...`
  // After:
  export const scrollbarStyles = `
    &::-webkit-scrollbar { width: 6px; height: 6px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(236, 239, 238, 0.45); border-radius: 10px; transition: background 0.2s ease; }
    &::-webkit-scrollbar-thumb:hover { background: rgba(236, 239, 238, 0.7); }
    scrollbar-width: thin;
    scrollbar-color: rgba(236, 239, 238, 0.45) transparent;
  `;
  ```

  Confirm zero consumers: `grep -r "scrollbarStyles" apps/web/src --include="*.tsx" --include="*.ts" -l`
  Expected: only `shared/lib/styles.ts` itself.

- [ ] **Step 2: Commit**

  ```bash
  git add apps/web/src/shared/lib/styles.ts
  git commit -m "refactor(shared): convert scrollbarStyles from styled-components css to plain string"
  ```

#### features/referrals/ui/styles.ts

- [ ] **Step 3: Read `apps/web/src/features/referrals/ui/styles.ts`**

  Note all styled components. Look for `theme.copyNotice` (→ `$accent`), `theme.buttons.primary.text` (→ `'#050316'`), any media queries.

- [ ] **Step 4: Rewrite referrals/ui/styles.ts**

  Remove `import styled, { keyframes } from 'styled-components'`. Add `import { styled, YStack, XStack, Text } from 'tamagui'`.

  Replace each styled component:
  - Layout containers → `YStack`/`XStack`
  - Heading text → `Text` with appropriate size/weight
  - `DashboardTitle` → `Text` with `fontSize: '$7'`, `fontWeight: '700'`, `color: '$color'`
  - `DashboardSubtitle` → `Text` with muted color
  - `CardTitle` → `Text` with `tag: 'h2'`
  - Any `keyframes` animations → export CSS string + inject `<style>` in consuming component
  - `theme.copyNotice` usages → `color: '$accent'`
  - `theme.buttons.primary.text` → `color: '#050316'`

- [ ] **Step 5: Find and update consuming components**

  Run: `grep -r "from.*referrals.*styles" apps/web/src --include="*.tsx" -l`
  Open each and inject `<style>` if needed.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/features/referrals/
  git commit -m "refactor(referrals): replace referrals/ui/styles.ts styled-components with Tamagui"
  ```

#### features/pwa/InstallPWAModalContent.tsx

- [ ] **Step 7: Rewrite `apps/web/src/features/pwa/InstallPWAModalContent.tsx`**

  Remove `import styled from 'styled-components'`. Add `import { YStack, XStack, Text } from 'tamagui'`.

  Replace 4 styled components:
  ```tsx
  // AppIconWrapper: <XStack justifyContent="center" marginBottom="$5">
  // Description: <Text textAlign="center" color="rgba(236,239,238,0.7)" fontSize="$3" lineHeight={1.6} margin={0}>
  // FeatureList: <YStack tag="ul" listStyleType="none" padding={0} margin={0} marginTop="$5" gap="$3">
  // FeatureItem: <XStack tag="li" alignItems="center" gap="$3">
  ```

  Replace `<AppIconWrapper>` etc. inline in JSX with the Tamagui equivalents above.

- [ ] **Step 8: Commit**

  ```bash
  git add apps/web/src/features/pwa/InstallPWAModalContent.tsx
  git commit -m "refactor(pwa): replace InstallPWAModalContent styled-components with Tamagui"
  ```

---

## Task 7: Infrastructure Cleanup (main session — AFTER tasks 1–6 are all complete)

**GATE:** Before starting this task, run:
```bash
grep -r "\${({ theme })" apps/web/src
```
Expected: **zero results**. If any results appear, do NOT proceed — find which agent task missed a file and fix it first.

**Files:**
- Modify: `apps/web/src/app/StyledComponentsRegistry.tsx`
- Modify: `apps/web/src/app/theme/ThemeContext.tsx`
- Delete: `apps/web/src/styled.d.ts`
- Modify: `package.json` (root or apps/web)

- [ ] **Step 1: Convert StyledComponentsRegistry to passthrough**

  Open `apps/web/src/app/StyledComponentsRegistry.tsx`. Replace its entire body with:
  ```tsx
  'use client';
  import type { ReactNode } from 'react';
  export default function StyledComponentsRegistry({ children }: { children: ReactNode }) {
    return <>{children}</>;
  }
  ```
  Do NOT delete the file — it is imported in `layout.tsx` and `global-error.tsx`.

- [ ] **Step 2: Remove StyledThemeProvider from ThemeContext.tsx**

  Open `apps/web/src/app/theme/ThemeContext.tsx`. Remove:
  - `import { ThemeProvider as StyledThemeProvider } from 'styled-components';` line
  - The `<StyledThemeProvider theme={themeTokens[resolvedTheme]}>` wrapper and its closing tag

  Keep `TamaguiProvider` and everything else unchanged.

- [ ] **Step 3: Delete styled.d.ts**

  ```bash
  git rm apps/web/src/styled.d.ts
  ```

- [ ] **Step 4: Verify zero styled-components imports**

  ```bash
  grep -r "from 'styled-components'" apps/web/src
  ```
  Expected: **zero results**. If any appear, fix them before continuing.

- [ ] **Step 5: Run TypeScript check**

  ```bash
  cd apps/web && npx tsc --noEmit
  ```
  Expected: no errors. If errors appear, fix them (common: missing imports, type mismatches from removed `DefaultTheme` augmentation).

- [ ] **Step 6: Remove styled-components from package.json**

  In `apps/web/package.json` (or root `package.json`), remove `"styled-components"` from dependencies. Also remove `"@types/styled-components"` if present.

  ```bash
  # Check which package.json has it
  grep -r "styled-components" apps/web/package.json package.json
  ```

  Remove the entries manually with the Edit tool.

- [ ] **Step 7: Verify build still resolves**

  ```bash
  cd apps/web && npx next build --no-lint 2>&1 | tail -20
  ```
  Expected: build completes without styled-components import errors.

- [ ] **Step 8: Commit**

  ```bash
  git add apps/web/src/app/StyledComponentsRegistry.tsx
  git add apps/web/src/app/theme/ThemeContext.tsx
  git add apps/web/package.json  # or root package.json
  git commit -m "refactor: remove styled-components infrastructure — migration complete"
  ```

---

## Final Verification

- [ ] `grep -r "from 'styled-components'" apps/web/src` → zero results
- [ ] `grep -r "import styled from" apps/web/src` → zero results
- [ ] `cd apps/web && npx tsc --noEmit` → passes
- [ ] All pages load correctly in browser (visual check): home, games list, games room, stats, chats, notes, settings, support, error, offline pages
