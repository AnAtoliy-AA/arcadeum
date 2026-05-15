'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Render the footer only on the client. The shared @arcadeum/ui Footer is
// Tamagui-styled and emits a different style payload during SSR than during
// hydration when mounted from the root layout, which trips React's
// hydration-mismatch error. The footer is below the fold and not critical
// for SEO/LCP, so a client-only render is the right tradeoff.
const AppFooter = dynamic(() => import('./AppFooter'), { ssr: false });

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
