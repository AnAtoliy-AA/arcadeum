---
name: new-ui-component
description: Add a new shared UI component to the @arcadeum/ui package (packages/ui). Use when creating reusable components shared across web and mobile.
---

> **Related skill**: `ui-ux-design` — comprehensive UI/UX guide with priority-based rules for design decisions, interaction patterns, and visual quality.

The shared UI library (`packages/ui`) is a plain React + Tailwind component library, consumed by `apps/web` via `@arcadeum/ui`. `apps/mobile` does NOT consume `@arcadeum/ui` — mobile uses React Native primitives.

## Structure

```
packages/ui/src/components/
  <ComponentName>/
    index.ts                     ← re-export
    <ComponentName>.tsx
    <ComponentName>.stories.tsx  ← Storybook story (required)
```

## Steps

1. **Create component** in `packages/ui/src/components/<Name>/<Name>.tsx`:
   - Build with plain React elements + Tailwind classes (see `/tailwind-pro` for the token → class map; tokens are CSS vars from `packages/ui/src/themeDefinitions.ts`)
   - Export named: `export const <Name> = ...`
   - Accept and merge a `className` prop via `cx` from `@arcadeum/ui/utils/cx`

2. **Create `index.ts`** re-export:
   ```ts
   export { <Name> } from './<Name>';
   export type { <Name>Props } from './<Name>';
   ```

3. **Register in barrel export** `packages/ui/src/index.ts`:
   ```ts
   export * from './components/<Name>';
   ```

4. **Create `<Name>.stories.tsx`** (required for every component):
   ```tsx
   import type { Meta, StoryObj } from '@storybook/nextjs-vite';
   import { <Name> } from './<Name>';

   const meta: Meta<typeof <Name>> = {
     title: 'Shared/<Name>',
     component: <Name>,
     tags: ['autodocs'],
     argTypes: {
       // declare each prop with control type and description
       variant: { control: 'select', options: [...], description: '...' },
     },
   };

   export default meta;
   type Story = StoryObj<typeof <Name>>;

   export const Default: Story = { args: { /* minimal props */ } };

   // Add a story per meaningful variant/state, e.g.:
   // export const Disabled: Story = { args: { disabled: true } };
   // export const AllVariants: Story = { render: () => <...> };
   ```
   - `title` follows `'Shared/<Name>'` convention
   - Always include `tags: ['autodocs']`
   - Cover: default state, each variant, disabled/error/loading states where applicable
   - Add an `AllVariants` render story when there are multiple visual variants

5. **Tailwind class-map reference**:
   ```ts
   import { cx } from '../../utils/cx';
   const SIZE_CLASS = {
     sm: 'p-2',
     md: 'p-4',
   } as const;
   // Variant-driven components merge class maps with cx()
   export const MyComponent = ({ size = 'md', className, ...props }) => (
     <div className={cx('box-border flex flex-col', SIZE_CLASS[size], className)} {...props} />
   );
   ```

## Notes

- Keep components platform-agnostic — web uses them directly; mobile does not consume `@arcadeum/ui`
- Style with Tailwind classes only; theme tokens via `var(--x)` (see `/tailwind-pro`)
- Check `packages/ui/src/themeDefinitions.ts` for theme tokens before hardcoding colors/spacing
- Run `pnpm storybook` from `apps/web` to verify stories render correctly
