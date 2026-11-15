import { EventEmitter } from 'events';
import { ChessStockfishService } from './chess-stockfish.service';
import type { EconomySettingsService } from '../../../economy/economy-settings.service';
import type { SyzygyTablebaseService } from './syzygy.service';

describe('ChessStockfishService', () => {
  let service: ChessStockfishService;

  beforeEach(() => {
    const mockEconomy = {
      getNumber: jest.fn().mockResolvedValue(0),
    } as unknown as EconomySettingsService;

    const mockTablebase = {
      isAvailable: jest.fn().mockReturnValue(false),
    } as unknown as SyzygyTablebaseService;

    service = new ChessStockfishService(mockEconomy, mockTablebase);
  });

  it('safely handles onModuleDestroy when instances have closed or broken stdin', () => {
    const stdinEmitter = new EventEmitter();
    const mockStdin = Object.assign(stdinEmitter, {
      writable: true,
      destroyed: false,
      write: jest.fn((chunk: string, cb?: (err?: Error | null) => void) => {
        const error = new Error('write EPIPE');
        (error as NodeJS.ErrnoException).code = 'EPIPE';
        stdinEmitter.emit('error', error);
        cb?.(error);
        return false;
      }),
    });

    const mockProcess = Object.assign(new EventEmitter(), {
      killed: false,
      stdin: mockStdin,
      kill: jest.fn(() => {
        mockProcess.killed = true;
      }),
    });

    stdinEmitter.on('error', () => {});

    const mockInstance = {
      process: mockProcess as unknown as import('child_process').ChildProcess,
      busy: false,
      pending: null,
      ready: true,
      buffer: '',
      gamesServed: 0,
    };

    (
      service as unknown as { instances: (typeof mockInstance)[] }
    ).instances.push(mockInstance);

    expect(() => {
      service.onModuleDestroy();
    }).not.toThrow();

    expect(mockProcess.kill).toHaveBeenCalled();
    expect(
      (service as unknown as { instances: unknown[] }).instances,
    ).toHaveLength(0);
  });
});
