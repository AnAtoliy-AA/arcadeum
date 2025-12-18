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
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

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
    const missingSenderIds = new Set<string>();

    for (const message of plainMessages) {
      if (!message.senderUsername && message.senderId) {
        missingSenderIds.add(message.senderId.toString());
      }
    }

    const usernameLookup = new Map<string, string>();

    if (missingSenderIds.size) {
      const users = (await this.userModel
        .find({ _id: { $in: Array.from(missingSenderIds) } })
        .select(['username', 'email', 'displayName'])
        .exec()) as UserDocument[];

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
      }
    }

    return plainMessages.map((message) => {
      const senderId =
        message.senderId?.toString?.() ?? String(message.senderId ?? '');
      const timestampValue =
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp);

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
