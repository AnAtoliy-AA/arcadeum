'use client';

// This is a client-side entry point to isolate the page from SSR.
// This prevents "module factory is not available" errors in Turbopack
// caused by client-only dependencies (like sockets) leaking into unrelated SSR bundles.
import dynamic from 'next/dynamic';

const GameRoomPage = dynamic(() => import('./components/GameRoomPage'), {
  ssr: false,
  loading: () => null,
});

export default function GameRoomRoute() {
  return <GameRoomPage />;
}
