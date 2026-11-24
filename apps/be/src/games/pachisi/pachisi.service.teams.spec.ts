import { PachisiService } from './pachisi.service';
import { BaseGameService } from '../common/base-game.service';

type RoomsMock = {
  getRoom: jest.Mock;
  getRoomParticipants: jest.Mock;
};

function makeService(gameOptions: unknown, participants: string[]) {
  const rooms: RoomsMock = {
    getRoom: jest.fn().mockResolvedValue({ hostId: 'h', gameOptions }),
    getRoomParticipants: jest.fn().mockResolvedValue(participants),
  };
  const service = new PachisiService(
    rooms as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  return service;
}

describe('PachisiService teams', () => {
  afterEach(() => jest.restoreAllMocks());

  it('resolveOptions reads teams only when strictly true', () => {
    const s = makeService({}, []) as unknown as {
      resolveOptions(raw: unknown): { teams?: boolean };
    };
    expect(s.resolveOptions({ teams: true }).teams).toBe(true);
    expect(s.resolveOptions({ teams: 'true' }).teams).toBe(false);
    expect(s.resolveOptions({}).teams).toBe(false);
  });

  it('team rooms always start with four players, bots fill empty seats', async () => {
    const spy = jest
      .spyOn(BaseGameService.prototype, 'startSession')
      .mockResolvedValue({} as never);
    const s = makeService({ teams: true }, ['h', 'u2']);
    await s.startSession('h', 'room', false, undefined, undefined);
    expect(spy).toHaveBeenCalledWith('h', 'room', true, 2, undefined);
  });

  it('keeps already-seated bots when topping up to four', async () => {
    const spy = jest
      .spyOn(BaseGameService.prototype, 'startSession')
      .mockResolvedValue({} as never);
    const s = makeService({ teams: true }, ['h', 'bot-1', 'u3']);
    await s.startSession('h', 'room');
    expect(spy).toHaveBeenCalledWith('h', 'room', true, 2, undefined);
  });

  it('non-team rooms pass start arguments through untouched', async () => {
    const spy = jest
      .spyOn(BaseGameService.prototype, 'startSession')
      .mockResolvedValue({} as never);
    const s = makeService({}, ['h', 'u2']);
    await s.startSession('h', 'room', true, 1, undefined);
    expect(spy).toHaveBeenCalledWith('h', 'room', true, 1, undefined);
  });
});
