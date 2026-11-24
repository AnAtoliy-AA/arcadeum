import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { StreamService, COMMAND_TTL_MS } from './stream.service';
import {
  defaultSettings,
  normalizeSettings,
  type StreamSettings,
} from './stream-settings.model';

/** Chainable query stub: resolves to `value` from `.lean()`. */
const q = <T>(value: T) => {
  const chain: Record<string, jest.Mock> = {};
  for (const m of ['populate', 'sort', 'limit']) {
    chain[m] = jest.fn(() => chain);
  }
  chain.lean = jest.fn(() => Promise.resolve(value));
  return chain;
};

describe('StreamService', () => {
  const admin = new Types.ObjectId().toHexString();
  let stored: { version: number; config: StreamSettings } | null;
  let audit: Record<string, unknown>[];
  let commands: Record<string, unknown>[];
  let status: { status: Record<string, unknown>; receivedAt: Date } | null;
  let service: StreamService;

  beforeEach(() => {
    stored = null;
    audit = [];
    commands = [];
    status = null;
    const settingsModel = {
      findOne: jest.fn(() => q(stored)),
      findOneAndUpdate: jest.fn(
        (_f: unknown, upd: { $set: { config: StreamSettings } }) => {
          stored = {
            version: (stored?.version ?? 0) + 1,
            config: upd.$set.config,
          };
          return q({ version: stored.version });
        },
      ),
    };
    const auditModel = {
      create: jest.fn(
        (doc: Record<string, unknown> | Record<string, unknown>[]) => {
          const d = Array.isArray(doc) ? doc[0] : doc;
          audit.push(d);
          return Promise.resolve(d);
        },
      ),
      find: jest.fn(() => q(audit)),
    };
    const commandModel = {
      findOne: jest.fn((f: { type: string }) =>
        q(
          commands.find((c) => c.type === f.type && c.status === 'pending') ??
            null,
        ),
      ),
      create: jest.fn((doc: Record<string, unknown>) => {
        const c = { _id: new Types.ObjectId(), createdAt: new Date(), ...doc };
        commands.push(c);
        return Promise.resolve({ toObject: () => c });
      }),
      find: jest.fn(() => q(commands.filter((c) => c.status === 'pending'))),
      updateMany: jest.fn(() => Promise.resolve({})),
      updateOne: jest.fn(
        (
          f: { _id: Types.ObjectId },
          upd: { $set: Record<string, unknown> },
        ) => {
          const c = commands.find((x) => String(x._id) === String(f._id));
          if (c && c.status === 'pending') Object.assign(c, upd.$set);
          return Promise.resolve({});
        },
      ),
      countDocuments: jest.fn(() =>
        Promise.resolve(commands.filter((c) => c.status === 'pending').length),
      ),
    };
    const statusModel = {
      updateOne: jest.fn(
        (_f: unknown, upd: { $set: { status: Record<string, unknown> } }) => {
          status = { status: upd.$set.status, receivedAt: new Date() };
          return Promise.resolve({});
        },
      ),
      findOne: jest.fn(() => q(status)),
    };
    service = new StreamService(
      {} as never,
      settingsModel as never,
      auditModel as never,
      commandModel as never,
      statusModel as never,
    );
  });

  it('returns defaults before anything is saved (version 0)', async () => {
    const v = await service.getSettings();
    expect(v.version).toBe(0);
    expect(v.settings).toEqual(defaultSettings());
    expect((await service.getConfig()).version).toBe(0);
  });

  it('saves, bumps the version and writes an audit row with who/what', async () => {
    const v = await service.updateSettings(
      { bot: { moveDelayMs: 3000 } },
      admin,
    );
    expect(v.version).toBe(1);
    expect(v.settings.bot.moveDelayMs).toBe(3000);
    expect(audit).toHaveLength(1);
    expect(String(audit[0].adminUserId)).toBe(admin);
    expect(audit[0].changes).toEqual([
      { path: 'bot.moveDelayMs', from: 2000, to: 3000 },
    ]);
  });

  it('clamps out-of-range numbers instead of storing them', async () => {
    const v = await service.updateSettings(
      {
        bot: { moveDelayMs: 1 },
        music: { volume: 900 },
        video: { bitrateKbps: 99999 },
      },
      admin,
    );
    expect(v.settings.bot.moveDelayMs).toBe(500);
    expect(v.settings.music.volume).toBe(100);
    expect(v.settings.video.bitrateKbps).toBe(6000);
  });

  it('does not bump the version or audit when nothing changed', async () => {
    await service.updateSettings({}, admin);
    expect(audit).toHaveLength(0);
    expect((await service.getConfig()).version).toBe(0);
  });

  it('rejects profane banner, bad URL, bad track and <2 games with 400', async () => {
    await expect(
      service.updateSettings(
        { overlay: { bannerText: 'what the fuck' } },
        admin,
      ),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.updateSettings({ overlay: { joinUrl: 'javascript:1' } }, admin),
    ).rejects.toThrow('stream.invalidJoinUrl');
    await expect(
      service.updateSettings({ music: { tracks: ['../x.mp3'] } }, admin),
    ).rejects.toThrow('stream.invalidTrackName');
    const off = Object.fromEntries(
      Object.keys(defaultSettings().games)
        .slice(1)
        .map((id) => [id, { enabled: false }]),
    );
    await expect(service.updateSettings({ games: off }, admin)).rejects.toThrow(
      'stream.minGames',
    );
    expect(audit).toHaveLength(0);
  });

  it('detects a concurrent edit through expectedVersion', async () => {
    await service.updateSettings({ secondsBetweenGames: 20 }, admin);
    await expect(
      service.updateSettings(
        {
          secondsBetweenGames: 30,
          expectedVersion: 0,
        },
        admin,
      ),
    ).rejects.toThrow(ConflictException);
  });

  describe('command queue', () => {
    it('queues skip and restart_browser and audits them', async () => {
      const c = await service.enqueueCommand({ type: 'skip' }, admin);
      expect(c).toMatchObject({ type: 'skip', status: 'pending' });
      expect(audit[0]).toMatchObject({ kind: 'command' });
      expect(await service.pollCommands()).toHaveLength(1);
    });

    it('stop flips enabled (with graceful flag) and queues a command', async () => {
      await service.enqueueCommand({ type: 'stop', graceful: true }, admin);
      const s = (await service.getSettings()).settings;
      expect(s.enabled).toBe(false);
      expect(s.stopGracefully).toBe(true);
      await service.enqueueCommand({ type: 'start' }, admin);
      expect((await service.getSettings()).settings.enabled).toBe(true);
    });

    it('does not stack duplicate pending commands', async () => {
      const a = await service.enqueueCommand({ type: 'skip' }, admin);
      const b = await service.enqueueCommand({ type: 'skip' }, admin);
      expect(b.id).toBe(a.id);
      expect(commands).toHaveLength(1);
    });

    it('acks a command once and expires stale ones on poll', async () => {
      const c = await service.enqueueCommand({ type: 'skip' }, admin);
      await service.ackCommand(c.id, { result: 'done' });
      expect(await service.pollCommands()).toHaveLength(0);
      await expect(
        service.ackCommand('nope', { result: 'done' }),
      ).rejects.toThrow(BadRequestException);
      const spy = (
        service as unknown as { commandModel: { updateMany: jest.Mock } }
      ).commandModel.updateMany;
      expect(spy).toHaveBeenCalledWith(
        { status: 'pending', createdAt: { $lt: expect.any(Date) as Date } },
        { $set: { status: 'expired' } },
      );
      expect(COMMAND_TTL_MS).toBeGreaterThan(0);
    });
  });

  describe('status', () => {
    const report = {
      state: 'live',
      uptimeSec: 100,
      ffmpegFps: 30,
      ffmpegRestarts: 0,
      gamesPlayed: 2,
      dryRun: false,
      appliedConfigVersion: 3,
      recentErrors: [],
    };

    it('is offline until the director reports', async () => {
      const s = await service.getStatus();
      expect(s.online).toBe(false);
      expect(s.appliedConfigVersion).toBeNull();
    });

    it('shows applied vs current version after a report', async () => {
      await service.updateSettings({ secondsBetweenGames: 20 }, admin);
      await service.saveStatus(report);
      const s = await service.getStatus();
      expect(s.online).toBe(true);
      expect(s.appliedConfigVersion).toBe(3);
      expect(s.currentConfigVersion).toBe(1);
      expect(s.state).toBe('live');
    });

    it('marks a stale report offline', async () => {
      await service.saveStatus(report);
      if (status) status.receivedAt = new Date(Date.now() - 120_000);
      expect((await service.getStatus()).online).toBe(false);
    });
  });

  it('exposes only the settings model to the director', async () => {
    await service.updateSettings({ secondsBetweenGames: 20 }, admin);
    const cfg = await service.getConfig();
    expect(Object.keys(cfg).sort()).toEqual(['config', 'version']);
    expect(cfg.config).toEqual(normalizeSettings({ secondsBetweenGames: 20 }));
  });
});
