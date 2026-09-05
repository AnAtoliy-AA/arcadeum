'use client';
import { usePathname } from 'next/navigation';
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

// Game play routes where the footer should be hidden — players don't need
// navigation links while actively playing.
const GAME_PLAY_PATTERN = /\/(rooms\/|games\/[^/]+\/play)/;

export default function LayoutFooter() {
  const pathname = usePathname();

  if (pathname && PAGINATED_ROUTES.has(pathname)) return null;
  if (pathname && GAME_PLAY_PATTERN.test(pathname)) return null;
  return <AppFooter />;
}
