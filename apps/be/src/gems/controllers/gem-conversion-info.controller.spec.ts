import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { GemConversionInfoController } from './gem-conversion-info.controller';
import { GemConversionService } from '../services/gem-conversion.service';

type ServerHandle = Parameters<typeof request>[0];

describe('GemConversionInfoController', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();

  const conversionService = {
    getRate: jest.fn(),
    convertGemsToCoins: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GemConversionInfoController],
      providers: [
        { provide: GemConversionService, useValue: conversionService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    conversionService.getRate.mockReset();
  });

  describe('GET /wallet/conversion-rate', () => {
    it('is an open route — no auth required', async () => {
      conversionService.getRate.mockReturnValue(100);

      // Should succeed without any auth headers
      await request(server()).get('/wallet/conversion-rate').expect(200);
    });

    it('returns the default rate of 100', async () => {
      conversionService.getRate.mockReturnValue(100);

      const res = await request(server())
        .get('/wallet/conversion-rate')
        .expect(200);

      expect(res.body as unknown).toEqual({ rate: 100 });
    });

    it('returns the env-tuned rate when GEM_TO_COIN_RATE is set', async () => {
      conversionService.getRate.mockReturnValue(200);

      const res = await request(server())
        .get('/wallet/conversion-rate')
        .expect(200);

      expect(res.body as unknown).toEqual({ rate: 200 });
    });

    it('calls service.getRate()', async () => {
      conversionService.getRate.mockReturnValue(50);

      await request(server()).get('/wallet/conversion-rate').expect(200);

      expect(conversionService.getRate).toHaveBeenCalled();
    });
  });
});
