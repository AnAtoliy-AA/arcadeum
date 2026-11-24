import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { runInTransaction } from '../common/utils/transaction.util';
import {
  StreamSettingsDoc,
  StreamSettingsDocument,
} from './schemas/stream-settings.schema';
import {
  StreamSettingsAudit,
  StreamSettingsAuditDocument,
} from './schemas/stream-settings-audit.schema';
import {
  StreamCommand,
  StreamCommandDocument,
} from './schemas/stream-command.schema';
import {
  StreamStatusDoc,
  StreamStatusDocument,
} from './schemas/stream-status.schema';
import {
  LIMITS,
  bannerProblem,
  diffSettings,
  enabledGameCount,
  isValidJoinUrl,
  isValidTrackName,
  normalizeSettings,
  type SettingChange,
  type StreamSettings,
} from './stream-settings.model';
import type { UpdateStreamSettingsDto } from './dto/update-stream-settings.dto';
import type { StreamCommandDto } from './dto/stream-command.dto';
import type { StreamStatusDto } from './dto/stream-status.dto';
import type { AckCommandDto } from './dto/ack-command.dto';
import type {
  StreamAuditView,
  StreamCommandView,
  StreamConfigView,
  StreamSettingsView,
  StreamStatusView,
} from './stream.types';

const KEY = 'default';
/** The director reports every ~10 s; allow a few missed reports. */
export const STATUS_ONLINE_WINDOW_MS = 45_000;
/** A command nobody picked up in this long is stale and must not fire. */
export const COMMAND_TTL_MS = 2 * 60_000;

interface Labelled {
  _id: Types.ObjectId;
  displayName?: string;
  username?: string;
}
type SettingsLean = {
  version: number;
  config: Record<string, unknown>;
  updatedAt?: Date;
  updatedBy?: Labelled | null;
};
type AuditLean = {
  _id: Types.ObjectId;
  kind: 'settings' | 'command';
  version: number;
  changes: SettingChange[];
  adminUserId?: Labelled | null;
  createdAt?: Date;
};
type CommandLean = {
  _id: Types.ObjectId;
  type: string;
  graceful: boolean;
  status: string;
  createdAt?: Date;
};

const label = (u?: Labelled | null): string =>
  u?.displayName ?? u?.username ?? 'admin';

@Injectable()
export class StreamService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(StreamSettingsDoc.name)
    private readonly settingsModel: Model<StreamSettingsDocument>,
    @InjectModel(StreamSettingsAudit.name)
    private readonly auditModel: Model<StreamSettingsAuditDocument>,
    @InjectModel(StreamCommand.name)
    private readonly commandModel: Model<StreamCommandDocument>,
    @InjectModel(StreamStatusDoc.name)
    private readonly statusModel: Model<StreamStatusDocument>,
  ) {}

  // ---- settings ----

  async getSettings(): Promise<StreamSettingsView> {
    const doc = await this.settingsModel
      .findOne({ key: KEY })
      .populate<{ updatedBy: Labelled | null }>(
        'updatedBy',
        'displayName username',
      )
      .lean<SettingsLean | null>();
    return {
      version: doc?.version ?? 0,
      settings: normalizeSettings(doc?.config),
      updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
      updatedByLabel: doc?.updatedBy ? label(doc.updatedBy) : null,
    };
  }

  /** Payload for the director. Only the settings model: never any secret. */
  async getConfig(): Promise<StreamConfigView> {
    const doc = await this.settingsModel
      .findOne({ key: KEY })
      .lean<SettingsLean | null>();
    return {
      version: doc?.version ?? 0,
      config: normalizeSettings(doc?.config),
    };
  }

  /** Reject what clamping cannot fix: bad text, bad URL, too few games. */
  validateMerged(merged: StreamSettings, dto: UpdateStreamSettingsDto): void {
    const banner = dto.overlay?.bannerText;
    if (banner !== undefined) {
      const problem = bannerProblem(banner.replace(/\s+/g, ' ').trim());
      if (problem) throw new BadRequestException(problem);
    }
    const joinUrl = dto.overlay?.joinUrl;
    if (joinUrl !== undefined && !isValidJoinUrl(joinUrl.trim())) {
      throw new BadRequestException('stream.invalidJoinUrl');
    }
    if (dto.music?.tracks?.some((t) => !isValidTrackName(t))) {
      throw new BadRequestException('stream.invalidTrackName');
    }
    if (enabledGameCount(merged) < LIMITS.minEnabledGames) {
      throw new BadRequestException('stream.minGames');
    }
  }

  async updateSettings(
    dto: UpdateStreamSettingsDto,
    adminUserId: string,
  ): Promise<StreamSettingsView> {
    const { expectedVersion, ...patch } = dto;
    const current = await this.getSettings();
    if (expectedVersion !== undefined && expectedVersion !== current.version) {
      throw new ConflictException('stream.versionConflict');
    }
    const merged = this.mergePatch(current.settings, patch);
    this.validateMerged(merged, dto);
    await this.persist(merged, adminUserId, current.version);
    return this.getSettings();
  }

  /** Deep-merge a partial DTO over current settings, then clamp. */
  private mergePatch(
    base: StreamSettings,
    patch: Omit<UpdateStreamSettingsDto, 'expectedVersion'>,
  ): StreamSettings {
    const p = patch as Record<string, unknown>;
    const obj = (v: unknown): Record<string, unknown> =>
      v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
    const games: Record<string, unknown> = {};
    for (const [id, g] of Object.entries(base.games)) {
      games[id] = { ...g, ...obj(obj(p.games)[id]) };
    }
    const overlay = obj(p.overlay);
    return normalizeSettings(
      {
        ...base,
        ...p,
        games,
        bot: { ...base.bot, ...obj(p.bot) },
        overlay: {
          ...base.overlay,
          ...overlay,
          parts: { ...base.overlay.parts, ...obj(overlay.parts) },
        },
        music: { ...base.music, ...obj(p.music) },
        video: { ...base.video, ...obj(p.video) },
      },
      base,
    );
  }

  private async persist(
    next: StreamSettings,
    adminUserId: string,
    previousVersion: number,
  ): Promise<void> {
    await runInTransaction(this.connection, async (session) => {
      const before = await this.currentInSession(session);
      const changes = diffSettings(before, next);
      if (changes.length === 0) return;
      const saved = await this.settingsModel
        .findOneAndUpdate(
          { key: KEY },
          {
            $set: {
              config: next,
              updatedBy: new Types.ObjectId(adminUserId),
            },
            $inc: { version: 1 },
          },
          { upsert: true, session, new: true },
        )
        .lean<{ version: number }>();
      await this.auditModel.create(
        [
          {
            adminUserId: new Types.ObjectId(adminUserId),
            version: saved?.version ?? previousVersion + 1,
            kind: 'settings',
            changes,
          },
        ],
        { session },
      );
    });
  }

  private async currentInSession(
    session?: ClientSession,
  ): Promise<StreamSettings> {
    const doc = await this.settingsModel
      .findOne({ key: KEY }, null, { session })
      .lean<SettingsLean | null>();
    return normalizeSettings(doc?.config);
  }

  async getAudit(limit = 30): Promise<StreamAuditView[]> {
    const n = Math.min(Math.max(Math.trunc(limit) || 30, 1), 100);
    const rows = await this.auditModel
      .find()
      .sort({ createdAt: -1 })
      .limit(n)
      .populate<{ adminUserId: Labelled | null }>(
        'adminUserId',
        'displayName username',
      )
      .lean<AuditLean[]>();
    return rows.map((r) => ({
      id: String(r._id),
      kind: r.kind,
      version: r.version,
      adminLabel: label(r.adminUserId),
      changedAt: new Date(r.createdAt ?? Date.now()).toISOString(),
      changes: r.changes ?? [],
    }));
  }

  // ---- commands ----

  /**
   * Queue a command for the director. start/stop also flip `enabled` in the
   * saved settings so the state survives a director restart. A pending
   * command of the same type is reused, so a double click cannot stack.
   */
  async enqueueCommand(
    dto: StreamCommandDto,
    adminUserId: string,
  ): Promise<StreamCommandView> {
    if (dto.type === 'start' || dto.type === 'stop') {
      const current = await this.getSettings();
      const merged: StreamSettings = {
        ...current.settings,
        enabled: dto.type === 'start',
        stopGracefully:
          dto.type === 'stop'
            ? (dto.graceful ?? false)
            : current.settings.stopGracefully,
      };
      await this.persist(merged, adminUserId, current.version);
    }
    const since = new Date(Date.now() - COMMAND_TTL_MS);
    const existing = await this.commandModel
      .findOne({
        type: dto.type,
        status: 'pending',
        createdAt: { $gte: since },
      })
      .lean<CommandLean | null>();
    if (existing) return this.toCommandView(existing);

    const graceful = dto.type === 'stop' ? (dto.graceful ?? false) : false;
    const created = await this.commandModel.create({
      type: dto.type,
      graceful,
      status: 'pending',
      requestedBy: new Types.ObjectId(adminUserId),
    });
    await this.auditModel.create({
      adminUserId: new Types.ObjectId(adminUserId),
      version: (await this.getConfig()).version,
      kind: 'command',
      changes: [
        {
          path: 'command',
          from: null,
          to: graceful ? `${dto.type} (graceful)` : dto.type,
        },
      ],
    });
    return this.toCommandView(created.toObject() as CommandLean);
  }

  /** Pending commands for the director; stale ones are expired first. */
  async pollCommands(): Promise<StreamCommandView[]> {
    const cutoff = new Date(Date.now() - COMMAND_TTL_MS);
    await this.commandModel.updateMany(
      { status: 'pending', createdAt: { $lt: cutoff } },
      { $set: { status: 'expired' } },
    );
    const rows = await this.commandModel
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean<CommandLean[]>();
    return rows.map((r) => this.toCommandView(r));
  }

  async ackCommand(id: string, dto: AckCommandDto): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('stream.invalidCommandId');
    }
    await this.commandModel.updateOne(
      { _id: new Types.ObjectId(id), status: 'pending' },
      {
        $set: {
          status: dto.result,
          ackedAt: new Date(),
          message: dto.message?.slice(0, 300),
        },
      },
    );
  }

  private toCommandView(r: CommandLean): StreamCommandView {
    return {
      id: String(r._id),
      type: r.type as StreamCommandView['type'],
      graceful: !!r.graceful,
      status: r.status,
      createdAt: new Date(r.createdAt ?? Date.now()).toISOString(),
    };
  }

  // ---- status ----

  async saveStatus(dto: StreamStatusDto): Promise<void> {
    await this.statusModel.updateOne(
      { key: KEY },
      { $set: { status: { ...dto }, receivedAt: new Date() } },
      { upsert: true },
    );
  }

  async getStatus(): Promise<StreamStatusView> {
    const [doc, config, pending] = await Promise.all([
      this.statusModel
        .findOne({ key: KEY })
        .lean<{ status: Record<string, unknown>; receivedAt: Date } | null>(),
      this.getConfig(),
      this.commandModel.countDocuments({ status: 'pending' }),
    ]);
    const s = doc?.status ?? {};
    const str = (k: string): string | null =>
      typeof s[k] === 'string' ? s[k] : null;
    const num = (k: string): number | null =>
      typeof s[k] === 'number' ? s[k] : null;
    const receivedAt = doc?.receivedAt ? new Date(doc.receivedAt) : null;
    return {
      online:
        !!receivedAt &&
        Date.now() - receivedAt.getTime() <= STATUS_ONLINE_WINDOW_MS,
      lastReportAt: receivedAt?.toISOString() ?? null,
      state: str('state'),
      currentGame:
        (s.currentGame as StreamStatusView['currentGame'] | undefined) ?? null,
      uptimeSec: num('uptimeSec'),
      ffmpegFps: num('ffmpegFps'),
      ffmpegRestarts: num('ffmpegRestarts'),
      gamesPlayed: num('gamesPlayed'),
      dryRun: typeof s.dryRun === 'boolean' ? s.dryRun : null,
      lastRestartReason: str('lastRestartReason'),
      lastRestartAt: str('lastRestartAt'),
      recentErrors: Array.isArray(s.recentErrors)
        ? (s.recentErrors as string[])
        : [],
      appliedConfigVersion: num('appliedConfigVersion'),
      currentConfigVersion: config.version,
      pendingCommands: pending,
    };
  }
}
