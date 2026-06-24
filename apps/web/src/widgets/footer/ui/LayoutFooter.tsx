'use client';
import { usePathname } from 'next/navigation';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import AppFooter from './AppFooter';

// Routes that drive their own infinite scroll / load-more pagination.
// The footer is hidden on these so the loader can keep firing as the user
// scrolls. Nested routes (e.g. /games/[id]) are not affected.
const PAGINATED_ROUTES = new Set<string>([
  '/games',
  '/history',
  '/notes',
  '/leaderboards',
  '/stats',
]);

// Game room routes where the footer should be hidden — players don't need
// navigation links while actively playing.
const GAME_ROOM_PATTERN = /\/rooms\//;

export default function LayoutFooter() {
  const pathname = usePathname();
  const mounted = useIsMounted();

  // Defer to client-only render. The Tamagui-styled @arcadeum/ui Footer
  // emits a different style payload during SSR than after hydration when
  // it's mounted at the root layout, which trips React's hydration-mismatch
  // error. We previously did this via `dynamic({ ssr: false })`, but that
  // races with Turbopack's chunk regeneration in dev mode and surfaces as
  // ChunkLoadError on navigation. Static import + mount gate avoids both.
  if (!mounted) return null;
  if (pathname && PAGINATED_ROUTES.has(pathname)) return null;
  if (pathname && GAME_ROOM_PATTERN.test(pathname)) return null;
  return <AppFooter />;
}
