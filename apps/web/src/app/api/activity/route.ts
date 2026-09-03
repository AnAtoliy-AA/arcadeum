import { NextResponse } from 'next/server';

/**
 * Activity stats endpoint (roadmap 7D). Returns counts of active games
 * and online players. Client polls this every 30s for the ActivityBanner.
 *
 * In production this should read from Redis or the game rooms service.
 * For now we use a lightweight approximation: count rooms with active
 * sessions via the backend API.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

interface ActivityStats {
  activeGames: number;
  onlinePlayers: number;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/games/rooms?limit=1`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { activeGames: 0, onlinePlayers: 0 },
        { status: 200 },
      );
    }

    const data = await res.json();
    const totalRooms = data.total ?? 0;

    // Approximate: each room has 1-6 players, average 2
    const stats: ActivityStats = {
      activeGames: totalRooms,
      onlinePlayers: totalRooms * 2,
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch {
    return NextResponse.json(
      { activeGames: 0, onlinePlayers: 0 },
      { status: 200 },
    );
  }
}
