import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface LeaderboardRankResult {
  userId: string;
  rank: number;
  score: number;
}

@Injectable()
export class RedisZsetLeaderboardService {
  private readonly logger = new Logger(RedisZsetLeaderboardService.name);
  private redisClient: Redis | null = null;
  private readonly inMemoryScores = new Map<string, Map<string, number>>();

  constructor(@Optional() private readonly configService?: ConfigService) {
    const redisUrl = this.configService?.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          lazyConnect: true,
        });
        this.redisClient.on('error', (err: Error) => {
          this.logger.warn(`Redis ZSET error: ${err.message}`);
        });
        this.redisClient.connect().catch((err: Error) => {
          this.logger.warn(`Redis ZSET connection failed: ${err.message}`);
        });
      } catch (err) {
        this.logger.warn(
          `Redis ZSET initialization failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  private keyFor(mode: string, season: string): string {
    return `leaderboard:${season}:${mode}`;
  }

  async recordScore(
    mode: string,
    season: string,
    userId: string,
    score: number,
  ): Promise<void> {
    const key = this.keyFor(mode, season);

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        await this.redisClient.zadd(key, score, userId);
        return;
      } catch (err) {
        this.logger.warn(`Redis zadd failed: ${String(err)}`);
      }
    }

    let board = this.inMemoryScores.get(key);
    if (!board) {
      board = new Map<string, number>();
      this.inMemoryScores.set(key, board);
    }
    board.set(userId, score);
  }

  async getTopRanks(
    mode: string,
    season: string,
    limit = 50,
    offset = 0,
  ): Promise<LeaderboardRankResult[]> {
    const key = this.keyFor(mode, season);

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const stop = offset + limit - 1;
        const results = await this.redisClient.zrevrange(
          key,
          offset,
          stop,
          'WITHSCORES',
        );
        const entries: LeaderboardRankResult[] = [];
        for (let i = 0; i < results.length; i += 2) {
          const userId = results[i];
          const score = Number.parseFloat(results[i + 1] ?? '0');
          entries.push({
            userId,
            rank: offset + Math.floor(i / 2) + 1,
            score,
          });
        }
        return entries;
      } catch (err) {
        this.logger.warn(`Redis zrevrange failed: ${String(err)}`);
      }
    }

    const board = this.inMemoryScores.get(key);
    if (!board || board.size === 0) return [];

    const sorted = [...board.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(offset, offset + limit);

    return sorted.map(([userId, score], idx) => ({
      userId,
      rank: offset + idx + 1,
      score,
    }));
  }

  async getUserRank(
    mode: string,
    season: string,
    userId: string,
  ): Promise<LeaderboardRankResult | null> {
    const key = this.keyFor(mode, season);

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const [rankIndex, scoreStr] = await Promise.all([
          this.redisClient.zrevrank(key, userId),
          this.redisClient.zscore(key, userId),
        ]);

        if (rankIndex === null || scoreStr === null) return null;

        return {
          userId,
          rank: rankIndex + 1,
          score: Number.parseFloat(scoreStr),
        };
      } catch (err) {
        this.logger.warn(`Redis zrevrank failed: ${String(err)}`);
      }
    }

    const board = this.inMemoryScores.get(key);
    if (!board || !board.has(userId)) return null;

    const sorted = [...board.entries()].sort((a, b) => b[1] - a[1]);
    const index = sorted.findIndex(([u]) => u === userId);
    if (index === -1) return null;

    return {
      userId,
      rank: index + 1,
      score: sorted[index][1],
    };
  }

  async clearBoard(mode: string, season: string): Promise<void> {
    const key = this.keyFor(mode, season);
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        this.logger.warn(`Redis del failed: ${String(err)}`);
      }
    }
    this.inMemoryScores.delete(key);
  }
}
