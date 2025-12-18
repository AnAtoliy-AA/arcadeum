import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Chat } from './schemas/chat.schema';
import { Message } from './schemas/message.schema';
import { MessageDTO } from './dtos';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { ChatHelperService } from './chat-helper.service';

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
    private chatHelper: ChatHelperService,
  ) {}

  private async hydrateParticipants(
    participantIds: string[],
  ): Promise<Map<string, ChatParticipantSummary>> {
    const normalized = this.chatHelper.normalizeUserIds(participantIds);
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
      const displayName = this.chatHelper.resolveParticipantDisplayName(
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
      const candidateUsers = this.chatHelper.normalizeUserIds(candidate.users);
      if (this.chatHelper.haveSameMembers(candidateUsers, userIds)) {
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

    const views = await this.chatHelper.toMessageViews(messages);
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

    const participants = this.chatHelper.normalizeUserIds(chat.users ?? []);
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
    const senderUsername = this.chatHelper.resolveParticipantDisplayName(
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
    const [view] = await this.chatHelper.toMessageViews([saved]);
    return view;
  }

  async getMessagesByChatId(chatId: string) {
    const messages = await this.messageModel
      .find({ chatId })
      .sort({ timestamp: 1 })
      .exec();
    return this.chatHelper.toMessageViews(messages);
  }

  async createChatForUsers(
    userIds: string[],
    providedChatId?: string,
  ): Promise<ChatSummary> {
    const normalized = this.chatHelper.normalizeUserIds(userIds);
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
    const participants = this.chatHelper.normalizeUserIds(chat.users ?? []).map(
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

    const participantIds = this.chatHelper.normalizeUserIds(
      chats.flatMap((chat) => chat.users ?? []),
    );
    const participantLookup = await this.hydrateParticipants(participantIds);
    const lastMessageLookup = await this.fetchLastMessages(
      chats.map((chat) => chat.chatId),
    );

    const summaries: ChatSummary[] = chats.map((chat) => {
      const participantsList: ChatParticipantSummary[] = this.chatHelper.normalizeUserIds(
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
}

