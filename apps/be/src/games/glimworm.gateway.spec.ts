import { GlimwormGateway } from './glimworm.gateway';
import type { GlimwormService } from './glimworm/glimworm.service';
import type { Socket } from 'socket.io';

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

describe('GlimwormGateway', () => {
  describe('handleInput', () => {
    it('forwards a valid input to the service', () => {
      const service = makeService();
      const gw = new GlimwormGateway(service);
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
      const gw = new GlimwormGateway(service);
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
      const gw = new GlimwormGateway(service);
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
    it('rejects an unknown variant', () => {
      const service = makeService();
      const gw = new GlimwormGateway(service);
      expect(() =>
        gw.handleStart(
          { roomId: 'r1', userId: 'u1', variant: 'made_up' },
          makeSocket(),
        ),
      ).toThrow();
      expect(service.start).not.toHaveBeenCalled();
    });

    it('forwards a valid start to the service and acks the client', () => {
      const service = makeService();
      const socket = makeSocket();
      const gw = new GlimwormGateway(service);
      gw.handleStart(
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

    it('propagates a service error (e.g., non-host) via handleException', () => {
      const service = makeService();
      service.start.mockImplementation(() => {
        throw new Error('Only host can start');
      });
      const gw = new GlimwormGateway(service);
      expect(() =>
        gw.handleStart(
          {
            roomId: 'r1',
            userId: 'guest',
            variant: 'time_attack',
            powerupsEnabled: false,
          },
          makeSocket(),
        ),
      ).toThrow();
    });
  });

  describe('handleColorPick', () => {
    it('forwards a valid color and acks the client with the picked colour', () => {
      const service = makeService();
      service.setColor.mockReturnValue('#5ee0ff');
      const socket = makeSocket();
      const gw = new GlimwormGateway(service);
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
