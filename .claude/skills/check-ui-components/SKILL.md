---
name: check-ui-components
description: Check existing @arcadeum/ui components before implementing any new UI. Use before writing any component — reuse what exists, add to packages/ui if missing.
---

Before writing any UI component, you MUST audit the shared library. Never implement custom UI that duplicates an existing shared component.

## Step 1 — Read the current component catalog

Read `packages/ui/src/index.ts` to get the full list of exported components. Then read the `.tsx` file of any component that might match the need to check its props and variants.

**Current components in `@arcadeum/ui`:**

| Component | Key props / variants | Use for |
|---|---|---|
| `Button` | `size`, `variant`, `loading`, `disabled`, `gameVariant`, `showShimmer` | All buttons and CTAs |
| `LinkButton` | Same as Button + `href` | Navigation buttons |
| `SpecializedButtons` | `BackButton`, `CloseButton`, `HomeButton` | Icon-only nav buttons |
| `Card` | `variant` (default/elevated/outlined/glass/error), `padding` (none/sm/md/lg) | Content containers |
| `GlassCard` | `padding`, `bordered` | Frosted-glass content containers |
| `Avatar` | `size`, `src`, `fallback` | User/player avatars |
| `Badge` | `variant`, `size` | Status/count labels |
| `CosmeticBadge` | `type`, `rarity` | Game cosmetic labels |
| `RoleBadge` | `role` | User role labels |
| `IdleBadge` | — | Idle/away indicator |
| `Input` | `label`, `error`, `disabled`, `leftIcon`, `rightIcon` | Text inputs |
| `TextArea` | `label`, `error`, `rows` | Multi-line text inputs |
| `Select` | `label`, `error`, `options`, `value`, `onChange` | Dropdowns |
| `FormGroup` | `label`, `error`, `required`, `hint` | Form field wrapper |
| `Modal` | `open`, `onClose`, `title`, `size` | Dialog/overlay |
| `Spinner` | `size`, `color` | Loading spinner |
| `LoadingState` | `message` | Full loading placeholder |
| `PageLoading` | — | Full-page loading screen |
| `Skeleton` | `width`, `height`, `borderRadius`, `variant` | Content skeleton placeholders |
| `Progress` | `value`, `max`, `variant`, `showLabel` | Progress bars |
| `EmptyState` | `title`, `description`, `icon`, `action` | Empty list/data state |
| `ErrorState` | `title`, `description`, `onRetry` | Error with retry |
| `Section` | `title`, `description`, `actions` | Page section with heading |
| `PageLayout` | `header`, `footer`, `sidebar` | Top-level page shell |
| `PageTitle` | `title`, `subtitle`, `breadcrumbs` | Page heading block |
| `Container` | `size` (sm/md/lg/xl/full), `centered` | Max-width content wrapper |
| `Divider` | `orientation`, `color` | Horizontal/vertical separator |
| `CollapsibleSection` | `title`, `defaultOpen` | Expandable section |
| `ConnectionOverlay` | `status` | Network connection status |
| `ServerLoadingNotice` | — | Server warmup notice |
| `Typography` | `variant`, `color`, `weight` | Text with design-token styles |
| `Icons` | (many named icons) | SVG icon set |
| `ChatHeader` | `title`, `subtitle`, `actions` | Chat window header |
| `ChatMessage` | `message`, `isOwn`, `timestamp` | Chat bubble |
| `ChatInput` | `onSend`, `placeholder`, `disabled` | Chat text input with send |
| `GameContainer` | `header`, `footer` | Game widget shell |
| `GameLayout` | `board`, `sidebar` | Game board + sidebar split |
| `TurnIndicator` | `currentPlayer`, `players` | Whose-turn indicator |
| `Footer` | `links`, `socials` | App footer |
| `MobileLoginIndicator` | — | Mobile auth status |
| `DownloadButtons` | `platform` | App store download CTAs |
| `XStack`, `YStack`, `ZStack`, `ScrollView`, `ThemeableStack` | (Tamagui layout) | Layout primitives |

## Step 2 — Decide: reuse or create

**If an existing component covers the need** (even partially with props/variants):
- Use it from `@arcadeum/ui`. Do NOT create a local wrapper unless it adds real domain logic.
- Show the import: `import { ComponentName } from '@arcadeum/ui'`
- If the existing component needs a new variant/prop to fit the need, extend it in `packages/ui` rather than wrapping it locally.

**If no existing component fits** (genuinely new pattern):
- The component MUST be created in `packages/ui`, not inline in the app.
- Follow the `/new-ui-component` skill to add it:
  1. `packages/ui/src/components/<Name>/<Name>.tsx` — Tamagui-based implementation
  2. `packages/ui/src/components/<Name>/index.ts` — re-export
  3. `packages/ui/src/components/<Name>/<Name>.stories.tsx` — Storybook story (required)
  4. Register in `packages/ui/src/index.ts`
  5. Then import `{ Name } from '@arcadeum/ui'` in the app

## Step 3 — Extending an existing component

If the existing component almost fits but needs a new variant or prop:
1. Read the component's `.tsx` and its `types.ts`/`StyledComponent` to understand its variant system
2. Add the new variant/prop to `packages/ui/src/components/<Name>/<Name>.tsx`
3. Export the updated type from `index.ts`
4. Add a Storybook story for the new variant in `<Name>.stories.tsx`
5. Do NOT duplicate the component — extend it in place

## Rules

- Never create a component file in `apps/web`, `apps/mobile`, or `apps/be` if it belongs in the shared library
- One-off app-specific compositions (combining 2–3 shared components for a specific screen) are fine as local view files — but the individual building blocks must come from `@arcadeum/ui`
- Check `packages/ui/src/tamagui.config.ts` for design tokens before hardcoding colors/spacing
- All new components must be platform-agnostic (web + React Native), so avoid `react-native` imports; use Tamagui primitives
