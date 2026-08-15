---
name: new-mobile-screen
description: Add a new screen to the mobile app (apps/mobile). Use when creating a new route/screen in the Expo Router app.
---

The mobile app uses Expo Router (file-based routing) with React Native primitives, `StyleSheet` + `useThemedStyles` for styling, and a custom `useTranslation` hook for i18n.

## Routing structure

```
apps/mobile/app/
  (tabs)/          ← tab navigator screens
  (tv)/            ← TV-specific screens
  <screen>.tsx     ← top-level screen
  <domain>/
    [id].tsx       ← dynamic route
    _layout.tsx    ← nested layout
```

## Steps

1. **Create the screen file** at the appropriate path under `apps/mobile/app/`:
   - Use `export default function <Name>Screen()` (Expo Router requires default export)
   - For tab screens, place under `(tabs)/`

2. **Use i18n** with the `useTranslation` hook:
   ```ts
   import { useTranslation } from '@/lib/i18n';
   const { t } = useTranslation();
   // t('some.key')
   ```

3. **Style with React Native primitives + StyleSheet** (no Tamagui, no `@arcadeum/ui` in mobile):
   ```tsx
   import { StyleSheet, View, Text } from 'react-native';
   import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

   const createStyles = (palette: Palette) =>
     StyleSheet.create({
       container: { padding: 16, gap: 16 },
       title: { fontSize: 20, fontWeight: 'bold', color: palette.text },
     });

   // in component:
   const styles = useThemedStyles(createStyles);
   ```

4. **Navigation** — use `expo-router` hooks:
   ```ts
   import { useRouter, useLocalSearchParams } from 'expo-router';
   ```

5. **Add translations** to `apps/mobile/lib/i18n/messages/` for all locales.

6. **Register in tab bar** (if adding a tab): update `apps/mobile/app/(tabs)/_layout.tsx`

## Key patterns

- Wrap screens with `<SafeAreaView>` or the project's screen wrapper
- Auth-protected screens should check `useSessionTokens()` store and redirect to `auth` if unauthenticated
- Use `useColorScheme()` from `@/hooks/useColorScheme` for theme-aware styling
