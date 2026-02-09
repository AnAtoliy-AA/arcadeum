import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routes } from '@/shared/config/routes';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Target application routes that benefit from bfcache
  // We include the home page and major feature areas
  const bfcacheRoutes = [
    routes.home,
    routes.games,
    routes.chats,
    routes.history,
    routes.stats,
    routes.settings,
  ];

  const pathname = request.nextUrl.pathname;

  // Exact match for home or prefix match for other routes
  const isBfcacheRoute = bfcacheRoutes.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route as string);
  });

  if (isBfcacheRoute) {
    // Switch from 'no-store' to 'no-cache, private'
    // This allows bfcache to work while still requiring revalidation for normal reloads.
    // 'no-transform' prevents proxies from modifying the content.
    response.headers.set('Cache-Control', 'private, no-cache, no-transform');
  }

  return response;
}

// Ensure middleware runs for page transitions
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
