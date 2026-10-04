import type { Socket } from 'socket.io';
import type { GamesRealtimeService } from './games.realtime.service';

const PRESENCE_REFRESH_MS = 20_000;

export function registerPresenceRefresh(
  client: Socket,
  realtime: GamesRealtimeService,
): void {
  const refresh = (): void => {
    const data = client.data as Record<string, unknown>;
    const now = Date.now();
    const last = typeof data.presenceAt === 'number' ? data.presenceAt : 0;
    if (now - last < PRESENCE_REFRESH_MS) return;
    data.presenceAt = now;
    void realtime.refreshSocket(
      client.id,
      (data.userId as string | undefined) ||
        (data.anonId as string | undefined) ||
        `guest_${client.id}`,
    );
  };
  client.conn.on('heartbeat', refresh);
}
