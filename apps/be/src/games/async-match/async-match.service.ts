import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { AsyncMatch, AsyncMatchDocument } from './schemas/async-match.schema';
import { CreateAsyncMatchDto } from './dto/create-async-match.dto';
import { SubmitAsyncMoveDto } from './dto/submit-async-move.dto';

@Injectable()
export class AsyncMatchService {
  constructor(
    @InjectModel(AsyncMatch.name)
    private readonly matchModel: Model<AsyncMatchDocument>,
  ) {}

  async createMatch(
    userId: string,
    dto: CreateAsyncMatchDto,
  ): Promise<AsyncMatch> {
    if (userId === dto.opponentId) {
      throw new BadRequestException(
        'Cannot start an async match with yourself',
      );
    }

    const turnHours = dto.turnDurationHours ?? 24;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + turnHours * 60 * 60 * 1000);

    const created = await this.matchModel.create({
      matchId: randomUUID(),
      gameType: dto.gameType,
      playerA: userId,
      playerB: dto.opponentId,
      currentTurnPlayerId: userId,
      status: 'active',
      stateSnapshot: {},
      movesHistory: [],
      turnDurationHours: turnHours,
      lastTurnAt: now,
      turnExpiresAt: expiresAt,
      winnerId: undefined,
    });

    return created.toObject();
  }

  async getMatchById(userId: string, matchId: string): Promise<AsyncMatch> {
    const match = await this.matchModel.findOne({ matchId }).lean<AsyncMatch>();
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.playerA !== userId && match.playerB !== userId) {
      throw new ForbiddenException('Not a participant in this match');
    }

    return match;
  }

  async getUserMatches(
    userId: string,
    status?: 'active' | 'completed' | 'forfeited',
  ): Promise<AsyncMatch[]> {
    const query: Record<string, unknown> = {
      $or: [{ playerA: userId }, { playerB: userId }],
    };

    if (status) {
      query.status = status;
    }

    return this.matchModel
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean<AsyncMatch[]>();
  }

  async submitMove(
    userId: string,
    matchId: string,
    dto: SubmitAsyncMoveDto,
  ): Promise<AsyncMatch> {
    const match = await this.matchModel.findOne({ matchId });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status !== 'active') {
      throw new BadRequestException('Match is already finished');
    }

    if (match.currentTurnPlayerId !== userId) {
      throw new ForbiddenException('Not your turn');
    }

    const now = new Date();
    if (now > match.turnExpiresAt) {
      const winner = match.playerA === userId ? match.playerB : match.playerA;
      match.status = 'forfeited';
      match.winnerId = winner;
      await match.save();
      throw new BadRequestException('Turn timer expired, match forfeited');
    }

    const nextPlayer = match.playerA === userId ? match.playerB : match.playerA;
    const nextExpiresAt = new Date(
      now.getTime() + match.turnDurationHours * 60 * 60 * 1000,
    );

    match.stateSnapshot = dto.newStateSnapshot;
    match.movesHistory.push({
      playerId: userId,
      move: dto.move,
      timestamp: now.toISOString(),
    });
    match.lastTurnAt = now;
    match.turnExpiresAt = nextExpiresAt;

    if (dto.isGameEnd) {
      match.status = 'completed';
      match.winnerId = dto.winnerId ?? userId;
    } else {
      match.currentTurnPlayerId = nextPlayer;
    }

    await match.save();
    return match.toObject();
  }

  async forfeitMatch(userId: string, matchId: string): Promise<AsyncMatch> {
    const match = await this.matchModel.findOne({ matchId });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status !== 'active') {
      throw new BadRequestException('Match is already finished');
    }

    if (match.playerA !== userId && match.playerB !== userId) {
      throw new ForbiddenException('Not a participant in this match');
    }

    const winner = match.playerA === userId ? match.playerB : match.playerA;
    match.status = 'forfeited';
    match.winnerId = winner;
    await match.save();

    return match.toObject();
  }

  async sweepExpiredMatches(): Promise<number> {
    const now = new Date();
    const expiredMatches = await this.matchModel.find({
      status: 'active',
      turnExpiresAt: { $lt: now },
    });

    let count = 0;
    for (const match of expiredMatches) {
      const winner =
        match.currentTurnPlayerId === match.playerA
          ? match.playerB
          : match.playerA;
      match.status = 'forfeited';
      match.winnerId = winner;
      await match.save();
      count++;
    }

    return count;
  }
}
