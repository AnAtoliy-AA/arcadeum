import { SocketDeltaService } from './socket-delta.service';

describe('SocketDeltaService', () => {
  let service: SocketDeltaService;

  beforeEach(() => {
    service = new SocketDeltaService();
  });

  it('initializes room with full snapshot packet', () => {
    const packet = service.initRoom('room_1', { turn: 1, board: [0, 0, 0] });

    expect(packet.isFullSnapshot).toBe(true);
    expect(packet.sequenceId).toBe(1);
    expect(packet.snapshot).toEqual({ turn: 1, board: [0, 0, 0] });
  });

  it('generates incremental diffs on state updates', () => {
    service.initRoom('room_2', { turn: 1, score: 10 });
    const update = service.processStateUpdate('room_2', { turn: 2, score: 15 });

    expect(update.isFullSnapshot).toBe(false);
    expect(update.sequenceId).toBe(2);
    expect(update.diff).toEqual({ turn: 2, score: 15 });
  });

  it('provides full snapshot for client resynchronization', () => {
    service.initRoom('room_3', { turn: 1, status: 'active' });
    service.processStateUpdate('room_3', { turn: 2, status: 'playing' });

    const fullSnapshot = service.getFullSnapshot('room_3');
    expect(fullSnapshot).not.toBeNull();
    expect(fullSnapshot?.isFullSnapshot).toBe(true);
    expect(fullSnapshot?.sequenceId).toBe(2);
    expect(fullSnapshot?.snapshot).toEqual({ turn: 2, status: 'playing' });
  });

  it('cleans up room state on removeRoom', () => {
    service.initRoom('room_4', { turn: 1 });
    service.removeRoom('room_4');

    expect(service.getFullSnapshot('room_4')).toBeNull();
  });
});
