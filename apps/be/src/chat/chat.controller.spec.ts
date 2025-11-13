import { Test, TestingModule } from '@nestjs/testing';
import { ChatController, AuthenticatedRequest } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  const chatServiceMock = {
    listChatsForUser: jest.fn(),
    createChatForUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: chatServiceMock }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createChat', () => {
    it('throws when user missing on request', async () => {
      await expect(
        controller.createChat({} as AuthenticatedRequest, {
          users: ['user-1'],
        }),
      ).rejects.toThrow('User context missing');
    });

    it('creates chat including authenticated user', async () => {
      const dto = { users: ['user-2', 'user-3'] };
      const request = {
        user: { userId: 'user-1' },
      } as AuthenticatedRequest;
      const summary = {
        chatId: 'chat-123',
        participants: [],
        lastMessage: null,
      };
      chatServiceMock.createChatForUsers.mockResolvedValue(summary);

      const result = await controller.createChat(request, dto);

      expect(chatServiceMock.createChatForUsers).toHaveBeenCalledWith(
        expect.arrayContaining(['user-1', 'user-2', 'user-3']),
        undefined,
      );
      expect(result).toBe(summary);
    });
  });

  describe('listChats', () => {
    it('throws when user missing on request', async () => {
      await expect(
        controller.listChats({} as AuthenticatedRequest),
      ).rejects.toThrow('User context missing');
    });

    it('returns chats for authenticated user', async () => {
      const request = {
        user: { userId: 'alpha-user' },
      } as AuthenticatedRequest;
      const summaries = [
        { chatId: 'chat-1', participants: [], lastMessage: null },
        { chatId: 'chat-2', participants: [], lastMessage: null },
      ];
      chatServiceMock.listChatsForUser.mockResolvedValue(summaries);

      const result = await controller.listChats(request);

      expect(chatServiceMock.listChatsForUser).toHaveBeenCalledWith(
        'alpha-user',
      );
      expect(result).toBe(summaries);
    });
  });
});
