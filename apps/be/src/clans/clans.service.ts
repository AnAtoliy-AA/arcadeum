import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Clan, ClanDocument, ClanRole } from './schemas/clan.schema';
import { ClanMember, ClanMemberDocument } from './schemas/clan-member.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { ClansGateway } from './clans.gateway';
import { randomBytes } from 'crypto';

const MAX_CLAN_MEMBERS = 50;

export interface ClanView {
  id: string;
  name: string;
  tag: string;
  description: string;
  avatarUrl: string | null;
  leaderId: string;
  memberCount: number;
  visibility: string;
  inviteCode: string | null;
  totalWins: number;
  totalGames: number;
  createdAt: string;
}

export interface ClanMemberView {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  role: string;
  wins: number;
  gamesPlayed: number;
  online: boolean;
  joinedAt: string;
}

interface LeanUser {
  _id: Types.ObjectId;
  username: string;
  displayName?: string;
  equippedAvatarId?: string | null;
}

interface LeanClan {
  _id: Types.ObjectId;
  name: string;
  tag: string;
  description: string;
  avatarUrl: string | null;
  leaderId: Types.ObjectId;
  memberCount: number;
  memberUserIds: Types.ObjectId[];
  visibility: string;
  inviteCode: string | null;
  totalWins: number;
  totalGames: number;
  createdAt: Date;
}

@Injectable()
export class ClansService {
  private readonly logger = new Logger(ClansService.name);

  constructor(
    @InjectModel(Clan.name)
    private readonly clanModel: Model<ClanDocument>,
    @InjectModel(ClanMember.name)
    private readonly clanMemberModel: Model<ClanMemberDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(ClansGateway)
    private readonly gateway: ClansGateway,
  ) {}

  async createClan(
    userId: string,
    data: {
      name: string;
      tag: string;
      description?: string;
      visibility?: string;
    },
  ): Promise<ClanView> {
    const sanitizedName = String(data.name);
    const sanitizedTag = String(data.tag);
    const existingClan = await this.clanModel.findOne({
      $or: [{ name: sanitizedName }, { tag: sanitizedTag }],
    });
    if (existingClan) {
      throw new ConflictException('clans.nameOrTagTaken');
    }

    const userMembership = await this.clanMemberModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (userMembership) {
      throw new BadRequestException('clans.alreadyInClan');
    }

    const clan = await this.clanModel.create({
      name: data.name,
      tag: data.tag,
      description: data.description ?? '',
      leaderId: new Types.ObjectId(userId),
      memberCount: 1,
      memberUserIds: [new Types.ObjectId(userId)],
      visibility: data.visibility ?? 'public',
      inviteCode: randomBytes(8).toString('hex'),
    });

    await this.clanMemberModel.create({
      clanId: clan._id,
      userId: new Types.ObjectId(userId),
      role: 'leader',
    });

    return this.toClanView(clan);
  }

  async joinClan(userId: string, clanId: string): Promise<void> {
    const clan = await this.clanModel.findById(this.toObjectId(clanId));
    if (!clan) throw new NotFoundException('clans.clanNotFound');

    if (clan.memberCount >= MAX_CLAN_MEMBERS) {
      throw new BadRequestException('clans.clanFull');
    }

    const existingMember = await this.clanMemberModel.findOne({
      clanId: clan._id,
      userId: new Types.ObjectId(userId),
    });
    if (existingMember) {
      throw new ConflictException('clans.alreadyMember');
    }

    const userMembership = await this.clanMemberModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (userMembership) {
      throw new BadRequestException('clans.alreadyInClan');
    }

    await this.clanMemberModel.create({
      clanId: clan._id,
      userId: new Types.ObjectId(userId),
      role: 'member',
    });

    clan.memberCount += 1;
    clan.memberUserIds.push(new Types.ObjectId(userId));
    await clan.save();

    const user = (await this.userModel
      .findById(userId, { username: 1, displayName: 1, equippedAvatarId: 1 })
      .lean()) as LeanUser | null;

    this.gateway.emitClanMemberJoined(clanId, {
      userId,
      username: user?.username ?? '',
      displayName: user?.displayName ?? null,
      equippedAvatarId: user?.equippedAvatarId ?? null,
    });
  }

  async leaveClan(userId: string, clanId: string): Promise<void> {
    const clan = await this.clanModel.findById(this.toObjectId(clanId));
    if (!clan) throw new NotFoundException('clans.clanNotFound');

    if (String(clan.leaderId) === userId) {
      throw new BadRequestException('clans.leaderCannotLeave');
    }

    const member = await this.clanMemberModel.findOneAndDelete({
      clanId: clan._id,
      userId: new Types.ObjectId(userId),
    });
    if (!member) throw new NotFoundException('clans.notMember');

    clan.memberCount = Math.max(0, clan.memberCount - 1);
    clan.memberUserIds = clan.memberUserIds.filter(
      (id) => String(id) !== userId,
    );
    await clan.save();

    this.gateway.emitClanMemberLeft(clanId, { userId });
  }

  async removeMember(
    requesterId: string,
    clanId: string,
    targetUserId: string,
  ): Promise<void> {
    const clan = await this.clanModel.findById(this.toObjectId(clanId));
    if (!clan) throw new NotFoundException('clans.clanNotFound');

    const requesterMember = await this.clanMemberModel.findOne({
      clanId: clan._id,
      userId: new Types.ObjectId(requesterId),
    });
    if (
      !requesterMember ||
      (requesterMember.role !== 'leader' && requesterMember.role !== 'officer')
    ) {
      throw new ForbiddenException('clans.notAuthorized');
    }

    if (String(clan.leaderId) === targetUserId) {
      throw new BadRequestException('clans.cannotRemoveLeader');
    }

    const targetMember = await this.clanMemberModel.findOneAndDelete({
      clanId: clan._id,
      userId: new Types.ObjectId(targetUserId),
    });
    if (!targetMember) throw new NotFoundException('clans.notMember');

    clan.memberCount = Math.max(0, clan.memberCount - 1);
    clan.memberUserIds = clan.memberUserIds.filter(
      (id) => String(id) !== targetUserId,
    );
    await clan.save();

    this.gateway.emitClanMemberRemoved(clanId, { userId: targetUserId });
  }

  async updateClan(
    userId: string,
    clanId: string,
    data: {
      name?: string;
      tag?: string;
      description?: string;
      avatarUrl?: string;
      visibility?: string;
    },
  ): Promise<ClanView> {
    const clan = await this.clanModel.findById(this.toObjectId(clanId));
    if (!clan) throw new NotFoundException('clans.clanNotFound');

    if (String(clan.leaderId) !== userId) {
      throw new ForbiddenException('clans.notLeader');
    }

    if (data.name && data.name !== clan.name) {
      const sanitizedName = String(data.name);
      const existing = await this.clanModel.findOne({ name: sanitizedName });
      if (existing) throw new ConflictException('clans.nameTaken');
      clan.name = sanitizedName;
    }

    if (data.tag && data.tag !== clan.tag) {
      const sanitizedTag = String(data.tag);
      const existing = await this.clanModel.findOne({ tag: sanitizedTag });
      if (existing) throw new ConflictException('clans.tagTaken');
      clan.tag = sanitizedTag;
    }

    if (data.description !== undefined) clan.description = data.description;
    if (data.avatarUrl !== undefined) clan.avatarUrl = data.avatarUrl;
    if (data.visibility !== undefined)
      clan.visibility = data.visibility as 'public' | 'private';

    await clan.save();
    return this.toClanView(clan);
  }

  async setMemberRole(
    requesterId: string,
    clanId: string,
    targetUserId: string,
    role: ClanRole,
  ): Promise<void> {
    const clan = await this.clanModel.findById(this.toObjectId(clanId));
    if (!clan) throw new NotFoundException('clans.clanNotFound');

    if (String(clan.leaderId) !== requesterId) {
      throw new ForbiddenException('clans.notLeader');
    }

    if (targetUserId === requesterId) {
      throw new BadRequestException('clans.cannotChangeOwnRole');
    }

    const member = await this.clanMemberModel.findOne({
      clanId: clan._id,
      userId: new Types.ObjectId(targetUserId),
    });
    if (!member) throw new NotFoundException('clans.notMember');

    member.role = role;
    await member.save();
  }

  async getClanById(clanId: string): Promise<ClanView | null> {
    const clan = await this.clanModel
      .findById(this.toObjectId(clanId))
      .lean<LeanClan>();
    if (!clan) return null;
    return this.toClanView(clan);
  }

  async getClanByInviteCode(inviteCode: string): Promise<ClanView | null> {
    const sanitized = String(inviteCode);
    const clan = await this.clanModel
      .findOne({ inviteCode: sanitized })
      .lean<LeanClan>();
    if (!clan) return null;
    return this.toClanView(clan);
  }

  async getUserClan(userId: string): Promise<ClanView | null> {
    const member = await this.clanMemberModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .select('clanId')
      .lean();
    if (!member) return null;
    return this.getClanById(String(member.clanId));
  }

  async getClanMembers(clanId: string): Promise<ClanMemberView[]> {
    const members = await this.clanMemberModel
      .find({ clanId: new Types.ObjectId(clanId) })
      .sort({ role: 1, wins: -1 })
      .lean<
        {
          _id: Types.ObjectId;
          userId: Types.ObjectId;
          role: string;
          wins: number;
          gamesPlayed: number;
          createdAt?: Date;
        }[]
      >();

    if (members.length === 0) return [];

    const userIds = members.map((m) => String(m.userId));
    const users = (await this.userModel
      .find({ _id: { $in: userIds } })
      .select('username displayName equippedAvatarId')
      .lean()) as unknown as LeanUser[];

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return members.map((m) => {
      const user = userMap.get(String(m.userId));
      return {
        id: String(m._id),
        userId: String(m.userId),
        username: user?.username ?? '',
        displayName: user?.displayName ?? null,
        equippedAvatarId: user?.equippedAvatarId ?? null,
        role: m.role,
        wins: m.wins,
        gamesPlayed: m.gamesPlayed,
        online: this.gateway.isUserOnline(String(m.userId)),
        joinedAt: m.createdAt?.toISOString() ?? '',
      };
    });
  }

  async searchClans(query: string, limit = 20): Promise<ClanView[]> {
    const filter = query
      ? { $text: { $search: query } }
      : { visibility: 'public' };

    const clans = await this.clanModel
      .find(filter)
      .sort({ memberCount: -1 })
      .limit(limit)
      .lean<LeanClan[]>();

    return clans.map((c) => this.toClanView(c));
  }

  async getPopularClans(limit = 20): Promise<ClanView[]> {
    const clans = await this.clanModel
      .find({ visibility: 'public' })
      .sort({ memberCount: -1 })
      .limit(limit)
      .lean<LeanClan[]>();

    return clans.map((c) => this.toClanView(c));
  }

  async regenerateInviteCode(userId: string, clanId: string): Promise<string> {
    const clan = await this.clanModel.findById(this.toObjectId(clanId));
    if (!clan) throw new NotFoundException('clans.clanNotFound');

    if (String(clan.leaderId) !== userId) {
      throw new ForbiddenException('clans.notLeader');
    }

    clan.inviteCode = randomBytes(8).toString('hex');
    await clan.save();
    return clan.inviteCode;
  }

  async recordGameResult(
    clanId: string,
    winnerIds: string[],
    loserIds: string[],
  ): Promise<void> {
    const clan = await this.clanModel.findById(this.toObjectId(clanId));
    if (!clan) return;

    clan.totalGames += 1;
    for (const id of winnerIds) {
      if (clan.memberUserIds.some((uid) => String(uid) === id)) {
        clan.totalWins += 1;
      }
    }
    await clan.save();

    const ops = [...winnerIds, ...loserIds].map((id) => ({
      updateOne: {
        filter: { clanId: clan._id, userId: new Types.ObjectId(id) },
        update: {
          $inc: {
            gamesPlayed: 1,
            ...(winnerIds.includes(id) ? { wins: 1 } : {}),
          },
        },
      },
    }));
    if (ops.length > 0) {
      await this.clanMemberModel.bulkWrite(ops);
    }
  }

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  private toClanView(clan: LeanClan | ClanDocument): ClanView {
    return {
      id: String(clan._id),
      name: clan.name,
      tag: clan.tag,
      description: clan.description,
      avatarUrl: clan.avatarUrl,
      leaderId: String(clan.leaderId),
      memberCount: clan.memberCount,
      visibility: clan.visibility,
      inviteCode: clan.inviteCode,
      totalWins: clan.totalWins,
      totalGames: clan.totalGames,
      createdAt:
        'createdAt' in clan && clan.createdAt
          ? new Date(clan.createdAt).toISOString()
          : '',
    };
  }
}
