import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friendship, FriendshipDocument } from './schemas/friendship.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { FriendsGateway } from './friends.gateway';

export interface FriendView {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  online: boolean;
}

export interface FriendRequestView {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  createdAt: string;
}

interface LeanUser {
  _id: Types.ObjectId;
  username: string;
  displayName?: string;
  equippedAvatarId?: string | null;
  blockedUsers?: string[];
  isBlocked?: boolean;
}

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);
  private readonly onlineUsers = new Set<string>();

  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<FriendshipDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(FriendsGateway)
    private readonly gateway: FriendsGateway,
  ) {}

  async sendRequest(
    requesterId: string,
    targetUsername: string,
  ): Promise<{ id: string }> {
    const target = (await this.userModel
      .findOne({ usernameNormalized: targetUsername.toLowerCase() })
      .lean()) as LeanUser | null;
    if (!target) throw new NotFoundException('friends.userNotFound');

    const targetId = target._id.toString();
    if (targetId === requesterId) {
      throw new BadRequestException('friends.cannotFriendSelf');
    }

    if (target.isBlocked) {
      throw new BadRequestException('friends.userNotFound');
    }

    const existing = await this.findExisting(requesterId, targetId);
    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('friends.alreadyFriends');
      }
      if (existing.status === 'pending') {
        throw new ConflictException('friends.requestAlreadyPending');
      }
    }

    const [requester, targetUser] = (await Promise.all([
      this.userModel.findById(requesterId).lean(),
      this.userModel.findById(targetId).lean(),
    ])) as [LeanUser | null, LeanUser | null];

    if (
      requester?.blockedUsers?.includes(targetId) ||
      targetUser?.blockedUsers?.includes(requesterId)
    ) {
      throw new BadRequestException('friends.userNotFound');
    }

    const friendship = await this.friendshipModel.create({
      requesterId: new Types.ObjectId(requesterId),
      addresseeId: new Types.ObjectId(targetId),
      status: 'pending',
    });

    const requesterDoc = (await this.userModel
      .findById(requesterId, { username: 1, displayName: 1 })
      .lean()) as { username: string; displayName?: string } | null;

    this.gateway.emitFriendRequest(targetId, {
      friendshipId: String(friendship._id),
      requesterId,
      username: requesterDoc?.username ?? '',
      displayName: requesterDoc?.displayName ?? null,
    });

    return { id: String(friendship._id) };
  }

  async acceptRequest(userId: string, friendshipId: string): Promise<void> {
    const friendship = await this.friendshipModel.findById(friendshipId);
    if (!friendship) throw new NotFoundException('friends.requestNotFound');

    if (String(friendship.addresseeId) !== userId) {
      throw new BadRequestException('friends.notRecipient');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('friends.requestNotPending');
    }

    friendship.status = 'accepted';
    await friendship.save();

    const addresseeDoc = (await this.userModel
      .findById(userId, { username: 1, displayName: 1 })
      .lean()) as { username: string; displayName?: string } | null;

    this.gateway.emitFriendAccepted(String(friendship.requesterId), {
      friendshipId: String(friendship._id),
      userId,
      username: addresseeDoc?.username ?? '',
      displayName: addresseeDoc?.displayName ?? null,
    });
  }

  async declineRequest(userId: string, friendshipId: string): Promise<void> {
    const friendship = await this.friendshipModel.findById(friendshipId);
    if (!friendship) throw new NotFoundException('friends.requestNotFound');

    if (String(friendship.addresseeId) !== userId) {
      throw new BadRequestException('friends.notRecipient');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('friends.requestNotPending');
    }

    await this.friendshipModel.deleteOne({ _id: friendship._id });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const result = await this.friendshipModel.deleteOne({
      status: 'accepted',
      $or: [
        { requesterId: userId, addresseeId: friendId },
        { requesterId: friendId, addresseeId: userId },
      ],
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('friends.notFriends');
    }

    this.gateway.emitFriendRemoved(friendId, userId);
  }

  async getFriends(userId: string): Promise<FriendView[]> {
    const friendships = await this.friendshipModel
      .find({
        status: 'accepted',
        $or: [
          { requesterId: new Types.ObjectId(userId) },
          { addresseeId: new Types.ObjectId(userId) },
        ],
      })
      .lean();

    const friendIds = friendships.map((f) =>
      String(f.requesterId) === userId
        ? String(f.addresseeId)
        : String(f.requesterId),
    );

    if (friendIds.length === 0) return [];

    const users = (await this.userModel
      .find({ _id: { $in: friendIds } })
      .lean()) as unknown as LeanUser[];

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return friendIds.map((id) => {
      const user = userMap.get(id);
      return {
        id,
        userId: id,
        username: user?.username ?? '',
        displayName: user?.displayName ?? null,
        equippedAvatarId: user?.equippedAvatarId ?? null,
        online: this.onlineUsers.has(id),
      };
    });
  }

  async getPendingRequests(userId: string): Promise<{
    incoming: FriendRequestView[];
    outgoing: FriendRequestView[];
  }> {
    type LeanFriendship = {
      _id: Types.ObjectId;
      requesterId: Types.ObjectId;
      addresseeId: Types.ObjectId;
      status: string;
      createdAt: Date;
    };

    const [incoming, outgoing] = await Promise.all([
      this.friendshipModel
        .find({ addresseeId: new Types.ObjectId(userId), status: 'pending' })
        .sort({ createdAt: -1 })
        .lean<LeanFriendship[]>(),
      this.friendshipModel
        .find({ requesterId: new Types.ObjectId(userId), status: 'pending' })
        .sort({ createdAt: -1 })
        .lean<LeanFriendship[]>(),
    ]);

    const incomingUserIds = incoming.map((f) => String(f.requesterId));
    const outgoingUserIds = outgoing.map((f) => String(f.addresseeId));

    const allUserIds = [...new Set([...incomingUserIds, ...outgoingUserIds])];

    const users = allUserIds.length
      ? ((await this.userModel
          .find({ _id: { $in: allUserIds } })
          .lean()) as unknown as LeanUser[])
      : [];

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const mapRequest = (f: LeanFriendship): FriendRequestView => {
      const uid =
        String(f.requesterId) === userId
          ? String(f.addresseeId)
          : String(f.requesterId);
      const user = userMap.get(uid);
      return {
        id: String(f._id),
        userId: uid,
        username: user?.username ?? '',
        displayName: user?.displayName ?? null,
        equippedAvatarId: user?.equippedAvatarId ?? null,
        createdAt: f.createdAt?.toISOString() ?? '',
      };
    };

    return {
      incoming: incoming.map(mapRequest),
      outgoing: outgoing.map(mapRequest),
    };
  }

  async getOnlineFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.friendshipModel
      .find({
        status: 'accepted',
        $or: [
          { requesterId: new Types.ObjectId(userId) },
          { addresseeId: new Types.ObjectId(userId) },
        ],
      })
      .lean();

    return friendships
      .map((f) =>
        String(f.requesterId) === userId
          ? String(f.addresseeId)
          : String(f.requesterId),
      )
      .filter((id) => this.onlineUsers.has(id));
  }

  async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.friendshipModel
      .find({
        status: 'accepted',
        $or: [
          { requesterId: new Types.ObjectId(userId) },
          { addresseeId: new Types.ObjectId(userId) },
        ],
      })
      .lean();

    return friendships.map((f) =>
      String(f.requesterId) === userId
        ? String(f.addresseeId)
        : String(f.requesterId),
    );
  }

  setUserOnline(userId: string): void {
    this.onlineUsers.add(userId);
  }

  setUserOffline(userId: string): void {
    this.onlineUsers.delete(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  private async findExisting(
    userId1: string,
    userId2: string,
  ): Promise<FriendshipDocument | null> {
    return this.friendshipModel.findOne({
      $or: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
    });
  }
}
