import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ShortsFactoryController } from './shorts-factory.controller';
import { ShortsFactoryService } from './shorts-factory.service';
import { TelegramService } from '../telegram/telegram.service';

describe('ShortsFactory reporting of passed and failed platforms', () => {
  let controller: ShortsFactoryController;
  let service: ShortsFactoryService;
  let sendMessageMock: jest.Mock;

  beforeEach(async () => {
    sendMessageMock = jest.fn().mockResolvedValue({ message_id: 999 });

    const mockTelegramService = {
      getBot: jest.fn().mockReturnValue({
        api: {
          sendMessage: sendMessageMock,
          editMessageText: jest.fn().mockResolvedValue(true),
          sendVideo: jest.fn().mockResolvedValue({ message_id: 123 }),
        },
      }),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'SHORTS_FACTORY_ADMIN_CHAT_ID') return '123456789';
        if (key === 'SHORTS_FACTORY_PENDING_DIR') return '/tmp/pending';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortsFactoryController],
      providers: [
        ShortsFactoryService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TelegramService, useValue: mockTelegramService },
      ],
    }).compile();

    controller = module.get<ShortsFactoryController>(ShortsFactoryController);
    service = module.get<ShortsFactoryService>(ShortsFactoryService);
  });

  it('should report passed platforms and failed platforms when tiktok fails and others pass', async () => {
    const payload = {
      id: 'pending-123',
      status: 'posted' as const,
      result: {
        success: true,
        message: 'Partial publish: passed [YouTube Shorts, Instagram Reels], failed [TikTok]',
        platforms: ['YouTube Shorts', 'Instagram Reels'],
        failedPlatforms: [
          { platform: 'TikTok', error: 'Network timeout during upload' },
        ],
      },
    };

    const res = await controller.handleResult(payload);
    expect(res).toEqual({ success: true });
    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    const [chatId, messageText, options] = sendMessageMock.mock.calls[0];
    expect(chatId).toBe('123456789');
    expect(options).toEqual({ parse_mode: 'HTML' });
    expect(messageText).toContain('⚠️ <b>Post Partially Completed</b>');
    expect(messageText).toContain('Partial publish: passed [YouTube Shorts, Instagram Reels], failed [TikTok]');
    expect(messageText).toContain('Published to:');
    expect(messageText).toContain('✅ YouTube Shorts');
    expect(messageText).toContain('✅ Instagram Reels');
    expect(messageText).toContain('Failed on:');
    expect(messageText).toContain('❌ <b>TikTok</b>: Network timeout during upload');
  });

  it('should report full success when all platforms pass', async () => {
    const payload = {
      success: true,
      message: 'Published to YouTube Shorts, Instagram Reels, TikTok',
      platforms: ['YouTube Shorts', 'Instagram Reels', 'TikTok'],
      failedPlatforms: [],
    };

    const res = await controller.handleResult(payload);
    expect(res).toEqual({ success: true });
    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    const [, messageText] = sendMessageMock.mock.calls[0];
    expect(messageText).toContain('✅ <b>Post Completed</b>');
    expect(messageText).toContain('✅ YouTube Shorts');
    expect(messageText).toContain('✅ Instagram Reels');
    expect(messageText).toContain('✅ TikTok');
    expect(messageText).not.toContain('Failed on:');
  });

  it('should report failure when all platforms fail', async () => {
    const payload = {
      success: false,
      message: 'Publish failed for all platforms',
      platforms: [],
      failedPlatforms: [
        { platform: 'YouTube Shorts', error: 'Token expired' },
        { platform: 'Instagram Reels', error: 'API rate limit' },
        { platform: 'TikTok', error: 'Invalid format' },
      ],
    };

    const res = await controller.handleResult(payload);
    expect(res).toEqual({ success: true });
    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    const [, messageText] = sendMessageMock.mock.calls[0];
    expect(messageText).toContain('❌ <b>Post Failed</b>');
    expect(messageText).toContain('Failed on:');
    expect(messageText).toContain('❌ <b>YouTube Shorts</b>: Token expired');
    expect(messageText).toContain('❌ <b>Instagram Reels</b>: API rate limit');
    expect(messageText).toContain('❌ <b>TikTok</b>: Invalid format');
    expect(messageText).not.toContain('Published to:');
  });
});
