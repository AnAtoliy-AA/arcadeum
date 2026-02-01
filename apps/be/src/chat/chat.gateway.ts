import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service'; // Import the chat service
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatDTO, MessageDTO } from './dtos';
import {
  maybeEncrypt,
  maybeDecrypt,
  isSocketEncryptionEnabled,
  getEncryptionKeyHex,
} from '../common/utils/socket-encryption.util';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    this.logger.verbose(`Client connected ${client.id}`);

    // Send encryption key to authenticated client if encryption is enabled
    if (isSocketEncryptionEnabled()) {
      try {
        const encryptionKey = getEncryptionKeyHex();
        client.emit('socket.encryption_key', { key: encryptionKey });
        this.logger.debug(`Encryption key sent to ${client.id}`);
      } catch (error) {
        this.logger.error(`Failed to send encryption key: ${error}`);
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.verbose(`Client disconnected ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() payload: unknown): Promise<void> {
    const messageDTO = maybeDecrypt<MessageDTO>(payload);
    const message = await this.chatService.saveMessage(messageDTO);

    const outgoingMessage = maybeEncrypt(message);

    if (Array.isArray(message.receiverIds)) {
      for (const receiverId of message.receiverIds) {
        this.server.to(receiverId).emit('message', outgoingMessage);
      }
    }

    this.server.to(message.senderId).emit('message', outgoingMessage);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatDTO: ChatDTO,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const chatId =
      typeof chatDTO?.chatId === 'string' ? chatDTO.chatId.trim() : '';
    const currentUserId =
      typeof chatDTO?.currentUserId === 'string'
        ? chatDTO.currentUserId.trim()
        : '';

    if (!chatId) {
      throw new WsException('chatId is required.');
    }
    if (!currentUserId) {
      throw new WsException('currentUserId is required.');
    }

    const normalizedUsers = Array.isArray(chatDTO?.users)
      ? Array.from(
          new Set(
            chatDTO.users
              .map((userId) =>
                typeof userId === 'string' ? userId.trim() : '',
              )
              .filter((value) => value.length > 0),
          ),
        )
      : [];

    if (!normalizedUsers.includes(currentUserId)) {
      normalizedUsers.push(currentUserId);
    }

    const chat = await this.chatService.findOrCreateChat({
      chatId,
      users: normalizedUsers,
    });

    await client.join(chat.chatId);
    await client.join(currentUserId);

    const messages = await this.chatService.getMessagesByChatId(chat.chatId);

    client.emit('chatMessages', maybeEncrypt(messages));
  }
}
