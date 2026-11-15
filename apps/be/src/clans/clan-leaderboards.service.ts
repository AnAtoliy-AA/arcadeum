import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Clan, ClanDocument } from './schemas/clan.schema';
import { ClanMember, ClanMemberDocument } from './schemas/clan-member.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import type { ClanLeaderboardSortField } from './dto/clan-leaderboard-query.dto';

export interface ClanLeaderboardEntryView {
  rank: number;
  id: string;
  name: string;
  tag: string;
  description: string;
  avatarUrl: string | null;
  memberCount: number;
  totalWins: number;
  totalGames: number;
  winRate: number;
}

export interface ClanLeaderboardResponse {
  entries: ClanLeaderboardEntryView[];
  total: number;
  limit: number;
  offset: number;
}

export interface ClanMvpEntryView {
  rank: number;
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  role: string;
  wins: number;
  gamesPlayed: number;
  winRate: number;
}

interface LeanClanDoc {
  _id: Types.ObjectId;
  name: string;
  tag: string;
  description: string;
  avatarUrl: string | null;
  memberCount: number;
  totalWins: number;
  totalGames: number;
}

interface LeanMemberDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  wins: number;
  gamesPlayed: number;
}

interface LeanUserDoc {
  _id: Types.ObjectId;
  username: string;
  displayName?: string;
  equippedAvatarId?: string | null;
}

@Injectable()
export class ClanLeaderboardsService {
  constructor(
    @InjectModel(Clan.name) private readonly clanModel: Model<ClanDocument>,
    @InjectModel(ClanMember.name)
    private readonly clanMemberModel: Model<ClanMemberDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getClanLeaderboard(
    sortBy: ClanLeaderboardSortField = 'wins',
    limit = 20,
    offset = 0,
  ): Promise<ClanLeaderboardResponse> {
    const total = await this.clanModel.countDocuments({ visibility: 'public' });

    let entries: ClanLeaderboardEntryView[] = [];

    if (sortBy === 'winRate') {
      const allPublicClans = await this.clanModel
        .find({ visibility: 'public' })
        .lean<LeanClanDoc[]>();

      const mapped = allPublicClans.map((clan) => {
        const winRate =
          clan.totalGames > 0
            ? Math.round((clan.totalWins / clan.totalGames) * 100)
            : 0;
        return {
          id: String(clan._id),
          name: clan.name,
          tag: clan.tag,
          description: clan.description,
          avatarUrl: clan.avatarUrl,
          memberCount: clan.memberCount,
          totalWins: clan.totalWins,
          totalGames: clan.totalGames,
          winRate,
        };
      });

      mapped.sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
        return b.memberCount - a.memberCount;
      });

      const paginated = mapped.slice(offset, offset + limit);
      entries = paginated.map((item, index) => ({
        ...item,
        rank: offset + index + 1,
      }));
    } else {
      const sortCriteria =
        sortBy === 'members'
          ? ({ memberCount: -1, totalWins: -1 } as const)
          : ({ totalWins: -1, memberCount: -1 } as const);

      const clans = await this.clanModel
        .find({ visibility: 'public' })
        .sort(sortCriteria)
        .skip(offset)
        .limit(limit)
        .lean<LeanClanDoc[]>();

      entries = clans.map((clan, index) => {
        const winRate =
          clan.totalGames > 0
            ? Math.round((clan.totalWins / clan.totalGames) * 100)
            : 0;
        return {
          rank: offset + index + 1,
          id: String(clan._id),
          name: clan.name,
          tag: clan.tag,
          description: clan.description,
          avatarUrl: clan.avatarUrl,
          memberCount: clan.memberCount,
          totalWins: clan.totalWins,
          totalGames: clan.totalGames,
          winRate,
        };
      });
    }

    return {
      entries,
      total,
      limit,
      offset,
    };
  }

  async getClanMvpMembers(
    clanId: string,
    limit = 10,
  ): Promise<ClanMvpEntryView[]> {
    if (!Types.ObjectId.isValid(clanId)) {
      throw new NotFoundException('clans.clanNotFound');
    }

    const clan = await this.clanModel.findById(new Types.ObjectId(clanId));
    if (!clan) {
      throw new NotFoundException('clans.clanNotFound');
    }

    const members = await this.clanMemberModel
      .find({ clanId: new Types.ObjectId(clanId) })
      .sort({ wins: -1, gamesPlayed: -1 })
      .limit(limit)
      .lean<LeanMemberDoc[]>();

    if (members.length === 0) return [];

    const userIds = members.map((m) => String(m.userId));
    const users = (await this.userModel
      .find({ _id: { $in: userIds } })
      .select('username displayName equippedAvatarId')
      .lean()) as unknown as LeanUserDoc[];

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return members.map((m, index) => {
      const user = userMap.get(String(m.userId));
      const winRate =
        m.gamesPlayed > 0 ? Math.round((m.wins / m.gamesPlayed) * 100) : 0;
      return {
        rank: index + 1,
        id: String(m._id),
        userId: String(m.userId),
        username: user?.username ?? '',
        displayName: user?.displayName ?? null,
        equippedAvatarId: user?.equippedAvatarId ?? null,
        role: m.role,
        wins: m.wins,
        gamesPlayed: m.gamesPlayed,
        winRate,
      };
    });
  }
}
