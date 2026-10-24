import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Clan, ClanDocument } from './schemas/clan.schema';
import { ClanMember, ClanMemberDocument } from './schemas/clan-member.schema';
import {
  ClanWar,
  ClanWarDocument,
  ClanWarLogEntry,
} from './schemas/clan-war.schema';
import { ClansGateway } from './clans.gateway';
import { CreateClanWarDto } from './dto/create-clan-war.dto';
import { RecordClanWarMatchDto } from './dto/record-clan-war-match.dto';
import {
  ClanWarView,
  DEFAULT_SEEDED_WARS,
  LeanClanWarDoc,
  mapToClanWarView,
} from './clan-wars.helpers';

export type { ClanWarView } from './clan-wars.helpers';

@Injectable()
export class ClanWarsService {
  constructor(
    @InjectModel(ClanWar.name)
    private readonly clanWarModel: Model<ClanWarDocument>,
    @InjectModel(Clan.name)
    private readonly clanModel: Model<ClanDocument>,
    @InjectModel(ClanMember.name)
    private readonly clanMemberModel: Model<ClanMemberDocument>,
    @Optional()
    private readonly clansGateway?: ClansGateway,
  ) {}

  private async seedDefaultWarsIfEmpty(): Promise<void> {
    const count = await this.clanWarModel.countDocuments();
    if (count > 0) return;

    for (const seed of DEFAULT_SEEDED_WARS) {
      const initId = new Types.ObjectId();
      const targetId = new Types.ObjectId();

      await this.clanWarModel.create({
        initiatorClanId: initId,
        initiatorClanName: seed.initiatorClanName,
        initiatorClanTag: seed.initiatorClanTag,
        initiatorScore: seed.initiatorScore,
        targetClanId: targetId,
        targetClanName: seed.targetClanName,
        targetClanTag: seed.targetClanTag,
        targetClanScore: seed.targetClanScore,
        targetScore: seed.targetScore,
        gameId: seed.gameId,
        status: seed.status,
        winnerClanId: null,
        expiresAt: seed.expiresAt,
        matchLogs: seed.matchLogs,
      });
    }
  }

  async getActiveWars(clanId?: string): Promise<ClanWarView[]> {
    await this.seedDefaultWarsIfEmpty();

    const query: Record<string, unknown> = {
      status: { $in: ['active', 'pending'] },
    };

    if (clanId && Types.ObjectId.isValid(clanId)) {
      const cId = new Types.ObjectId(clanId);
      query.$or = [{ initiatorClanId: cId }, { targetClanId: cId }];
    }

    const docs = await this.clanWarModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean<LeanClanWarDoc[]>();

    return docs.map((doc) => mapToClanWarView(doc));
  }

  async getWarById(warId: string): Promise<ClanWarView> {
    if (!Types.ObjectId.isValid(warId)) {
      throw new BadRequestException('Invalid war ID');
    }

    const doc = await this.clanWarModel
      .findById(warId)
      .lean<LeanClanWarDoc | null>();
    if (!doc) {
      throw new NotFoundException('Clan war not found');
    }

    return mapToClanWarView(doc);
  }

  async createWarChallenge(
    userId: string,
    userClanId: string,
    dto: CreateClanWarDto,
  ): Promise<ClanWarView> {
    if (!Types.ObjectId.isValid(userClanId)) {
      throw new BadRequestException('Invalid user clan ID');
    }
    if (!Types.ObjectId.isValid(dto.targetClanId)) {
      throw new BadRequestException('Invalid target clan ID');
    }
    if (userClanId === dto.targetClanId) {
      throw new BadRequestException('Cannot declare war against your own clan');
    }

    const userObjectId = new Types.ObjectId(userId);
    const userClanObjectId = new Types.ObjectId(userClanId);
    const targetClanObjectId = new Types.ObjectId(dto.targetClanId);

    const membership = await this.clanMemberModel
      .findOne({ clanId: userClanObjectId, userId: userObjectId })
      .lean<{ role: string } | null>();

    if (
      !membership ||
      (membership.role !== 'leader' && membership.role !== 'officer')
    ) {
      throw new ForbiddenException(
        'Only clan leaders and officers can declare clan war',
      );
    }

    const [initiatorClan, targetClan] = await Promise.all([
      this.clanModel
        .findById(userClanObjectId)
        .lean<{ name: string; tag: string } | null>(),
      this.clanModel
        .findById(targetClanObjectId)
        .lean<{ name: string; tag: string } | null>(),
    ]);

    if (!initiatorClan) {
      throw new NotFoundException('Initiator clan not found');
    }
    if (!targetClan) {
      throw new NotFoundException('Target clan not found');
    }

    const existingActiveWar = await this.clanWarModel.findOne({
      $or: [
        { initiatorClanId: userClanObjectId, targetClanId: targetClanObjectId },
        { initiatorClanId: targetClanObjectId, targetClanId: userClanObjectId },
      ],
      status: { $in: ['active', 'pending'] },
    });

    if (existingActiveWar) {
      throw new BadRequestException(
        'An active or pending war already exists between these clans',
      );
    }

    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const targetScore = dto.targetScore ?? 5;
    const gameId = dto.gameId?.trim() ? dto.gameId : 'all';

    const created = await this.clanWarModel.create({
      initiatorClanId: userClanObjectId,
      initiatorClanName: initiatorClan.name,
      initiatorClanTag: initiatorClan.tag,
      initiatorScore: 0,
      targetClanId: targetClanObjectId,
      targetClanName: targetClan.name,
      targetClanTag: targetClan.tag,
      targetClanScore: 0,
      targetScore,
      gameId,
      status: 'active',
      winnerClanId: null,
      expiresAt,
      matchLogs: [],
    });

    const doc = await this.clanWarModel
      .findById(created._id)
      .lean<LeanClanWarDoc>();

    const view = mapToClanWarView(doc!);
    if (this.clansGateway) {
      this.clansGateway.emitClanWarUpdated(userClanId, dto.targetClanId, view);
    }
    return view;
  }

  async respondToWarChallenge(
    userId: string,
    userClanId: string,
    warId: string,
    accept: boolean,
  ): Promise<ClanWarView> {
    if (!Types.ObjectId.isValid(warId)) {
      throw new BadRequestException('Invalid war ID');
    }

    const userObjectId = new Types.ObjectId(userId);
    const userClanObjectId = new Types.ObjectId(userClanId);

    const membership = await this.clanMemberModel
      .findOne({ clanId: userClanObjectId, userId: userObjectId })
      .lean<{ role: string } | null>();

    if (
      !membership ||
      (membership.role !== 'leader' && membership.role !== 'officer')
    ) {
      throw new ForbiddenException(
        'Only clan leaders and officers can respond to war challenges',
      );
    }

    const war = await this.clanWarModel.findById(warId);
    if (!war) {
      throw new NotFoundException('Clan war not found');
    }

    if (!war.targetClanId.equals(userClanObjectId)) {
      throw new ForbiddenException('Only the challenged clan can respond');
    }

    if (war.status !== 'pending') {
      throw new BadRequestException('This war is not in pending status');
    }

    war.status = accept ? 'active' : 'declined';
    await war.save();

    const doc = await this.clanWarModel
      .findById(war._id)
      .lean<LeanClanWarDoc>();

    const view = mapToClanWarView(doc!);
    if (this.clansGateway) {
      this.clansGateway.emitClanWarUpdated(
        war.initiatorClanId.toString(),
        war.targetClanId.toString(),
        view,
      );
    }
    return view;
  }

  async recordWarMatch(
    warId: string,
    dto: RecordClanWarMatchDto,
  ): Promise<ClanWarView> {
    if (!Types.ObjectId.isValid(warId)) {
      throw new BadRequestException('Invalid war ID');
    }

    const war = await this.clanWarModel.findById(warId);
    if (!war) {
      throw new NotFoundException('Clan war not found');
    }

    if (war.status !== 'active') {
      throw new BadRequestException(
        'Match results can only be reported for active wars',
      );
    }

    const isWinnerInitiator =
      war.initiatorClanId.toString() === dto.winningClanId;
    const isWinnerTarget = war.targetClanId.toString() === dto.winningClanId;

    if (!isWinnerInitiator && !isWinnerTarget) {
      throw new BadRequestException(
        'Winning clan is not a participant in this war',
      );
    }

    if (isWinnerInitiator) {
      war.initiatorScore += 1;
    } else {
      war.targetClanScore += 1;
    }

    const newLog: ClanWarLogEntry = {
      id: new Types.ObjectId().toString(),
      playerClanId: dto.winningClanId,
      playerName: dto.winnerName,
      opponentClanId: dto.loserClanId,
      opponentName: dto.loserName,
      gameId: dto.gameId ?? war.gameId,
      winnerClanId: dto.winningClanId,
      timestamp: new Date().toISOString(),
    };

    war.matchLogs = [newLog, ...(war.matchLogs ?? [])];

    if (war.initiatorScore >= war.targetScore) {
      war.status = 'completed';
      war.winnerClanId = war.initiatorClanId;
    } else if (war.targetClanScore >= war.targetScore) {
      war.status = 'completed';
      war.winnerClanId = war.targetClanId;
    }

    await war.save();

    const doc = await this.clanWarModel
      .findById(war._id)
      .lean<LeanClanWarDoc>();

    const view = mapToClanWarView(doc!);
    if (this.clansGateway) {
      this.clansGateway.emitClanWarUpdated(
        war.initiatorClanId.toString(),
        war.targetClanId.toString(),
        view,
      );
    }
    return view;
  }

  async getClanWarHistory(clanId: string): Promise<ClanWarView[]> {
    if (!Types.ObjectId.isValid(clanId)) {
      throw new BadRequestException('Invalid clan ID');
    }

    const cId = new Types.ObjectId(clanId);
    const docs = await this.clanWarModel
      .find({
        $or: [{ initiatorClanId: cId }, { targetClanId: cId }],
        status: 'completed',
      })
      .sort({ updatedAt: -1 })
      .limit(15)
      .lean<LeanClanWarDoc[]>();

    return docs.map((doc) => mapToClanWarView(doc));
  }
}
