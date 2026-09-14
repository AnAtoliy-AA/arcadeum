import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  WeeklyLeague,
  type WeeklyLeagueDocument,
  type LeagueTier,
  LEAGUE_TIERS,
} from './schemas/weekly-league.schema';

const GROUP_SIZE = 30;
const PROMOTE_COUNT = 5;
const DEMOTE_COUNT = 5;

/**
 * Generate a week key from a Date in ISO format (e.g. "2026-W37").
 */
export function weekKeyForDate(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - ((d.getUTCDay() + 6) % 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Numeric index for the week (YYYYWW) — enables range queries.
 */
export function weekIndexForDate(date: Date): number {
  const key = weekKeyForDate(date);
  const [year, week] = key.split('-W');
  return Number(year) * 100 + Number(week);
}

export interface LeagueStanding {
  rank: number;
  userId: string;
  username: string;
  trophies: number;
  prevRank: number;
  isCurrentUser: boolean;
}

export interface LeagueSnapshot {
  tier: LeagueTier;
  weekKey: string;
  participants: LeagueStanding[];
  promoteCount: number;
  demoteCount: number;
  nextResetAt: string;
}

@Injectable()
export class WeeklyLeagueService {
  private readonly logger = new Logger(WeeklyLeagueService.name);

  constructor(
    @InjectModel(WeeklyLeague.name)
    private readonly model: Model<WeeklyLeagueDocument>,
  ) {}

  /**
   * Get or create the league for a given tier and week.
   */
  async getOrCreateLeague(
    tier: LeagueTier,
    weekKey: string,
    weekIndex: number,
  ): Promise<WeeklyLeagueDocument> {
    let league = await this.model.findOne({ tier, weekKey }).exec();
    if (!league) {
      league = await this.model.create({
        tier,
        weekKey,
        weekIndex,
        participants: [],
        promoteCount: PROMOTE_COUNT,
        demoteCount: DEMOTE_COUNT,
      });
    }
    return league;
  }

  /**
   * Get the current league snapshot for a user.
   */
  async getUserLeague(
    userId: string,
    now = new Date(),
  ): Promise<LeagueSnapshot | null> {
    const weekKey = weekKeyForDate(now);
    const weekIdx = weekIndexForDate(now);

    // Find the league this user belongs to
    const league = await this.model
      .findOne({
        weekKey,
        'participants.userId': new Types.ObjectId(userId),
      })
      .lean<WeeklyLeagueDocument | null>()
      .exec();

    if (!league) {
      // User not in any league this week — try to assign one
      return this.assignUserToLeague(userId, weekKey, weekIdx, now);
    }

    return this.buildSnapshot(league, userId);
  }

  /**
   * Record a trophy gain for a user. Creates or updates their league entry.
   */
  async recordTrophies(
    userId: string,
    username: string,
    trophies: number,
    now = new Date(),
  ): Promise<void> {
    const weekKey = weekKeyForDate(now);
    const weekIdx = weekIndexForDate(now);

    // Find or create league for the user's current tier
    const userLeague = await this.model
      .findOne({
        weekKey,
        'participants.userId': new Types.ObjectId(userId),
      })
      .exec();

    if (userLeague) {
      // Update existing participant
      await this.model
        .updateOne(
          {
            _id: userLeague._id,
            'participants.userId': new Types.ObjectId(userId),
          },
          {
            $inc: { 'participants.$.trophies': trophies },
          },
        )
        .exec();
    } else {
      // Assign to the appropriate tier (default to bronze for new users)
      const league = await this.getOrCreateLeague('bronze', weekKey, weekIdx);
      await this.model
        .updateOne(
          { _id: league._id },
          {
            $push: {
              participants: {
                userId: new Types.ObjectId(userId),
                username,
                trophies,
                rank: 0,
                prevRank: 0,
              },
            },
          },
        )
        .exec();
    }
  }

  /**
   * Weekly rollover: finalize all leagues, compute promotions/demotions,
   * and create new leagues for the next week.
   */
  async rolloverWeek(now = new Date()): Promise<{
    leaguesProcessed: number;
    playersPromoted: number;
    playersDemoted: number;
  }> {
    const currentWeekKey = weekKeyForDate(now);
    const nextDate = new Date(now);
    nextDate.setUTCDate(nextDate.getUTCDate() + 7);
    const nextWeekKey = weekKeyForDate(nextDate);
    const nextWeekIdx = weekIndexForDate(nextDate);

    const leagues = await this.model
      .find({ weekKey: currentWeekKey, finalized: false })
      .exec();

    let playersPromoted = 0;
    let playersDemoted = 0;

    for (const league of leagues) {
      // Sort participants by trophies descending
      league.participants.sort((a, b) => b.trophies - a.trophies);

      // Assign ranks
      league.participants.forEach((p, i) => {
        p.prevRank = p.rank;
        p.rank = i + 1;
      });

      // Mark as finalized
      league.finalized = true;
      await league.save();

      // Determine promotions and demotions
      const promoteTier = getHigherTier(league.tier);
      const demoteTier = getLowerTier(league.tier);

      const toPromote = league.participants.slice(0, PROMOTE_COUNT);
      const toDemote = league.participants.slice(-DEMOTE_COUNT);

      // Move promoted players up
      if (promoteTier) {
        const nextLeague = await this.getOrCreateLeague(
          promoteTier,
          nextWeekKey,
          nextWeekIdx,
        );
        for (const p of toPromote) {
          nextLeague.participants.push({
            userId: p.userId,
            username: p.username,
            trophies: 0,
            rank: 0,
            prevRank: 0,
          });
          playersPromoted++;
        }
        await nextLeague.save();
      }

      // Move demoted players down
      if (demoteTier) {
        const nextLeague = await this.getOrCreateLeague(
          demoteTier,
          nextWeekKey,
          nextWeekIdx,
        );
        for (const p of toDemote) {
          nextLeague.participants.push({
            userId: p.userId,
            username: p.username,
            trophies: 0,
            rank: 0,
            prevRank: 0,
          });
          playersDemoted++;
        }
        await nextLeague.save();
      }

      // Players who stay (not promoted or demoted) go to the same tier next week
      const stayTier = league.tier;
      const stayLeague = await this.getOrCreateLeague(
        stayTier,
        nextWeekKey,
        nextWeekIdx,
      );
      const promoteIds = new Set(toPromote.map((p) => p.userId.toString()));
      const demoteIds = new Set(toDemote.map((p) => p.userId.toString()));
      const toStay = league.participants.filter(
        (p) =>
          !promoteIds.has(p.userId.toString()) &&
          !demoteIds.has(p.userId.toString()),
      );
      for (const p of toStay) {
        stayLeague.participants.push({
          userId: p.userId,
          username: p.username,
          trophies: 0,
          rank: 0,
          prevRank: 0,
        });
      }
      await stayLeague.save();
    }

    this.logger.log(
      `Weekly league rollover: ${leagues.length} leagues, ${playersPromoted} promoted, ${playersDemoted} demoted`,
    );

    return {
      leaguesProcessed: leagues.length,
      playersPromoted,
      playersDemoted,
    };
  }

  /**
   * Get all leagues for a given week (for admin/debug).
   */
  async getWeekLeagues(
    weekKey: string,
  ): Promise<Array<{ tier: LeagueTier; participantCount: number }>> {
    const leagues = await this.model.find({ weekKey }).lean().exec();
    return leagues.map((l) => ({
      tier: l.tier,
      participantCount: l.participants.length,
    }));
  }

  private async assignUserToLeague(
    userId: string,
    weekKey: string,
    weekIndex: number,
    _now: Date,
  ): Promise<LeagueSnapshot | null> {
    // Find the smallest league in bronze that has room
    const league = await this.model
      .findOne({
        weekKey,
        tier: 'bronze',
        $expr: { $lt: [{ $size: '$participants' }, GROUP_SIZE] },
      })
      .exec();

    if (league) {
      await this.model
        .updateOne(
          { _id: league._id },
          {
            $push: {
              participants: {
                userId: new Types.ObjectId(userId),
                username: '',
                trophies: 0,
                rank: 0,
                prevRank: 0,
              },
            },
          },
        )
        .exec();

      const updated = await this.model.findById(league._id).lean().exec();
      if (updated) return this.buildSnapshot(updated, userId);
    }

    // Create a new bronze league
    const newLeague = await this.getOrCreateLeague(
      'bronze',
      weekKey,
      weekIndex,
    );
    await this.model
      .updateOne(
        { _id: newLeague._id },
        {
          $push: {
            participants: {
              userId: new Types.ObjectId(userId),
              username: '',
              trophies: 0,
              rank: 0,
              prevRank: 0,
            },
          },
        },
      )
      .exec();

    const updated = await this.model.findById(newLeague._id).lean().exec();
    if (updated) return this.buildSnapshot(updated, userId);
    return null;
  }

  private buildSnapshot(
    league: {
      tier: LeagueTier;
      weekKey: string;
      participants: Array<{
        userId: Types.ObjectId;
        username: string;
        trophies: number;
        rank: number;
        prevRank: number;
      }>;
      promoteCount: number;
      demoteCount: number;
    },
    currentUserId: string,
  ): LeagueSnapshot {
    // Sort by trophies descending, assign ranks
    const sorted = [...league.participants].sort(
      (a, b) => b.trophies - a.trophies,
    );
    const participants: LeagueStanding[] = sorted.map((p, i) => ({
      rank: i + 1,
      userId: p.userId.toHexString(),
      username: p.username,
      trophies: p.trophies,
      prevRank: p.prevRank,
      isCurrentUser: p.userId.toHexString() === currentUserId,
    }));

    // Next Sunday midnight UTC
    const [year, week] = league.weekKey.split('-W');
    const nextSunday = new Date(
      Date.UTC(Number(year), 0, 1 + (Number(week) - 1) * 7 + (7 - 1)),
    );

    return {
      tier: league.tier,
      weekKey: league.weekKey,
      participants,
      promoteCount: league.promoteCount,
      demoteCount: league.demoteCount,
      nextResetAt: nextSunday.toISOString(),
    };
  }
}

function getHigherTier(current: LeagueTier): LeagueTier | null {
  const idx = LEAGUE_TIERS.indexOf(current);
  if (idx >= LEAGUE_TIERS.length - 1) return null;
  return LEAGUE_TIERS[idx + 1];
}

function getLowerTier(current: LeagueTier): LeagueTier | null {
  const idx = LEAGUE_TIERS.indexOf(current);
  if (idx <= 0) return null;
  return LEAGUE_TIERS[idx - 1];
}
