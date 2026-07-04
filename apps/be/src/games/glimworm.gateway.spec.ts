import { GlimwormGateway } from './glimworm.gateway';
import type { GlimwormService } from './glimworm/glimworm.service';
import type { Socket } from 'socket.io';
import type { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import type { UserRoleResolver } from '../auth/lib/user-role-resolver.service';

const mockJwt = {} as never;
const mockConfig = {} as never;

const makeService = () =>
  ({
    submitInput: jest.fn(),
    start: jest.fn(),
    setColor: jest.fn(),
  }) as unknown as GlimwormService & {
    submitInput: jest.Mock;
    start: jest.Mock;
    setColor: jest.Mock;
  };

const makeSocket = () =>
  ({ emit: jest.fn() }) as unknown as Socket & { emit: jest.Mock };

const makeVisibility = (
  overrides: Partial<{ assertVisible: jest.Mock; canSee: jest.Mock }> = {},
) =>
  ({
    canSee: jest.fn().mockResolvedValue(true),
    assertVisible: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as GameVisibilityService & {
    canSee: jest.Mock;
    assertVisible: jest.Mock;
  };

const makeResolver = (role: string = 'free') =>
  ({
    resolveRole: jest.fn().mockResolvedValue(role),
  }) as unknown as UserRoleResolver & { resolveRole: jest.Mock };

const buildGateway = (
  service: GlimwormService,
  vis: GameVisibilityService = makeVisibility(),
  resolver: UserRoleResolver = makeResolver(),
): GlimwormGateway =>
  new GlimwormGateway(service, vis, resolver, mockJwt, mockConfig);

describe('GlimwormGateway', () => {
  describe('handleInput', () => {
    it('forwards a valid input to the service', () => {
      const service = makeService();
      const gw = buildGateway(service);
      gw.handleInput(
        { roomId: 'r1', userId: 'u1', angle: 0.5, usePowerup: false },
        makeSocket(),
      );
      expect(service.submitInput).toHaveBeenCalledWith('r1', 'u1', {
        angle: 0.5,
        usePowerup: false,
      });
    });

    it('coerces non-number angle to NaN and forwards (service rejects it)', () => {
      const service = makeService();
      service.submitInput.mockImplementation(() => {
        throw new Error('Invalid angle');
      });
      const gw = buildGateway(service);
      expect(() =>
        gw.handleInput(
          { roomId: 'r1', userId: 'u1', angle: 'not-a-number' },
          makeSocket(),
        ),
      ).toThrow();
      expect(service.submitInput).toHaveBeenCalled();
      const calls = service.submitInput.mock.calls as Array<
        [string, string, { angle: number; usePowerup: boolean }]
      >;
      expect(Number.isNaN(calls[0][2].angle)).toBe(true);
    });

    it('treats usePowerup as boolean (truthy strings are not "true")', () => {
      const service = makeService();
      const gw = buildGateway(service);
      gw.handleInput(
        { roomId: 'r1', userId: 'u1', angle: 0, usePowerup: 'yes' },
        makeSocket(),
      );
      const calls = service.submitInput.mock.calls as Array<
        [string, string, { angle: number; usePowerup: boolean }]
      >;
      expect(calls[0][2].usePowerup).toBe(false);
    });
  });

  describe('handleStart', () => {
    it('rejects an unknown variant', async () => {
      const service = makeService();
      const gw = buildGateway(service);
      await expect(
        gw.handleStart(
          { roomId: 'r1', userId: 'u1', variant: 'made_up' },
          makeSocket(),
        ),
      ).rejects.toThrow();
      expect(service.start).not.toHaveBeenCalled();
    });

    it('forwards a valid start to the service and acks the client', async () => {
      const service = makeService();
      const socket = makeSocket();
      const gw = buildGateway(service);
      await gw.handleStart(
        {
          roomId: 'r1',
          userId: 'u1',
          variant: 'battle_royale',
          powerupsEnabled: true,
          fillWithBots: false,
        },
        socket,
      );
      expect(service.start).toHaveBeenCalledWith('r1', 'u1', {
        variant: 'battle_royale',
        powerupsEnabled: true,
        fillWithBots: false,
      });
      expect(socket.emit).toHaveBeenCalledWith(
        'glimworm.start.ack',
        expect.anything(),
      );
    });

    it('propagates a service error (e.g., non-host) via handleException', async () => {
      const service = makeService();
      service.start.mockImplementation(() => {
        throw new Error('Only host can start');
      });
      const gw = buildGateway(service);
      await expect(
        gw.handleStart(
          {
            roomId: 'r1',
            userId: 'guest',
            variant: 'time_attack',
            powerupsEnabled: false,
          },
          makeSocket(),
        ),
      ).rejects.toThrow();
    });

    it('refuses to start when GameVisibilityService denies the variant', async () => {
      const service = makeService();
      const vis = makeVisibility({
        canSee: jest.fn().mockResolvedValue(false),
        assertVisible: jest
          .fn()
          .mockRejectedValue(
            Object.assign(new Error('denied'), { status: 403 }),
          ),
      });
      const resolver = makeResolver('free');
      const gw = buildGateway(service, vis, resolver);
      await expect(
        gw.handleStart(
          {
            roomId: 'r1',
            userId: 'u1',
            variant: 'time_attack',
            powerupsEnabled: false,
          },
          makeSocket(),
        ),
      ).rejects.toThrow();
      expect(resolver.resolveRole).toHaveBeenCalledWith('u1');
      expect(vis.assertVisible).toHaveBeenCalledWith(
        'free',
        'glimworm_v1',
        'time_attack',
      );
      expect(service.start).not.toHaveBeenCalled();
    });

    it('calls visibility gate before starting when visible', async () => {
      const service = makeService();
      const vis = makeVisibility();
      const resolver = makeResolver('vip');
      const gw = buildGateway(service, vis, resolver);
      await gw.handleStart(
        {
          roomId: 'r1',
          userId: 'u1',
          variant: 'battle_royale',
          powerupsEnabled: false,
        },
        makeSocket(),
      );
      expect(resolver.resolveRole).toHaveBeenCalledWith('u1');
      expect(vis.assertVisible).toHaveBeenCalledWith(
        'vip',
        'glimworm_v1',
        'battle_royale',
      );
      expect(service.start).toHaveBeenCalled();
    });
  });

  describe('handleColorPick', () => {
    it('forwards a valid color and acks the client with the picked colour', () => {
      const service = makeService();
      service.setColor.mockReturnValue('#5ee0ff');
      const socket = makeSocket();
      const gw = buildGateway(service);
      gw.handleColorPick(
        { roomId: 'r1', userId: 'u1', color: '#5ee0ff' },
        socket,
      );
      expect(service.setColor).toHaveBeenCalledWith('r1', 'u1', '#5ee0ff');
      expect(socket.emit).toHaveBeenCalledWith(
        'glimworm.color.pick.ack',
        expect.anything(),
      );
    });
  });
});
