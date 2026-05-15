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

export default function LayoutFooter() {
  const pathname = usePathname();
  if (pathname && PAGINATED_ROUTES.has(pathname)) return null;
  return <AppFooter />;
}
