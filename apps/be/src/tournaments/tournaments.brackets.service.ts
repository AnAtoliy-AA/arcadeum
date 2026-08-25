import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Tournament,
  type TournamentDocument,
  type TournamentBracketFormat,
} from './schemas/tournament.schema';
import { canTransition } from './lib/transition';
import {
  generateRoundRobinBracket,
  generateSingleEliminationBracket,
  resolveSingleEliminationAdvance,
  type BracketMatch,
} from './lib/bracket-generator';
import type {
  AdminTournamentItem,
  BracketMatchItem,
  TournamentBracketView,
} from './interfaces/tournament.interface';
import type { GenerateBracketDto } from './dto/generate-bracket.dto';

interface BracketRegistrationLean {
  userId: Types.ObjectId;
  waitlist: boolean;
}

interface BracketMatchLean {
  round: number;
  matchIndex: number;
  playerA: Types.ObjectId | null;
  playerB: Types.ObjectId | null;
  winnerUserId: Types.ObjectId | null;
}

interface BracketLean {
  format: TournamentBracketFormat;
  rounds: BracketMatchLean[][];
}

interface CreatorLean {
  _id: Types.ObjectId;
  displayName?: string | null;
}

interface BracketTournamentLean {
  _id: Types.ObjectId;
  status: Tournament['status'];
  gameType: Tournament['gameType'];
  scheduledAt: Date;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  content: Tournament['content'];
  registrations: BracketRegistrationLean[];
  createdBy: Types.ObjectId | CreatorLean;
  createdAt: Date;
  updatedAt: Date;
  bracket: BracketLean | null;
  winnerUserId: string | null;
}

@Injectable()
export class TournamentsBracketsService {
  constructor(
    @InjectModel(Tournament.name)
    private readonly model: Model<TournamentDocument>,
  ) {}

  async generateBracket(
    id: string,
    dto: GenerateBracketDto,
  ): Promise<AdminTournamentItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model
      .findById(id)
      .lean<BracketTournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (doc.status !== 'registration_open' && doc.status !== 'live') {
      throw new BadRequestException({
        code: 'BRACKET_STATUS_NOT_ALLOWED',
        status: doc.status,
      });
    }
    const playerIds = doc.registrations
      .filter((r) => !r.waitlist)
      .map((r) => r.userId.toString());
    if (playerIds.length < 2) {
      throw new BadRequestException({ code: 'NOT_ENOUGH_PLAYERS' });
    }

    const hasDecidedMatch = (doc.bracket?.rounds ?? [])
      .flat()
      .some((m) => m.winnerUserId !== null);
    if (doc.bracket && hasDecidedMatch) {
      throw new ConflictException({ code: 'BRACKET_LOCKED' });
    }

    const generated =
      dto.format === 'round_robin'
        ? generateRoundRobinBracket(playerIds)
        : generateSingleEliminationBracket(playerIds);

    const updated = await this.model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            bracket: {
              format: generated.format,
              createdAt: new Date(),
              rounds: generated.rounds.map((round) =>
                round.map((m) => ({
                  round: m.round,
                  matchIndex: m.matchIndex,
                  playerA: safeOid(m.playerIds[0]),
                  playerB: safeOid(m.playerIds[1]),
                  winnerUserId: null,
                })),
              ),
            },
          },
        },
        { new: true },
      )
      .lean<BracketTournamentLean | null>();
    if (!updated) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    return this.toAdminItem(updated);
  }

  async reportResult(
    id: string,
    round: number,
    matchIndex: number,
    winnerUserId: string,
  ): Promise<AdminTournamentItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    if (!Types.ObjectId.isValid(winnerUserId)) {
      throw new BadRequestException({ code: 'INVALID_USER_ID' });
    }
    const doc = await this.model
      .findById(id)
      .lean<BracketTournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (doc.status !== 'live') {
      throw new BadRequestException({
        code: 'TOURNAMENT_NOT_LIVE',
        status: doc.status,
      });
    }
    const bracket = doc.bracket;
    if (!bracket) {
      throw new NotFoundException({ code: 'BRACKET_NOT_GENERATED' });
    }
    const roundArr = bracket.rounds[round - 1];
    const match = roundArr?.[matchIndex];
    if (!match) {
      throw new BadRequestException({ code: 'MATCH_NOT_FOUND' });
    }

    const players = [
      match.playerA?.toString() ?? null,
      match.playerB?.toString() ?? null,
    ];
    if (!players.includes(winnerUserId)) {
      throw new BadRequestException({
        code: 'WINNER_NOT_IN_MATCH',
        winnerUserId,
      });
    }
    const currentWinner = match.winnerUserId?.toString() ?? null;
    if (currentWinner === winnerUserId) {
      return this.toAdminItem(doc);
    }
    if (currentWinner !== null) {
      throw new ConflictException({ code: 'RESULT_ALREADY_REPORTED' });
    }

    const winnerOid = new Types.ObjectId(winnerUserId);
    const $set: Record<string, unknown> = {};
    $set[`bracket.rounds.${round - 1}.${matchIndex}.winnerUserId`] = winnerOid;

    if (bracket.format === 'single_elimination') {
      const serialized = serializeRounds(bracket.rounds);
      const placements = resolveSingleEliminationAdvance(
        serialized,
        round,
        matchIndex,
        winnerUserId,
      );
      placements.forEach((p, i) => {
        // Slot position of placement i derives from its source match
        // index: the reported match for i=0, otherwise the previous hop.
        const sourceIndex = i === 0 ? matchIndex : placements[i - 1].matchIndex;
        const slot = sourceIndex % 2 === 0 ? 'playerA' : 'playerB';
        $set[`bracket.rounds.${p.round - 1}.${p.matchIndex}.${slot}`] =
          new Types.ObjectId(p.playerId);
        // Every hop except the last lands in a structural bye match that
        // is decided automatically by the same winner.
        if (i < placements.length - 1) {
          $set[`bracket.rounds.${p.round - 1}.${p.matchIndex}.winnerUserId`] =
            new Types.ObjectId(p.playerId);
        }
      });

      // Tournament completes when the final round is fully decided.
      const lastIdx = bracket.rounds.length - 1;
      const finalRound = bracket.rounds[lastIdx] ?? [];
      const finalDecided =
        finalRound.length > 0 &&
        finalRound.every((m, idx) => {
          if (m.winnerUserId !== null) return true;
          const key = `bracket.rounds.${lastIdx}.${idx}.winnerUserId`;
          return typeof $set[key] !== 'undefined';
        });
      if (finalDecided && canTransition(doc.status, 'completed')) {
        $set.status = 'completed';
        $set.winnerUserId = winnerUserId;
      }
    }

    const updated = await this.model
      .findByIdAndUpdate(id, { $set }, { new: true })
      .lean<BracketTournamentLean | null>();
    if (!updated) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    return this.toAdminItem(updated);
  }

  async getPublicBracket(id: string): Promise<{
    bracket: TournamentBracketView | null;
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    const doc = await this.model
      .findById(id)
      .lean<BracketTournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (!doc.bracket) {
      return { bracket: null };
    }
    const view: TournamentBracketView = {
      tournamentId: id,
      status: doc.status,
      format: doc.bracket.format,
      rounds: doc.bracket.rounds.map((round) =>
        round.map((m): BracketMatchItem => ({
          round: m.round,
          matchIndex: m.matchIndex,
          playerA: m.playerA?.toString() ?? null,
          playerB: m.playerB?.toString() ?? null,
          winnerUserId: m.winnerUserId?.toString() ?? null,
        })),
      ),
    };
    return { bracket: view };
  }

  private toAdminItem(d: BracketTournamentLean): AdminTournamentItem {
    const registeredCount = d.registrations.filter((r) => !r.waitlist).length;
    const waitlistCount = d.registrations.length - registeredCount;
    return {
      id: d._id.toString(),
      status: d.status,
      gameType: d.gameType,
      scheduledAt: d.scheduledAt.toISOString(),
      registrationOpensAt: d.registrationOpensAt?.toISOString() ?? null,
      registrationClosesAt: d.registrationClosesAt?.toISOString() ?? null,
      maxPlayers: d.maxPlayers,
      prizeDescription: d.prizeDescription ?? null,
      resultText: d.resultText ?? null,
      content: d.content,
      registeredCount,
      waitlistCount,
      createdBy: extractCreator(d.createdBy),
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    };
  }
}

function safeOid(value: string | null | undefined): Types.ObjectId | null {
  if (!value || !Types.ObjectId.isValid(value)) return null;
  return new Types.ObjectId(value);
}

function serializeRounds(rounds: BracketMatchLean[][]): BracketMatch[][] {
  return rounds.map((round) =>
    round.map((m) => ({
      round: m.round,
      matchIndex: m.matchIndex,
      playerIds: [
        m.playerA?.toString() ?? null,
        m.playerB?.toString() ?? null,
      ] as [string | null, string | null],
      winnerUserId: m.winnerUserId?.toString() ?? null,
    })),
  );
}

function extractCreator(
  raw: Types.ObjectId | CreatorLean,
): { id: string; displayName: string | null } | null {
  if (raw instanceof Types.ObjectId) {
    return { id: raw.toString(), displayName: null };
  }
  if (raw && typeof raw === 'object' && '_id' in raw) {
    return { id: raw._id.toString(), displayName: raw.displayName ?? null };
  }
  return null;
}
