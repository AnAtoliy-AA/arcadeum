import {
  GLIMWORM_BASE_SPEED,
  GLIMWORM_PALETTE,
  GLIMWORM_START_LENGTH,
  GLIMWORM_TICK_MS,
} from './glimworm.constants';
import {
  buildSnapshotForViewer,
  findSpawnPosition,
} from './glimworm.service.tick';
import { makeService } from './glimworm.service.test-helpers';
import type { GlimwormSession } from './glimworm.types';

describe('GlimwormService — lifecycle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('joinRoom', () => {
    it('creates a session on first join and assigns palette colour', () => {
      const { service, store } = makeService();
      const worm = service.joinRoom('r1', 'u1');
      expect(worm.id).toBe('u1');
      expect(worm.ready).toBe(false);
      expect(worm.alive).toBe(true);
      expect(worm.color).toBe(GLIMWORM_PALETTE[0]);
      expect(store.get('r1')?.hostUserId).toBe('u1');
    });

    it('assigns a different palette colour to a second worm', () => {
      const { service } = makeService();
      service.joinRoom('r1', 'u1');
      const w2 = service.joinRoom('r1', 'u2');
      expect(w2.color).toBe(GLIMWORM_PALETTE[1]);
    });

    it('throws when room is full (10 worms)', () => {
      const { service } = makeService();
      for (let i = 0; i < 10; i++) {
        service.joinRoom('r1', `u${i}`);
      }
      expect(() => service.joinRoom('r1', 'u10')).toThrow('Room full');
    });
  });

  describe('leaveRoom', () => {
    it('removes worm in lobby status', () => {
      const { service, store } = makeService();
      service.joinRoom('r1', 'u1');
      service.joinRoom('r1', 'u2');
      service.leaveRoom('r1', 'u1');
      const session = store.get('r1');
      expect(session?.worms['u1']).toBeUndefined();
      expect(session?.worms['u2']).toBeDefined();
    });

    it('marks disconnected (does not remove) during playing status', () => {
      const { service, store } = makeService();
      service.joinRoom('r1', 'u1');
      service.joinRoom('r1', 'u2');
      const session = store.get('r1') as GlimwormSession;
      session.status = 'playing';
      service.leaveRoom('r1', 'u1');
      expect(session.worms['u1']).toBeDefined();
      expect(session.worms['u1'].disconnected).toBe(true);
      expect(session.worms['u1'].disconnectedAt).toEqual(expect.any(Number));
    });
  });

  describe('markReady', () => {
    it('toggles worm.ready', () => {
      const { service, store } = makeService();
      service.joinRoom('r1', 'u1');
      service.markReady('r1', 'u1', true);
      expect(store.get('r1')?.worms['u1'].ready).toBe(true);
      service.markReady('r1', 'u1', false);
      expect(store.get('r1')?.worms['u1'].ready).toBe(false);
    });
  });

  describe('start', () => {
    let setIntervalSpy: jest.SpyInstance;
    let clearIntervalSpy: jest.SpyInstance;

    beforeEach(() => {
      setIntervalSpy = jest
        .spyOn(global, 'setInterval')
        .mockImplementation(
          () => 0 as unknown as ReturnType<typeof setInterval>,
        );
      clearIntervalSpy = jest
        .spyOn(global, 'clearInterval')
        .mockImplementation(() => {});
      jest
        .spyOn(global, 'setTimeout')
        .mockImplementation(
          () => 0 as unknown as ReturnType<typeof setTimeout>,
        );
    });

    it('throws when caller is not host', () => {
      const { service } = makeService();
      service.joinRoom('r1', 'u1');
      service.joinRoom('r1', 'u2');
      service.markReady('r1', 'u1', true);
      service.markReady('r1', 'u2', true);
      expect(() =>
        service.start('r1', 'u2', {
          variant: 'battle_royale',
          powerupsEnabled: false,
        }),
      ).toThrow('Only host can start');
    });

    it('throws when fewer than 2 ready worms', () => {
      const { service } = makeService();
      service.joinRoom('r1', 'u1');
      service.joinRoom('r1', 'u2');
      service.markReady('r1', 'u1', true);
      expect(() =>
        service.start('r1', 'u1', {
          variant: 'battle_royale',
          powerupsEnabled: false,
        }),
      ).toThrow('Need at least 2 ready players');
    });

    it('starts: sets countdown status, startedAt, schedules tick interval, seeds segments', () => {
      const { service, store, realtime } = makeService();
      service.joinRoom('r1', 'u1');
      service.joinRoom('r1', 'u2');
      service.markReady('r1', 'u1', true);
      service.markReady('r1', 'u2', true);
      service.start('r1', 'u1', {
        variant: 'battle_royale',
        powerupsEnabled: true,
      });
      const session = store.get('r1') as GlimwormSession;
      expect(session.status).toBe('countdown');
      expect(session.startedAt).toEqual(expect.any(Number));
      expect(session.worms['u1'].segments.length).toBe(GLIMWORM_START_LENGTH);
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        GLIMWORM_TICK_MS,
      );
      expect(realtime.emitToRoom).toHaveBeenCalledWith(
        'r1',
        'glimworm.event',
        expect.objectContaining({ type: 'round_started' }),
      );
      service.onModuleDestroy();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('submitInput', () => {
    it('rejects NaN angle', () => {
      const { service } = makeService();
      service.joinRoom('r1', 'u1');
      expect(() =>
        service.submitInput('r1', 'u1', { angle: NaN, usePowerup: false }),
      ).toThrow('Invalid angle');
    });

    it('clamps out-of-range angles into [-π, π]', () => {
      const { service, store } = makeService();
      service.joinRoom('r1', 'u1');
      service.submitInput('r1', 'u1', { angle: 99, usePowerup: false });
      expect(store.get('r1')?.worms['u1'].heading).toBeCloseTo(Math.PI, 5);
    });

    it('rate-limits inputs within 33ms', () => {
      const { service, store } = makeService();
      service.joinRoom('r1', 'u1');
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValue(1_000);
      service.submitInput('r1', 'u1', { angle: 0.5, usePowerup: false });
      nowSpy.mockReturnValue(1_010);
      service.submitInput('r1', 'u1', { angle: 1.0, usePowerup: false });
      expect(store.get('r1')?.worms['u1'].heading).toBe(0.5);
    });

    it('activates inventory powerup when usePowerup=true and clears it', () => {
      const { service, store } = makeService();
      service.joinRoom('r1', 'u1');
      const session = store.get('r1') as GlimwormSession;
      session.worms['u1'].inventoryPowerup = 'speed';
      jest.spyOn(Date, 'now').mockReturnValue(5_000);
      service.submitInput('r1', 'u1', { angle: 0, usePowerup: true });
      expect(session.worms['u1'].inventoryPowerup).toBeNull();
      expect(session.worms['u1'].activePowerup?.kind).toBe('speed');
      expect(session.worms['u1'].speed).toBeGreaterThan(GLIMWORM_BASE_SPEED);
    });
  });

  describe('endSession', () => {
    it('sets status=ended, winner, emits round_ended and clears interval', () => {
      jest
        .spyOn(global, 'setInterval')
        .mockImplementation(
          () => 1 as unknown as ReturnType<typeof setInterval>,
        );
      const clearSpy = jest
        .spyOn(global, 'clearInterval')
        .mockImplementation(() => {});
      jest
        .spyOn(global, 'setTimeout')
        .mockImplementation(
          () => 0 as unknown as ReturnType<typeof setTimeout>,
        );
      const { service, store, realtime } = makeService();
      service.joinRoom('r1', 'u1');
      service.joinRoom('r1', 'u2');
      service.markReady('r1', 'u1', true);
      service.markReady('r1', 'u2', true);
      service.start('r1', 'u1', {
        variant: 'battle_royale',
        powerupsEnabled: false,
      });
      service.endSession('r1', 'u1');
      const session = store.get('r1') as GlimwormSession;
      expect(session.status).toBe('ended');
      expect(session.winner).toBe('u1');
      expect(realtime.emitToRoom).toHaveBeenCalledWith(
        'r1',
        'glimworm.event',
        expect.objectContaining({ type: 'round_ended', winner: 'u1' }),
      );
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('pure helpers', () => {
    it('findSpawnPosition returns a tile at least 200u from any segment', () => {
      const session: GlimwormSession = {
        roomId: 'r',
        hostUserId: 'h',
        variant: 'battle_royale',
        powerupsEnabled: false,
        status: 'lobby',
        startedAt: null,
        endsAt: null,
        arena: { width: 2000, height: 2000 },
        worms: {
          a: {
            id: 'a',
            color: '#fff',
            segments: [{ x: 100, y: 100 }],
            heading: 0,
            speed: GLIMWORM_BASE_SPEED,
            alive: true,
            livesLeft: 1,
            score: 0,
            ready: true,
            activePowerup: null,
            inventoryPowerup: null,
          },
        },
        food: [],
        powerups: [],
        winner: null,
        tickNum: 0,
        lastInputAt: {},
        lastPowerupSpawnAt: 0,
        damageTickAt: {},
      };
      const random = (): number => 0.5;
      const pos = findSpawnPosition(session, random);
      const dx = pos.x - 100;
      const dy = pos.y - 100;
      expect(Math.sqrt(dx * dx + dy * dy)).toBeGreaterThanOrEqual(200);
    });

    it('buildSnapshotForViewer marks self=true with full fields and others omit them', () => {
      const session: GlimwormSession = {
        roomId: 'r',
        hostUserId: 'h',
        variant: 'time_attack',
        powerupsEnabled: true,
        status: 'playing',
        startedAt: 0,
        endsAt: 100_000,
        arena: { width: 2000, height: 2000 },
        worms: {
          a: {
            id: 'a',
            color: '#abc',
            segments: [{ x: 1, y: 2 }],
            heading: 0.7,
            speed: 200,
            alive: true,
            livesLeft: 1,
            score: 5,
            ready: true,
            activePowerup: null,
            inventoryPowerup: 'speed',
          },
          b: {
            id: 'b',
            color: '#def',
            segments: [{ x: 3, y: 4 }],
            heading: 1.1,
            speed: 220,
            alive: true,
            livesLeft: 1,
            score: 7,
            ready: true,
            activePowerup: null,
            inventoryPowerup: 'shield',
          },
        },
        food: [],
        powerups: [],
        winner: null,
        tickNum: 7,
        lastInputAt: {},
        lastPowerupSpawnAt: 0,
        damageTickAt: {},
      };
      const snap = buildSnapshotForViewer(session, 'a', 12345);
      const self = snap.worms.find((w) => w.id === 'a');
      const other = snap.worms.find((w) => w.id === 'b');
      expect(self?.self).toBe(true);
      expect(self?.heading).toBe(0.7);
      expect(self?.speed).toBe(200);
      expect(self?.inventoryPowerup).toBe('speed');
      expect(other?.self).toBeUndefined();
      expect(other?.heading).toBeUndefined();
      expect(other?.speed).toBeUndefined();
      expect(other?.inventoryPowerup).toBeUndefined();
    });
  });
});
