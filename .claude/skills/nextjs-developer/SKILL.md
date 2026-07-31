---
name: nextjs-developer
description: Build modern web applications with Next.js App Router, Server Components, and Server Actions. Use when creating pages, implementing data fetching, or optimizing Next.js performance. Trigger on keywords like Next.js, App Router, Server Components, Server Actions, RSC, Turbopack.
---

# Next.js Developer

## When to Use

- Creating new pages with App Router
- Implementing Server Components
- Adding Server Actions
- Optimizing performance
- Implementing i18n

## Project Conventions

- Use App Router (not Pages Router)
- Prefer Server Components by default
- Use `'use client'` only when needed
- Use Zustand for client state
- Implement i18n with `next-intl`

## Code Examples

### Server Component (Default)

```tsx
// app/[locale]/games/page.tsx
import { getTranslations } from 'next-intl/server';
import { GamesList } from '@/features/games/ui/GamesList';

export default async function GamesPage() {
  const t = await getTranslations('games');
  const games = await fetchGames();

  return (
    <div>
      <h1>{t('title')}</h1>
      <GamesList games={games} />
    </div>
  );
}
```

### Client Component

```tsx
// app/[locale]/games/ui/GamesList.tsx
'use client';

import { useState } from 'react';
import { Card, Button } from '@arcadeum/ui';

export function GamesList({ games }: { games: Game[] }) {
  const [filter, setFilter] = useState<string>('all');

  return (
    <div>
      <Button onClick={() => setFilter('active')}>Active</Button>
      {games
        .filter(g => filter === 'all' || g.status === filter)
        .map(game => (
          <Card key={game.id}>{game.name}</Card>
        ))}
    </div>
  );
}
```

### Server Action

```tsx
// app/[locale]/games/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createGame(formData: FormData) {
  const name = formData.get('name') as string;

  await db.games.create({ data: { name } });

  revalidatePath('/games');
}
```

### Data Fetching

```tsx
// Server Component - fetch directly
async function GamePage({ params }: { params: { id: string } }) {
  const game = await fetch(`https://api.example.com/games/${params.id}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  }).then(r => r.json());

  return <Game game={game} />;
}
```

### API Route

```tsx
// app/api/games/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const games = await db.games.findMany();
  return NextResponse.json(games);
}

export async function POST(request: Request) {
  const body = await request.json();
  const game = await db.games.create({ data: body });
  return NextResponse.json(game, { status: 201 });
}
```

### i18n with next-intl

```tsx
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('welcome')}</h1>;
}

// Client Component
'use client';
import { useTranslation } from 'next-intl';

export function MyComponent() {
  const t = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

## Rendering Strategies

| Strategy | When | How |
|----------|------|-----|
| **Static (SSG)** | Content changes infrequently | Default in App Router |
| **ISR** | Content updates periodically | `revalidate: N` in fetch |
| **SSR** | User-specific content | `dynamic = 'force-dynamic'` |
| **Streaming** | Slow data + fast shell | `loading.tsx` + Suspense |

## Performance Tips

### DO
- Use Server Components by default
- Use `next/image` for images
- Use `next/font` for fonts
- Use dynamic imports for heavy components
- Use `loading.tsx` for streaming
- Use Suspense boundaries

### DON'T
- Use `'use client'` unnecessarily
- Fetch data in client components
- Use `useEffect` for data fetching
- Import heavy libraries at top level
- Use `window` in Server Components

## Image Optimization

```tsx
import Image from 'next/image';

// Always specify width/height
<Image
  src="/hero.webp"
  alt="Hero image"
  width={1200}
  height={630}
  priority  // for LCP images
/>

// Below the fold - lazy loaded
<Image
  src="/thumbnail.webp"
  alt="Thumbnail"
  width={400}
  height={300}
/>
```

## Font Optimization

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

// Use in layout
<html className={inter.className}>
```

## Constraints

### MUST DO
- Use Server Components by default
- Use `'use client'` only when needed
- Define types for all props
- Handle loading/error states
- Use `next/image` for images
- Use `next/font` for fonts

### MUST NOT DO
- Fetch data in client components
- Use `any` type
- Use `console.log` in production
- Hardcode API URLs
- Skip error boundaries
