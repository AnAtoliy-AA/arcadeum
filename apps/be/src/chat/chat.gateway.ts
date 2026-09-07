import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ChatDTO, MessageDTO } from './dtos';
import { createChatRateLimiter } from '../games/common/socket-rate-limiter';
import {
  maybeEncrypt,
  maybeDecrypt,
  isSocketEncryptionEnabled,
  getEncryptionKeyHex,
} from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { verifySocketJwt } from '../common/utils/socket-jwt.util';

const MAX_CHAT_MESSAGE_LENGTH = 2000;

/**
 * The global ValidationPipe does not apply to WebSocket handlers, so WS
 * payloads are validated explicitly here. Never trust client-supplied
 * identity fields — they are always overridden with the verified JWT subject.
 */
async function parseWsDto<T extends object>(
  cls: new () => T,
  payload: unknown,
): Promise<T> {
  const candidate = plainToInstance(cls, payload);
  const errors: ValidationError[] = await validate(candidate, {
    whitelist: true,
  });
  if (errors.length > 0) {
    throw new WsException('Invalid payload.');
  }
  return candidate;
}

function requireAuthUserId(client: Socket): string {
  const data = client.data as Record<string, unknown> | undefined;
  const authUserId = data?.userId;
  if (data?.authenticated !== true || typeof authUserId !== 'string') {
    throw new WsException('Unauthorized.');
  }
  return authUserId;
}

@WebSocketGateway({
  cors: {
    origin: corsOriginMatcher,
  },
})
export class ChatGateway {
  constructor(
    private chatService: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private readonly logger = new Logger(ChatGateway.name);
  private readonly rateLimiter = createChatRateLimiter();

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket): Promise<void> {
    this.logger.verbose(`Client connected ${client.id}`);

    const authUserId = await verifySocketJwt(
      client,
      this.jwt,
      this.config,
      this.logger,
      'ChatGateway',
    );

    if (!authUserId) {
      // Chat requires an authenticated identity — anonymous sockets can
      // neither join per-user rooms nor send messages.
      this.logger.warn(
        `ChatGateway: rejecting unauthenticated socket ${client.id}`,
      );
      client.disconnect(true);
      return;
    }

    this.logger.debug(
      `Authenticated user ${authUserId} connected to Chat namespace`,
    );

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
  async handleMessage(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const authUserId = requireAuthUserId(client);

    if (!this.rateLimiter.isAllowed(client.id)) {
      client.emit('error', { message: 'Rate limit exceeded' });
      return;
    }

    const raw = maybeDecrypt<unknown>(payload);
    const messageDTO = await parseWsDto(MessageDTO, raw);

    if (
      typeof messageDTO.senderId === 'string' &&
      messageDTO.senderId.trim() &&
      messageDTO.senderId !== authUserId
    ) {
      this.logger.warn(
        `User ${authUserId} attempted to send message as ${messageDTO.senderId} — blocking`,
      );
    }

    // Sender identity is always derived from the verified JWT, never from
    // the payload.
    const outgoingDTO = Object.assign(messageDTO, {
      senderId: authUserId,
      content:
        typeof messageDTO.content === 'string'
          ? messageDTO.content.slice(0, MAX_CHAT_MESSAGE_LENGTH)
          : messageDTO.content,
    });

    const message = await this.chatService.saveMessage(outgoingDTO);

    const encryptedMessage = maybeEncrypt(message);

    if (Array.isArray(message.receiverIds)) {
      for (const receiverId of message.receiverIds) {
        this.server.to(receiverId).emit('message', encryptedMessage);
      }
    }

    this.server.to(message.senderId).emit('message', encryptedMessage);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const authUserId = requireAuthUserId(client);

    const chatDTO = await parseWsDto(ChatDTO, payload);

    const chatId =
      typeof chatDTO?.chatId === 'string' ? chatDTO.chatId.trim() : '';

    if (!chatId) {
      throw new WsException('chatId is required.');
    }

    if (
      typeof chatDTO?.currentUserId === 'string' &&
      chatDTO.currentUserId.trim() &&
      chatDTO.currentUserId.trim() !== authUserId
    ) {
      this.logger.warn(
        `User ${authUserId} attempted to join chat as ${chatDTO.currentUserId} — blocking`,
      );
      throw new WsException('Cannot join chat as another user.');
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

    if (!normalizedUsers.includes(authUserId)) {
      normalizedUsers.push(authUserId);
    }

    const chat = await this.chatService.findOrCreateChat({
      chatId,
      users: normalizedUsers,
    });

    await client.join(chat.chatId);
    // Per-user room is bound to the verified identity only.
    await client.join(authUserId);

    const messages = await this.chatService.getMessagesByChatId(chat.chatId);

    client.emit('chatMessages', maybeEncrypt(messages));
  }
}
