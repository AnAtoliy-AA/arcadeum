import { GlimwormService } from './glimworm.service';
import { GlimwormStateStore } from './glimworm.state';
import type { GamesRealtimeService } from '../games.realtime.service';
import type { Worm } from './glimworm.types';

export interface RealtimeMock {
  emitToRoom: jest.Mock;
  emitToClientInRoom: jest.Mock;
}

export const buildMockRealtime = (): RealtimeMock => ({
  emitToRoom: jest.fn(),
  emitToClientInRoom: jest.fn().mockResolvedValue(true),
});

export interface MakeServiceResult {
  service: GlimwormService;
  store: GlimwormStateStore;
  realtime: RealtimeMock;
}

export const makeService = (
  random: () => number = () => 0.5,
): MakeServiceResult => {
  const store = new GlimwormStateStore();
  const realtime = buildMockRealtime();
  const service = new GlimwormService(
    store,
    realtime as unknown as GamesRealtimeService,
    random,
  );
  return { service, store, realtime };
};

/**
 * Seed a worm so its head sits at (x,y) and segments trail behind opposite to
 * `heading`. Spreading segments avoids spurious self-collision on the next
 * advance step — each tick advances by 10u, while head+segment radii sum 14u,
 * so stacked segments would always intersect the new head AABB.
 */
export const placeWormAt = (
  worm: Worm,
  x: number,
  y: number,
  count = 4,
  heading = 0,
): void => {
  worm.heading = heading;
  worm.segments = [];
  const step = 12;
  for (let i = 0; i < count; i++) {
    worm.segments.push({
      x: x - Math.cos(heading) * step * i,
      y: y - Math.sin(heading) * step * i,
    });
  }
};
