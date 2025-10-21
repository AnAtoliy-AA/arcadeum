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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() messageDTO: MessageDTO): Promise<void> {
    const message = await this.chatService.saveMessage(messageDTO);

    if (Array.isArray(message.receiverIds)) {
      for (const receiverId of message.receiverIds) {
        this.server.to(receiverId).emit('message', message);
      }
    }

    this.server.to(message.senderId).emit('message', message);
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

    client.emit('chatMessages', messages);
  }
}
