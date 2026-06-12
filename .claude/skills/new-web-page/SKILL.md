---
name: new-web-page
description: Add a new page to the Next.js web app (apps/web). Use when creating a new route/page in the web app.
---

The web app uses Next.js App Router with a three-file pattern per page and server-side i18n.

## Pattern

```
apps/web/src/app/<route>/
  page.tsx          ← Server Component: fetches translations, exports metadata
  <Name>Client.tsx  ← 'use client': dynamic import wrapper with loading skeleton
  <Name>View.tsx    ← actual UI (lazy-loaded via dynamic import in Client file)
```

## Steps

1. **Create `page.tsx`** (Server Component):
   - Import `getTranslations` from `@/shared/i18n/server`
   - Export `metadata` with `title: \`Page Title - \${appConfig.appName}\``
   - Fetch translations with `const messages = await getTranslations()`
   - Pass only the relevant translation slice as `t` prop to the Client component

2. **Create `<Name>Client.tsx`** (`'use client'`):
   - Use `dynamic(() => import('./<Name>View').then(mod => mod.<Name>View), { ssr: false, loading: LoadingSkeleton })`
   - Define `LoadingSkeleton` using `PageLayout`, `Container`, `GlassCard`, `Skeleton`, `YStack` from `@/shared/ui`

3. **Create `<Name>View.tsx`**:
   - Build the actual page UI using components from `@arcadeum/ui` and `@/shared/ui`
   - Accept `t` prop for translations

4. **Add translations** to all locale files:
   - `apps/web/src/shared/i18n/messages/pages/en.ts` (and `by.ts`, `es.ts`, `fr.ts`, `ru.ts`)
   - Export the translation key from `apps/web/src/shared/i18n/messages/pages.ts`

## Key imports

```ts
import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { PageLayout, Container, GlassCard, Skeleton, YStack } from '@/shared/ui';
```
