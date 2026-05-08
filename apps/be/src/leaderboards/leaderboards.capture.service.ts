import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LeaderboardEntry,
  GAME_MODE_VALUES,
  type GameMode,
} from './schemas/leaderboard-entry.schema';
import { LeaderboardsGateway } from './leaderboards.gateway';

const DEFAULT_INTERVAL_MS = 60_000;

export type CaptureResult = {
  mode: GameMode;
  season: string;
  updated: number;
};

@Injectable()
export class LeaderboardsCaptureService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(LeaderboardsCaptureService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel(LeaderboardEntry.name)
    private readonly entryModel: Model<LeaderboardEntry>,
    @Inject(forwardRef(() => LeaderboardsGateway))
    private readonly gateway: LeaderboardsGateway,
  ) {}

  onModuleInit(): void {
    if (process.env.LEADERBOARDS_CAPTURE_DISABLED === 'true') {
      this.logger.log(
        'Capture loop disabled via LEADERBOARDS_CAPTURE_DISABLED.',
      );
      return;
    }
    if (process.env.NODE_ENV === 'test') return;
    const interval = readIntervalMs();
    this.logger.log(`Capture loop scheduled every ${interval}ms.`);
    this.timer = setInterval(() => {
      this.captureAll().catch((err: unknown) =>
        this.logger.error(
          `Capture failed: ${err instanceof Error ? err.message : String(err)}`,
        ),
      );
    }, interval);
    if (typeof this.timer.unref === 'function') this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Snapshot the current leaderboard for every mode in the active season.
   * For each entry: prevRank ← previously cached rank; rank ← rating-desc index.
   */
  async captureAll(): Promise<CaptureResult[]> {
    const season = currentSeason();
    const results: CaptureResult[] = [];
    for (const mode of GAME_MODE_VALUES) {
      results.push(await this.capture(mode, season));
    }
    this.gateway.emitCaptured(results);
    return results;
  }

  async capture(mode: GameMode, season: string): Promise<CaptureResult> {
    const entries = await this.entryModel
      .find({ mode, season })
      .sort({ rating: -1, _id: 1 })
      .select({ _id: 1, rank: 1 })
      .lean()
      .exec();

    if (entries.length === 0) {
      return { mode, season, updated: 0 };
    }

    const ops = entries.map((entry, idx) => {
      const newRank = idx + 1;
      const prevRank = typeof entry.rank === 'number' ? entry.rank : newRank;
      return {
        updateOne: {
          filter: { _id: entry._id },
          update: { $set: { rank: newRank, prevRank } },
        },
      };
    });

    await this.entryModel.bulkWrite(ops);
    this.logger.debug(
      `Captured ${ops.length} ranks for mode=${mode} season=${season}.`,
    );
    return { mode, season, updated: ops.length };
  }
}

function readIntervalMs(): number {
  const raw = process.env.LEADERBOARDS_CAPTURE_INTERVAL_MS;
  if (!raw) return DEFAULT_INTERVAL_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 5_000
    ? parsed
    : DEFAULT_INTERVAL_MS;
}

function currentSeason(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const q = Math.floor(now.getUTCMonth() / 3) + 1;
  return `${y}Q${q}`;
}
