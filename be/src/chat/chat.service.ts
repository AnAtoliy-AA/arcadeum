import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { Message } from './schemas/message.schema';
import { ChatDTO, MessageDTO } from './dtos';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  // Find an existing one-on-one chat or create a new one
  async findOrCreateChat(chatDTO: ChatDTO): Promise<Chat> {
    if (!chatDTO.users || chatDTO.users.length === 0) {
      throw new Error('Chat must have at least one user.');
    }

    // Find chat with exact same users (regardless of order)
    let chat = await this.chatModel.findOne({ chatId: chatDTO.chatId }).exec();

    if (!chat) {
      chat = new this.chatModel(chatDTO);
      await chat.save();
    }

    return chat;
  }

  // Save a new message to a chat
  async saveMessage(messageDTO: MessageDTO): Promise<Message> {
    // For group chat, sender and all receivers should be in users array
    await this.findOrCreateChat({
      chatId: messageDTO.chatId,
      users: [
        messageDTO.senderId,
        ...(messageDTO.receiverId ? [messageDTO.receiverId] : []),
      ],
    });

    const message = new this.messageModel(messageDTO);

    return message.save();
  }

  async getMessagesByChatId(chatId: string) {
    return this.messageModel.find({ chatId }).sort({ timestamp: 1 }).exec();
  }
}
