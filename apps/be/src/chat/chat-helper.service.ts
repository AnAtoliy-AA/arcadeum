import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { MessageView } from './chat.service';

type MessageDocumentObject = {
  _id: Types.ObjectId;
  chatId: string;
  senderId: string | Types.ObjectId;
  senderUsername?: string;
  receiverIds: Array<string | Types.ObjectId>;
  content: string;
  timestamp: Date | string | number;
};

@Injectable()
export class ChatHelperService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  normalizeUserIds(
    userIds: Array<string | Types.ObjectId | null | undefined>,
  ): string[] {
    const unique = new Set<string>();
    for (const value of userIds) {
      if (!value) continue;
      let parsed: string;
      if (typeof value === 'string') {
        parsed = value.trim();
      } else if (value instanceof Types.ObjectId) {
        parsed = value.toString();
      } else {
        parsed = String(value);
      }
      if (parsed) {
        unique.add(parsed);
      }
    }
    return Array.from(unique);
  }

  haveSameMembers(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    const set = new Set(a);
    return b.every((id) => set.has(id));
  }

  resolveParticipantDisplayName(
    source: {
      displayName?: string | null;
      username?: string | null;
      email?: string | null;
    },
    fallback?: string,
  ): string {
    const preferred = source.displayName?.trim?.();
    if (preferred) {
      return preferred;
    }

    const userName = source.username?.trim?.();
    if (userName) {
      return userName;
    }

    const normalizedEmail = source.email?.trim?.();
    if (normalizedEmail) {
      const [localPart] = normalizedEmail.split('@');
      const local = localPart?.trim?.();
      if (local) {
        return local;
      }
      return normalizedEmail;
    }

    const normalizedFallback = fallback?.trim?.();
    if (normalizedFallback) {
      return normalizedFallback;
    }

    return 'Player';
  }

  async toMessageViews(messageDocs: Message[]): Promise<MessageView[]> {
    if (!messageDocs.length) {
      return [];
    }

    const plainMessages = messageDocs.map((doc) =>
      doc.toObject<MessageDocumentObject>(),
    );

    // Collect every distinct sender id. We need a User lookup either way to
    // resolve the sender's current equipped cosmetics — older messages may
    // have a cached senderUsername but we still want the live equipped state
    // (matches the "show current avatar/badge" UX in other chat apps). One
    // batched query covers both username fallback and equipped resolution.
    const senderIds = new Set<string>();
    for (const message of plainMessages) {
      if (message.senderId) senderIds.add(message.senderId.toString());
    }

    const usernameLookup = new Map<string, string>();
    const equippedLookup = new Map<
      string,
      {
        equippedAvatarId: string | null;
        equippedBadgeId: string | null;
        equippedNameColorId: string | null;
        equippedFrameId: string | null;
        equippedAuraId: string | null;
        equippedBannerId: string | null;
      }
    >();

    if (senderIds.size) {
      const validIds = Array.from(senderIds).filter((id) =>
        Types.ObjectId.isValid(id),
      );

      const users = validIds.length
        ? ((await this.userModel
            .find({ _id: { $in: validIds } })
            .select([
              'username',
              'email',
              'displayName',
              'equippedAvatarId',
              'equippedBadgeId',
              'equippedNameColorId',
              'equippedFrameId',
              'equippedAuraId',
              'equippedBannerId',
            ])
            .exec()) as UserDocument[])
        : [];

      for (const user of users) {
        const rawId = user._id;
        const id =
          rawId instanceof Types.ObjectId ? rawId.toString() : String(rawId);
        const displayName = this.resolveParticipantDisplayName(
          {
            username: user.username,
            email: user.email,
            displayName: user.displayName,
          },
          id,
        );
        usernameLookup.set(id, displayName);
        equippedLookup.set(id, {
          equippedAvatarId: user.equippedAvatarId ?? null,
          equippedBadgeId: user.equippedBadgeId ?? null,
          equippedNameColorId: user.equippedNameColorId ?? null,
          equippedFrameId: user.equippedFrameId ?? null,
          equippedAuraId: user.equippedAuraId ?? null,
          equippedBannerId: user.equippedBannerId ?? null,
        });
      }
    }

    return plainMessages.map((message) => {
      const senderId =
        message.senderId?.toString?.() ?? String(message.senderId ?? '');
      const timestampValue =
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp);
      const equipped = equippedLookup.get(senderId);

      return {
        id:
          message._id?.toString?.() ??
          String(
            message._id ?? `${message.chatId}-${timestampValue.getTime()}`,
          ),
        chatId: message.chatId,
        senderId,
        senderUsername:
          message.senderUsername ?? usernameLookup.get(senderId) ?? senderId,
        senderEquippedAvatarId: equipped?.equippedAvatarId ?? null,
        senderEquippedBadgeId: equipped?.equippedBadgeId ?? null,
        senderEquippedNameColorId: equipped?.equippedNameColorId ?? null,
        senderEquippedFrameId: equipped?.equippedFrameId ?? null,
        senderEquippedAuraId: equipped?.equippedAuraId ?? null,
        senderEquippedBannerId: equipped?.equippedBannerId ?? null,
        receiverIds: Array.isArray(message.receiverIds)
          ? message.receiverIds.map((id): string =>
              typeof id === 'string'
                ? id
                : (id?.toString?.() ?? String(id ?? '')),
            )
          : [],
        content: message.content,
        timestamp: timestampValue.toISOString(),
      };
    });
  }
}
