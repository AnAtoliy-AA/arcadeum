import {
  GLIMWORM_ARENA,
  GLIMWORM_BASE_SPEED,
  GLIMWORM_START_LENGTH,
} from './glimworm.constants';
import {
  makeService,
  placeWormAt,
  type MakeServiceResult,
} from './glimworm.service.test-helpers';
import type { GlimwormSession } from './glimworm.types';

describe('GlimwormService — tick mutation phases', () => {
  const startTwoWorms = (
    random: () => number = () => 0.5,
  ): MakeServiceResult & { session: GlimwormSession } => {
    const result = makeService(random);
    const { service, store } = result;
    service.joinRoom('r1', 'u1');
    service.joinRoom('r1', 'u2');
    service.markReady('r1', 'u1', true);
    service.markReady('r1', 'u2', true);
    service.start('r1', 'u1', {
      variant: 'battle_royale',
      powerupsEnabled: false,
    });
    const session = store.get('r1') as GlimwormSession;
    placeWormAt(session.worms['u1'], 500, 500, GLIMWORM_START_LENGTH, 0);
    placeWormAt(
      session.worms['u2'],
      1500,
      1500,
      GLIMWORM_START_LENGTH,
      Math.PI,
    );
    return { ...result, session };
  };

  beforeEach(() => {
    jest
      .spyOn(global, 'setInterval')
      .mockImplementation(() => 0 as unknown as ReturnType<typeof setInterval>);
    jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('advances head by speed*dt at heading direction', () => {
    const { service, session } = startTwoWorms();
    const before = { ...session.worms['u1'].segments[0] };
    service.tick('r1');
    const after = session.worms['u1'].segments[0];
    expect(after.x - before.x).toBeCloseTo(GLIMWORM_BASE_SPEED * 0.05, 4);
    expect(after.y).toBeCloseTo(before.y, 4);
  });

  it('eats food on overlap: score increments and food removed', () => {
    const { service, session } = startTwoWorms();
    const head = session.worms['u1'].segments[0];
    session.food = [{ id: 'f1', pos: { x: head.x + 5, y: head.y }, value: 1 }];
    const beforeLen = session.worms['u1'].segments.length;
    service.tick('r1');
    expect(session.food.find((f) => f.id === 'f1')).toBeUndefined();
    expect(session.worms['u1'].score).toBe(1);
    expect(session.worms['u1'].segments.length).toBeGreaterThanOrEqual(
      beforeLen,
    );
  });

  it('worm dies when head exits arena (wall)', () => {
    const { service, session } = startTwoWorms();
    placeWormAt(
      session.worms['u1'],
      GLIMWORM_ARENA.width - 1,
      500,
      GLIMWORM_START_LENGTH,
      0,
    );
    service.tick('r1');
    expect(session.worms['u1'].alive).toBe(false);
  });

  it('victim dies when head hits another worm’s segment, killer survives', () => {
    const { service, session } = startTwoWorms();
    session.worms['u2'].segments = [
      { x: 600, y: 500 },
      { x: 610, y: 500 },
      { x: 620, y: 500 },
    ];
    session.worms['u1'].segments = [{ x: 605, y: 500 }];
    session.worms['u1'].heading = 0;
    service.tick('r1');
    expect(session.worms['u1'].alive).toBe(false);
    expect(session.worms['u2'].alive).toBe(true);
  });

  it('head-vs-head simultaneous collision kills both', () => {
    const { service, session } = startTwoWorms();
    placeWormAt(session.worms['u1'], 1000, 1000, 4, 0);
    placeWormAt(session.worms['u2'], 1000, 1000, 4, 0);
    service.tick('r1');
    expect(session.worms['u1'].alive).toBe(false);
    expect(session.worms['u2'].alive).toBe(false);
  });

  it('shield absorbs a lethal hit (worm survives, shield consumed)', () => {
    const { service, session } = startTwoWorms();
    session.worms['u2'].segments = [
      { x: 600, y: 500 },
      { x: 610, y: 500 },
    ];
    session.worms['u1'].segments = [{ x: 605, y: 500 }];
    session.worms['u1'].heading = 0;
    session.worms['u1'].activePowerup = {
      kind: 'shield',
      expiresAt: Date.now() + 10_000,
    };
    service.tick('r1');
    expect(session.worms['u1'].alive).toBe(true);
    expect(session.worms['u1'].activePowerup).toBeNull();
  });

  it('ghost skips trail collision but still dies to wall', () => {
    const { service, session } = startTwoWorms();
    session.worms['u2'].segments = [
      { x: 600, y: 500 },
      { x: 610, y: 500 },
    ];
    session.worms['u1'].segments = [{ x: 605, y: 500 }];
    session.worms['u1'].heading = 0;
    session.worms['u1'].activePowerup = {
      kind: 'ghost',
      expiresAt: Date.now() + 10_000,
    };
    service.tick('r1');
    expect(session.worms['u1'].alive).toBe(true);

    placeWormAt(
      session.worms['u1'],
      GLIMWORM_ARENA.width - 1,
      500,
      GLIMWORM_START_LENGTH,
      0,
    );
    session.worms['u1'].activePowerup = {
      kind: 'ghost',
      expiresAt: Date.now() + 10_000,
    };
    service.tick('r1');
    expect(session.worms['u1'].alive).toBe(false);
  });

  it('calls variant tickHook each tick (BR safe-zone shrinks)', () => {
    const { service, session } = startTwoWorms();
    const before = session.arena.safeZone?.radius;
    service.tick('r1');
    const after = session.arena.safeZone?.radius;
    expect(before).toBeDefined();
    expect(after).toBeLessThan(before as number);
  });

  it('calls endSession when checkEndCondition returns a winner', () => {
    const { service, session, realtime } = startTwoWorms();
    session.worms['u2'].alive = false;
    session.worms['u2'].livesLeft = 0;
    service.tick('r1');
    expect(session.status).toBe('ended');
    expect(session.winner).toBe('u1');
    expect(realtime.emitToRoom).toHaveBeenCalledWith(
      'r1',
      'glimworm.event',
      expect.objectContaining({ type: 'round_ended', winner: 'u1' }),
    );
  });

  it('emits per-viewer snapshot via emitToClientInRoom each tick', () => {
    const { service, realtime } = startTwoWorms();
    realtime.emitToClientInRoom.mockClear();
    service.tick('r1');
    // 2 worms → 2 personalised snapshots per tick
    expect(realtime.emitToClientInRoom).toHaveBeenCalledTimes(2);
    expect(realtime.emitToClientInRoom).toHaveBeenCalledWith(
      'r1',
      'u1',
      'glimworm.snapshot',
      expect.objectContaining({ tickNum: 1 }),
    );
  });
});
