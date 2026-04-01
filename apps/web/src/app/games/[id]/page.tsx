'use client';

// This is a client-side entry point to isolate the page from SSR.
// This prevents "module factory is not available" errors in Turbopack
// caused by client-only dependencies (like sockets) leaking into unrelated SSR bundles.
import dynamic from 'next/dynamic';

const GameDetailPage = dynamic(
  () => import('./GameDetailPage').then((mod) => mod.GameDetailPage),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function GameDetailRoute() {
  return <GameDetailPage />;
}
