import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { Chat } from './schemas/chat.schema';
import { Message } from './schemas/message.schema';
import { User } from '../auth/schemas/user.schema';
import { ChatHelperService } from './chat-helper.service';

describe('ChatService', () => {
  let service: ChatService;
  const createModelMock = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  });

  beforeEach(async () => {
    const chatModelMock = createModelMock();
    const messageModelMock = createModelMock();
    const userModelMock = createModelMock();
    const chatHelperMock = {
      normalizeUserIds: jest.fn<string[], [string[]]>((ids) => ids),
      haveSameMembers: jest.fn(),
      toMessageViews: jest.fn(),
      resolveParticipantDisplayName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(Chat.name), useValue: chatModelMock },
        { provide: getModelToken(Message.name), useValue: messageModelMock },
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: ChatHelperService, useValue: chatHelperMock },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws when creating chat with less than two users', async () => {
    await expect(service.createChatForUsers(['user-1'])).rejects.toThrow(
      'Chat must include at least two distinct users',
    );
  });
});
