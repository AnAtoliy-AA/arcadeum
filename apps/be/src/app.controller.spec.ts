import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;

  const mockConnection = {
    readyState: 1,
    db: { admin: () => ({ command: () => ({}) }) },
  } as unknown as Connection;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: 'OCIConnection', useValue: mockConnection },
        { provide: 'ATLASConnection', useValue: mockConnection },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('root', () => {
    it('should return a live status snapshot', () => {
      const rootStatus = appController.getRootStatus();

      expect(rootStatus.status).toBe('ok');
      expect(typeof rootStatus.timestamp).toBe('string');
      expect(typeof rootStatus.uptimeSeconds).toBe('number');
    });
  });
});
