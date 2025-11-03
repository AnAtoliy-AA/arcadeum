import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Chat } from './schemas/chat.schema';
import { Message } from './schemas/message.schema';
import { MessageDTO } from './dtos';
import { User, UserDocument } from '../auth/schemas/user.schema';

export interface MessageView {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  receiverIds: string[];
  content: string;
  timestamp: string;
}

export interface ChatParticipantSummary {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
}

export interface ChatSummary {
  chatId: string;
  participants: ChatParticipantSummary[];
  lastMessage: MessageView | null;
}

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
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private normalizeUserIds(
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

  private haveSameMembers(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    const set = new Set(a);
    return b.every((id) => set.has(id));
  }

  private resolveParticipantDisplayName(
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

  private async hydrateParticipants(
    participantIds: string[],
  ): Promise<Map<string, ChatParticipantSummary>> {
    const normalized = this.normalizeUserIds(participantIds);
    const lookup = new Map<string, ChatParticipantSummary>();
    if (!normalized.length) {
      return lookup;
    }

    const users = (await this.userModel
      .find({ _id: { $in: normalized } })
      .select(['username', 'email', 'displayName'])
      .exec()) as UserDocument[];

    for (const user of users) {
      const id =
        user._id instanceof Types.ObjectId
          ? user._id.toString()
          : String(user._id);
      const displayName = this.resolveParticipantDisplayName(
        {
          username: user.username,
          email: user.email,
          displayName: user.displayName,
        },
        id,
      );
      lookup.set(id, {
        id,
        username: user.username,
        email: user.email ?? null,
        displayName,
      });
    }

    for (const id of normalized) {
      if (!lookup.has(id)) {
        lookup.set(id, {
          id,
          username: id,
          email: null,
          displayName: id,
        });
      }
    }

    return lookup;
  }

  private async findChatByUsers(userIds: string[]): Promise<Chat | null> {
    if (!userIds.length) {
      return null;
    }

    const candidates = await this.chatModel
      .find({ users: { $all: userIds } })
      .exec();

    for (const candidate of candidates) {
      const candidateUsers = this.normalizeUserIds(candidate.users);
      if (this.haveSameMembers(candidateUsers, userIds)) {
        return candidate;
      }
    }

    return null;
  }

  private async fetchLastMessages(
    chatIds: string[],
  ): Promise<Map<string, MessageView>> {
    if (!chatIds.length) {
      return new Map<string, MessageView>();
    }

    const results = await Promise.all(
      chatIds.map(async (chatId) => ({
        chatId,
        message: await this.messageModel
          .findOne({ chatId })
          .sort({ timestamp: -1 })
          .exec(),
      })),
    );

    const messages: Message[] = [];
    const order: string[] = [];

    results.forEach((result) => {
      if (result.message) {
        messages.push(result.message);
        order.push(result.chatId);
      }
    });

    const lookup = new Map<string, MessageView>();
    if (!messages.length) {
      return lookup;
    }

    const views = await this.toMessageViews(messages);
    views.forEach((view, index) => {
      lookup.set(order[index], view);
    });
    return lookup;
  }

  // Find an existing one-on-one chat or create a new one
  async findOrCreateChat(options: {
    chatId: string;
    users: string[];
  }): Promise<Chat> {
    const normalizedChatId = options.chatId?.trim?.() ?? '';
    if (!normalizedChatId) {
      throw new Error('Chat must include a chat identifier.');
    }

    if (!options.users || options.users.length === 0) {
      throw new Error('Chat must have at least one user.');
    }

    const uniqueUsers = Array.from(
      new Set(
        options.users
          .map((userId) =>
            typeof userId === 'string' ? userId.trim() : String(userId ?? ''),
          )
          .filter((value) => value.length > 0),
      ),
    );

    if (!uniqueUsers.length) {
      throw new Error('Chat must include at least one valid user.');
    }

    // Find chat with matching chatId
    let chat = await this.chatModel
      .findOne({ chatId: normalizedChatId })
      .exec();

    if (!chat) {
      chat = new this.chatModel({
        chatId: normalizedChatId,
        users: uniqueUsers,
      });
      await chat.save();
    } else {
      const existing = new Set(chat.users.map((id) => id.toString()));
      let mutated = false;
      for (const userId of uniqueUsers) {
        if (!existing.has(userId)) {
          chat.users.push(userId);
          mutated = true;
        }
      }
      if (mutated) {
        await chat.save();
      }
    }

    return chat;
  }

  // Save a new message to a chat
  async saveMessage(messageDTO: MessageDTO): Promise<MessageView> {
    const sanitizedSenderId = messageDTO.senderId?.trim?.() ?? '';
    const sanitizedChatId = messageDTO.chatId?.trim?.() ?? '';
    const sanitizedContent = messageDTO.content?.trim?.() ?? '';

    if (!sanitizedSenderId) {
      throw new Error('Sender identifier is required.');
    }
    if (!sanitizedChatId) {
      throw new Error('Chat identifier is required.');
    }
    if (!sanitizedContent) {
      throw new Error('Message content must not be empty.');
    }

    const providedReceiverIds = Array.isArray(messageDTO.receiverIds)
      ? messageDTO.receiverIds
      : [];

    const candidateUserIds = providedReceiverIds
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value.length > 0);

    const chat = await this.findOrCreateChat({
      chatId: sanitizedChatId,
      users: [sanitizedSenderId, ...candidateUserIds],
    });

    const participants = this.normalizeUserIds(chat.users ?? []);
    const receiverIds = participants.filter((id) => id !== sanitizedSenderId);

    const sender = (await this.userModel
      .findById(sanitizedSenderId)
      .select(['username', 'email', 'displayName'])
      .lean()
      .exec()) as
      | (Pick<User, 'username' | 'email' | 'displayName'> & {
          _id?: Types.ObjectId | string;
        })
      | null;
    const senderUsername = this.resolveParticipantDisplayName(
      {
        username: sender?.username,
        email: sender?.email,
        displayName: sender?.displayName,
      },
      sanitizedSenderId,
    );

    const message = new this.messageModel({
      chatId: chat.chatId,
      senderId: sanitizedSenderId,
      senderUsername,
      receiverIds,
      content: sanitizedContent,
      timestamp: new Date(),
    });

    const saved = await message.save();
    const [view] = await this.toMessageViews([saved]);
    return view;
  }

  async getMessagesByChatId(chatId: string) {
    const messages = await this.messageModel
      .find({ chatId })
      .sort({ timestamp: 1 })
      .exec();
    return this.toMessageViews(messages);
  }

  async createChatForUsers(
    userIds: string[],
    providedChatId?: string,
  ): Promise<ChatSummary> {
    const normalized = this.normalizeUserIds(userIds);
    if (normalized.length < 2) {
      throw new Error('Chat must include at least two distinct users');
    }

    let chat = await this.findChatByUsers(normalized);
    if (!chat) {
      const chatId = providedChatId?.trim() || randomUUID();
      chat = new this.chatModel({ chatId, users: normalized });
      await chat.save();
    } else {
      const existing = new Set(chat.users.map((id) => id.toString()));
      let mutated = false;
      for (const id of normalized) {
        if (!existing.has(id)) {
          chat.users.push(id);
          mutated = true;
        }
      }
      if (mutated) {
        await chat.save();
      }
    }

    const participantLookup = await this.hydrateParticipants(chat.users ?? []);
    const participants = this.normalizeUserIds(chat.users ?? []).map(
      (id) =>
        participantLookup.get(id) ?? {
          id,
          username: id,
          email: null,
          displayName: id,
        },
    );

    const lastMessageLookup = await this.fetchLastMessages([chat.chatId]);

    return {
      chatId: chat.chatId,
      participants,
      lastMessage: lastMessageLookup.get(chat.chatId) ?? null,
    };
  }

  async listChatsForUser(userId: string): Promise<ChatSummary[]> {
    const chats = await this.chatModel.find({ users: userId }).exec();
    if (!chats.length) {
      return [];
    }

    const participantIds = this.normalizeUserIds(
      chats.flatMap((chat) => chat.users ?? []),
    );
    const participantLookup = await this.hydrateParticipants(participantIds);
    const lastMessageLookup = await this.fetchLastMessages(
      chats.map((chat) => chat.chatId),
    );

    const summaries: ChatSummary[] = chats.map((chat) => {
      const participantsList: ChatParticipantSummary[] = this.normalizeUserIds(
        chat.users ?? [],
      ).map((participantId) => {
        const participant = participantLookup.get(participantId);
        return (
          participant ?? {
            id: participantId,
            username: participantId,
            email: null,
            displayName: participantId,
          }
        );
      });

      return {
        chatId: chat.chatId,
        participants: participantsList,
        lastMessage: lastMessageLookup.get(chat.chatId) ?? null,
      };
    });

    summaries.sort((a, b) => {
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.timestamp).getTime()
        : 0;
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.timestamp).getTime()
        : 0;
      return bTime - aTime;
    });

    return summaries;
  }

  private async toMessageViews(messageDocs: Message[]): Promise<MessageView[]> {
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
