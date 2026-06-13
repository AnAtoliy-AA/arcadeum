---
name: new-ui-component
description: Add a new shared UI component to the @arcadeum/ui package (packages/ui). Use when creating reusable components shared across web and mobile.
---

The shared UI library (`packages/ui`) uses Tamagui as the component foundation and is consumed by both `apps/web` and `apps/mobile` via `@arcadeum/ui`.

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
   - Use Tamagui primitives (`YStack`, `XStack`, `Text`, `Stack`, etc.)
   - Export named: `export const <Name> = ...`
   - Accept typed props extending Tamagui's component props where appropriate

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

5. **Tamagui primitives reference**:
   ```ts
   import { YStack, XStack, Text, Stack, View, styled } from 'tamagui';
   // Use styled() for variant-driven components
   const MyComponent = styled(Stack, {
     variants: {
       size: { sm: { padding: '$2' }, md: { padding: '$4' } }
     }
   });
   ```

## Notes

- Keep components platform-agnostic — they run on both web and React Native
- Avoid importing from `react-native` directly; use Tamagui equivalents
- Check `packages/ui/src/tamagui.config.ts` for design tokens (`$colors`, `$space`, `$size`)
- Run `pnpm storybook` from `apps/web` to verify stories render correctly
