import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Tournament,
  type TournamentDocument,
} from '../../../tournaments/schemas/tournament.schema';
import {
  pairArenaPlayers,
  pairSwissPlayers,
  calculateArenaPoints,
  type PlayerRating,
  type ArenaStanding,
} from './chess-tournament-pairing';
import type { ChessTournamentStanding } from './chess-tournament.types';

interface TournamentLean {
  _id: Types.ObjectId;
  status: string;
  gameType: string;
  format: string;
  arenaDurationMinutes?: number | null;
  swissRoundCount?: number | null;
  chessTimeControl?: string | null;
  registrations: Array<{
    userId: Types.ObjectId;
    displayName?: string | null;
    waitlist: boolean;
  }>;
  arenaStandings?: Array<{
    userId: Types.ObjectId;
    points: number;
    streak: number;
    wins: number;
    draws: number;
    losses: number;
  }>;
  bracket?: {
    format: string;
    rounds: Array<
      Array<{
        round: number;
        matchIndex: number;
        playerA: Types.ObjectId | null;
        playerB: Types.ObjectId | null;
        winnerUserId: Types.ObjectId | null;
      }>
    >;
  } | null;
}

@Injectable()
export class ChessTournamentService {
  private readonly logger = new Logger(ChessTournamentService.name);

  constructor(
    @InjectModel(Tournament.name)
    private readonly model: Model<TournamentDocument>,
  ) {}

  /**
   * Get live arena standings for a tournament, sorted by points desc.
   */
  async getArenaStandings(
    tournamentId: string,
  ): Promise<ChessTournamentStanding[]> {
    const doc = await this.model
      .findById(tournamentId)
      .lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }

    const standings = (doc.arenaStandings ?? [])
      .map((s) => ({
        userId: s.userId.toString(),
        displayName: this.getDisplayName(doc, s.userId.toString()),
        points: s.points,
        streak: s.streak,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
      }))
      .sort((a, b) => b.points - a.points || b.streak - a.streak);

    return standings;
  }

  /**
   * Get Swiss tournament standings with Buchholz tiebreak.
   */
  async getSwissStandings(
    tournamentId: string,
  ): Promise<ChessTournamentStanding[]> {
    const doc = await this.model
      .findById(tournamentId)
      .lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }

    if (!doc.bracket) {
      return [];
    }

    // Calculate standings from bracket results
    const standingMap = new Map<
      string,
      {
        score: number;
        opponents: string[];
        wins: number;
        draws: number;
        losses: number;
      }
    >();

    const allPlayers = doc.registrations
      .filter((r) => !r.waitlist)
      .map((r) => r.userId.toString());

    for (const pid of allPlayers) {
      standingMap.set(pid, {
        score: 0,
        opponents: [],
        wins: 0,
        draws: 0,
        losses: 0,
      });
    }

    for (const round of doc.bracket.rounds) {
      for (const match of round) {
        if (!match.winnerUserId) continue;
        const a = match.playerA?.toString();
        const b = match.playerB?.toString();
        if (!a || !b) continue;

        const winner = match.winnerUserId.toString();
        const loser = winner === a ? b : a;

        const winnerStanding = standingMap.get(winner);
        const loserStanding = standingMap.get(loser);
        if (winnerStanding) {
          winnerStanding.score += 1;
          winnerStanding.opponents.push(loser);
          winnerStanding.wins += 1;
        }
        if (loserStanding) {
          loserStanding.opponents.push(winner);
          loserStanding.losses += 1;
        }
      }
    }

    return Array.from(standingMap.entries())
      .map(([userId, s]) => ({
        userId,
        displayName: this.getDisplayName(doc, userId),
        points: s.score,
        streak: 0,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        tiebreak: s.opponents.length, // simplified Buchholz
      }))
      .sort(
        (a, b) => b.points - a.points || (b.tiebreak ?? 0) - (a.tiebreak ?? 0),
      );
  }

  /**
   * Process a completed chess game and update tournament standings.
   */
  async recordGameResult(params: {
    tournamentId: string;
    whiteUserId: string;
    blackUserId: string;
    result: 'white' | 'black' | 'draw';
  }): Promise<void> {
    const { tournamentId, whiteUserId, blackUserId, result } = params;

    const doc = await this.model.findById(tournamentId);
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (doc.status !== 'live') {
      throw new BadRequestException({
        code: 'TOURNAMENT_NOT_LIVE',
        status: doc.status,
      });
    }

    if (doc.gameType !== 'chess_v1') {
      throw new BadRequestException({ code: 'NOT_CHESS_TOURNAMENT' });
    }

    const format = doc.bracket?.format ?? 'arena';

    if (format === 'arena') {
      await this.recordArenaResult(doc, whiteUserId, blackUserId, result);
    } else if (format === 'swiss') {
      await this.recordSwissResult(doc, whiteUserId, blackUserId, result);
    }
  }

  private async recordArenaResult(
    doc: TournamentDocument,
    whiteUserId: string,
    blackUserId: string,
    result: 'white' | 'black' | 'draw',
  ): Promise<void> {
    const standings = doc.arenaStandings ?? [];
    const updateOps: Array<{
      updateOne: { filter: unknown; update: unknown };
    }> = [];

    const processPlayer = (
      userId: string,
      playerResult: 'win' | 'draw' | 'loss',
    ) => {
      const existing = standings.find((s) => s.userId.toString() === userId);
      const currentStreak = existing?.streak ?? 0;
      const { points, newStreak } = calculateArenaPoints(
        playerResult,
        currentStreak,
      );

      updateOps.push({
        updateOne: {
          filter: {
            _id: doc._id,
            'arenaStandings.userId': new Types.ObjectId(userId),
          },
          update: {
            $inc: {
              'arenaStandings.$.points': points,
              'arenaStandings.$.streak': newStreak - currentStreak,
              ...(playerResult === 'win' && { 'arenaStandings.$.wins': 1 }),
              ...(playerResult === 'draw' && { 'arenaStandings.$.draws': 1 }),
              ...(playerResult === 'loss' && { 'arenaStandings.$.losses': 1 }),
            },
          },
        },
      });
    };

    if (result === 'draw') {
      processPlayer(whiteUserId, 'draw');
      processPlayer(blackUserId, 'draw');
    } else if (result === 'white') {
      processPlayer(whiteUserId, 'win');
      processPlayer(blackUserId, 'loss');
    } else {
      processPlayer(blackUserId, 'win');
      processPlayer(whiteUserId, 'loss');
    }

    // Insert new standings for players not yet tracked
    const insertStandings: Array<{
      userId: Types.ObjectId;
      points: number;
      streak: number;
      wins: number;
      draws: number;
      losses: number;
    }> = [];

    for (const [userId, playerResult] of [
      [
        whiteUserId,
        result === 'white' ? 'win' : result === 'draw' ? 'draw' : 'loss',
      ] as const,
      [
        blackUserId,
        result === 'black' ? 'win' : result === 'draw' ? 'draw' : 'loss',
      ] as const,
    ]) {
      const exists = standings.some((s) => s.userId.toString() === userId);
      if (!exists) {
        const { points, newStreak } = calculateArenaPoints(playerResult, 0);
        insertStandings.push({
          userId: new Types.ObjectId(userId),
          points,
          streak: newStreak,
          wins: playerResult === 'win' ? 1 : 0,
          draws: playerResult === 'draw' ? 1 : 0,
          losses: playerResult === 'loss' ? 1 : 0,
        });
      }
    }

    if (updateOps.length > 0 || insertStandings.length > 0) {
      const update: Record<string, unknown> = {};
      if (updateOps.length > 0) {
        update.$push = { arenaStandings: { $each: insertStandings } };
      }
      if (insertStandings.length > 0 && updateOps.length === 0) {
        update.$push = { arenaStandings: { $each: insertStandings } };
      }
      // Execute as bulkWrite
      if (updateOps.length > 0) {
        await this.model.bulkWrite(
          updateOps.map((op) => ({
            updateOne: op.updateOne as {
              filter: Record<string, unknown>;
              update: Record<string, unknown>;
            },
          })),
        );
      }
      if (insertStandings.length > 0) {
        await this.model.findByIdAndUpdate(doc._id, {
          $push: { arenaStandings: { $each: insertStandings } },
        });
      }
    }

    this.logger.log(
      `Arena tournament ${doc._id.toString()}: recorded result ${whiteUserId} vs ${blackUserId} = ${result}`,
    );
  }

  private async recordSwissResult(
    doc: TournamentDocument,
    whiteUserId: string,
    blackUserId: string,
    result: 'white' | 'black' | 'draw',
  ): Promise<void> {
    if (!doc.bracket) {
      throw new BadRequestException({ code: 'BRACKET_NOT_GENERATED' });
    }

    // Find the current round's match for these players
    for (const round of doc.bracket.rounds) {
      for (const match of round) {
        const a = match.playerA?.toString();
        const b = match.playerB?.toString();
        if (
          (a === whiteUserId && b === blackUserId) ||
          (a === blackUserId && b === whiteUserId)
        ) {
          if (match.winnerUserId) {
            throw new ConflictException({ code: 'RESULT_ALREADY_REPORTED' });
          }

          let winnerUserId: string | null = null;
          if (result === 'white') winnerUserId = whiteUserId;
          else if (result === 'black') winnerUserId = blackUserId;

          match.winnerUserId = winnerUserId
            ? new Types.ObjectId(winnerUserId)
            : null;

          await doc.save();
          this.logger.log(
            `Swiss tournament ${doc._id.toString()}: recorded result round=${match.round} match=${match.matchIndex}`,
          );
          return;
        }
      }
    }

    throw new BadRequestException({ code: 'MATCH_NOT_FOUND' });
  }

  /**
   * Generate arena pairings from available players.
   */
  generateArenaPairings(
    playerIds: string[],
    standings: Map<string, ArenaStanding>,
  ): Array<{ playerA: string; playerB: string }> {
    const playerRatings: PlayerRating[] = playerIds.map((id) => ({
      userId: id,
      rating: standings.get(id)?.points ?? 0,
    }));
    return pairArenaPlayers(playerRatings, standings);
  }

  /**
   * Generate Swiss pairings for the next round.
   */
  generateSwissPairings(
    standings: Array<{
      userId: string;
      score: number;
      opponents: string[];
    }>,
    roundNumber: number,
  ): Array<{ playerA: string; playerB: string }> {
    return pairSwissPlayers(standings, roundNumber);
  }

  private getDisplayName(doc: TournamentLean, userId: string): string | null {
    const reg = doc.registrations.find((r) => r.userId.toString() === userId);
    return reg?.displayName ?? null;
  }
}
