import { ChatService } from './chat.service'; // Import the chat service
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
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

    // Emit the message to the receiver's socket
    this.server.to(messageDTO.receiverId).emit('message', message);
    this.server.to(messageDTO.senderId).emit('message', message);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatDTO: ChatDTO,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const chat = await this.chatService.findOrCreateChat(chatDTO);

    // Let both users join the chat room
    await client.join(chat.user1);
    await client.join(chat.user2);

    // Send back initial messages if needed
    const messages = await this.chatService.getMessagesByChatId(chat.chatId);

    client.emit('chatMessages', messages);
  }
}
