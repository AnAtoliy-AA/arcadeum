import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routes } from '@/shared/config/routes';

export function proxy(request: NextRequest) {
  // Skip proxy for internal Next.js requests and static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.') // naive check for files (images, css, etc)
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Target protected application routes that benefit from bfcache
  const bfcacheRoutes = [
    routes.games,
    routes.chats,
    routes.history,
    routes.stats,
    routes.settings,
  ];

  if (bfcacheRoutes.some((path) => request.nextUrl.pathname.startsWith(path))) {
    // Switch from 'no-store' to 'no-cache, private'
    // This allows bfcache to work while still requiring revalidation for normal reloads
    response.headers.set('Cache-Control', 'private, no-cache, no-transform');
  }

  return response;
}
