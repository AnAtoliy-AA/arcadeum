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
import { ClanWar, ClanWarDocument } from './schemas/clan-war.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { ClansGateway } from './clans.gateway';
import { ClanWarsService } from './clan-wars.service';
import {
  ClanWarView,
  determineExpiredWarWinner,
  LeanClanWarDoc,
  mapToClanWarView,
} from './clan-wars.helpers';

@Injectable()
export class ClanWarsAutomationService {
  constructor(
    @InjectModel(ClanWar.name)
    private readonly clanWarModel: Model<ClanWarDocument>,
    @InjectModel(Clan.name)
    private readonly clanModel: Model<ClanDocument>,
    @InjectModel(ClanMember.name)
    private readonly clanMemberModel: Model<ClanMemberDocument>,
    private readonly clanWarsService: ClanWarsService,
    @Optional()
    @InjectModel(User.name)
    private readonly userModel?: Model<UserDocument>,
    @Optional()
    private readonly clansGateway?: ClansGateway,
  ) {}

  async resolveMatchForPlayers(
    winnerUserId: string,
    loserUserId: string,
    gameId: string,
  ): Promise<ClanWarView | null> {
    if (
      !Types.ObjectId.isValid(winnerUserId) ||
      !Types.ObjectId.isValid(loserUserId)
    ) {
      return null;
    }
    const winnerObjId = new Types.ObjectId(winnerUserId);
    const loserObjId = new Types.ObjectId(loserUserId);

    const [winnerMembership, loserMembership] = await Promise.all([
      this.clanMemberModel
        .findOne({ userId: winnerObjId })
        .lean<ClanMember | null>(),
      this.clanMemberModel
        .findOne({ userId: loserObjId })
        .lean<ClanMember | null>(),
    ]);

    if (!winnerMembership || !loserMembership) {
      return null;
    }

    const winnerClanId = winnerMembership.clanId;
    const loserClanId = loserMembership.clanId;

    if (winnerClanId.equals(loserClanId)) {
      return null;
    }

    const activeWar = await this.clanWarModel.findOne({
      $or: [
        { initiatorClanId: winnerClanId, targetClanId: loserClanId },
        { initiatorClanId: loserClanId, targetClanId: winnerClanId },
      ],
      status: 'active',
      $and: [
        {
          $or: [{ gameId: 'all' }, { gameId }],
        },
      ],
    });

    if (!activeWar) {
      return null;
    }

    const [winnerUser, loserUser] = await Promise.all([
      this.userModel
        ? this.userModel
            .findById(winnerObjId)
            .lean<{ username: string; displayName?: string } | null>()
        : Promise.resolve(null),
      this.userModel
        ? this.userModel
            .findById(loserObjId)
            .lean<{ username: string; displayName?: string } | null>()
        : Promise.resolve(null),
    ]);

    const winnerName =
      winnerUser?.displayName || winnerUser?.username || 'Player';
    const loserName = loserUser?.displayName || loserUser?.username || 'Player';

    return this.clanWarsService.recordWarMatch(activeWar._id.toString(), {
      winningClanId: winnerClanId.toString(),
      winnerName,
      loserClanId: loserClanId.toString(),
      loserName,
      gameId,
    });
  }

  async expirePendingAndActiveWars(): Promise<{
    expiredActiveCount: number;
    expiredPendingCount: number;
  }> {
    const now = new Date();
    const expiredActiveWars = await this.clanWarModel.find({
      status: 'active',
      expiresAt: { $lte: now },
    });

    for (const war of expiredActiveWars) {
      war.status = 'completed';
      war.winnerClanId = determineExpiredWarWinner(
        war.initiatorScore,
        war.targetClanScore,
        war.initiatorClanId,
        war.targetClanId,
      );
      await war.save();

      const doc = await this.clanWarModel
        .findById(war._id)
        .lean<LeanClanWarDoc>();
      if (doc && this.clansGateway) {
        this.clansGateway.emitClanWarUpdated(
          war.initiatorClanId.toString(),
          war.targetClanId.toString(),
          mapToClanWarView(doc),
        );
      }
    }

    const pendingCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const expiredPendingWars = await this.clanWarModel.find({
      status: 'pending',
      $or: [
        { expiresAt: { $lte: now } },
        { createdAt: { $lte: pendingCutoff } },
      ],
    });

    for (const war of expiredPendingWars) {
      war.status = 'declined';
      await war.save();

      const doc = await this.clanWarModel
        .findById(war._id)
        .lean<LeanClanWarDoc>();
      if (doc && this.clansGateway) {
        this.clansGateway.emitClanWarUpdated(
          war.initiatorClanId.toString(),
          war.targetClanId.toString(),
          mapToClanWarView(doc),
        );
      }
    }

    return {
      expiredActiveCount: expiredActiveWars.length,
      expiredPendingCount: expiredPendingWars.length,
    };
  }

  async matchmakeClanWar(
    userId: string,
    userClanId: string,
    preferredGameId?: string,
  ): Promise<ClanWarView> {
    if (!Types.ObjectId.isValid(userClanId)) {
      throw new BadRequestException('Invalid user clan ID');
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
        'Only clan leaders and officers can request clan war matchmaking',
      );
    }

    const initiatorClan = await this.clanModel
      .findById(userClanObjectId)
      .lean<{ name: string; tag: string } | null>();
    if (!initiatorClan) {
      throw new NotFoundException('Initiator clan not found');
    }

    const existingActiveWar = await this.clanWarModel.findOne({
      $or: [
        { initiatorClanId: userClanObjectId },
        { targetClanId: userClanObjectId },
      ],
      status: { $in: ['active', 'pending'] },
    });

    if (existingActiveWar) {
      throw new BadRequestException(
        'Clan already has an ongoing active or pending war',
      );
    }

    const potentialOpponents = await this.clanModel
      .find({
        _id: { $ne: userClanObjectId },
        memberCount: { $gte: 1 },
      })
      .sort({ totalWins: -1 })
      .limit(20)
      .lean<Array<{ _id: Types.ObjectId; name: string; tag: string }>>();

    if (potentialOpponents.length === 0) {
      throw new NotFoundException(
        'No eligible clans found for war matchmaking',
      );
    }

    const targetClan = potentialOpponents[0];
    const gameId = preferredGameId?.trim() ? preferredGameId : 'all';
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const created = await this.clanWarModel.create({
      initiatorClanId: userClanObjectId,
      initiatorClanName: initiatorClan.name,
      initiatorClanTag: initiatorClan.tag,
      initiatorScore: 0,
      targetClanId: targetClan._id,
      targetClanName: targetClan.name,
      targetClanTag: targetClan.tag,
      targetClanScore: 0,
      targetScore: 5,
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
      this.clansGateway.emitClanWarUpdated(
        userClanId,
        targetClan._id.toString(),
        view,
      );
    }
    return view;
  }

  async getActiveWarForPlayers(
    playerAId: string,
    playerBId: string,
    gameId?: string,
  ): Promise<ClanWarView | null> {
    if (
      !Types.ObjectId.isValid(playerAId) ||
      !Types.ObjectId.isValid(playerBId)
    ) {
      return null;
    }
    const aObj = new Types.ObjectId(playerAId);
    const bObj = new Types.ObjectId(playerBId);

    const [membershipA, membershipB] = await Promise.all([
      this.clanMemberModel.findOne({ userId: aObj }).lean<ClanMember | null>(),
      this.clanMemberModel.findOne({ userId: bObj }).lean<ClanMember | null>(),
    ]);

    if (!membershipA || !membershipB) {
      return null;
    }

    const clanAId = membershipA.clanId;
    const clanBId = membershipB.clanId;

    if (clanAId.equals(clanBId)) {
      return null;
    }

    const filter: Record<string, unknown> = {
      $or: [
        { initiatorClanId: clanAId, targetClanId: clanBId },
        { initiatorClanId: clanBId, targetClanId: clanAId },
      ],
      status: 'active',
    };

    if (gameId && gameId !== 'all') {
      filter.$and = [{ $or: [{ gameId: 'all' }, { gameId }] }];
    }

    const activeWar = await this.clanWarModel
      .findOne(filter)
      .lean<LeanClanWarDoc | null>();

    if (!activeWar) {
      return null;
    }

    return mapToClanWarView(activeWar);
  }
}
