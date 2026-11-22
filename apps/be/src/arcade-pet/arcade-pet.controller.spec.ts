import {
  ExecutionContext,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import request from 'supertest';
import type { App } from 'supertest/types';
import type {
  ArcadePetCollectionResponse,
  ArcadePetEconomyError,
} from '@arcadeum/games-core';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { ArcadePetController } from './arcade-pet.controller';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import { ArcadePetEconomyService } from './arcade-pet-economy.service';
import { ArcadePetFeatureGuard } from './arcade-pet-feature.guard';
import { ArcadePetFeatureService } from './arcade-pet-feature.service';

const collection = {
  revision: 4,
  gemBalance: 10,
} as ArcadePetCollectionResponse;
const ACTION_ID = '5b6f1c64-5a43-4a6f-9d7e-3c2d0f6a8b11';

describe('ArcadePetController (HTTP)', () => {
  let app: INestApplication;
  let http: App;
  const collections = { getCollection: jest.fn(), syncCollection: jest.fn() };
  const economy = { perform: jest.fn() };
  const feature = { assertEnabledFor: jest.fn() };

  // Stands in for passport: `x-test-user` plays the validated JWT payload.
  const jwtStub = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest<Request>();
      const userId = req.headers['x-test-user'];
      if (typeof userId !== 'string') throw new UnauthorizedException();
      (req as Request & { user: { userId: string } }).user = { userId };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ArcadePetController],
      providers: [
        { provide: ArcadePetCollectionService, useValue: collections },
        { provide: ArcadePetEconomyService, useValue: economy },
        { provide: ArcadePetFeatureService, useValue: feature },
        ArcadePetFeatureGuard,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtStub)
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    http = app.getHttpServer() as App;
  });

  afterAll(() => app.close());

  beforeEach(() => {
    jest.resetAllMocks();
    feature.assertEnabledFor.mockResolvedValue(undefined);
  });

  it('is unversioned like every other controller (/arcade-pet)', () => {
    expect(Reflect.getMetadata('path', ArcadePetController)).toBe('arcade-pet');
  });

  it('guards every route with JWT first, then the feature flag', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ArcadePetController)).toEqual([
      JwtAuthGuard,
      ArcadePetFeatureGuard,
    ]);
  });

  describe('auth', () => {
    it.each([
      ['get', '/arcade-pet/collection'],
      ['put', '/arcade-pet/collection'],
      ['post', '/arcade-pet/collection/action'],
    ] as const)('answers 401 on %s %s without a user', async (method, url) => {
      await request(http)[method](url).send({}).expect(401);
      expect(feature.assertEnabledFor).not.toHaveBeenCalled();
    });
  });

  describe('feature flag', () => {
    beforeEach(() => {
      feature.assertEnabledFor.mockRejectedValue(new NotFoundException());
    });

    it.each([
      ['get', '/arcade-pet/collection'],
      ['put', '/arcade-pet/collection'],
      ['post', '/arcade-pet/collection/action'],
    ] as const)(
      'answers 404 on %s %s while the flag is off',
      async (m, url) => {
        await request(http)
          [m](url)
          .set('x-test-user', 'u1')
          .send({ type: 'claim_daily' })
          .expect(404);
        expect(collections.getCollection).not.toHaveBeenCalled();
        expect(economy.perform).not.toHaveBeenCalled();
      },
    );
  });

  describe('GET collection', () => {
    it('returns the collection of the authenticated user only', async () => {
      collections.getCollection.mockResolvedValue(collection);
      const res = await request(http)
        .get('/arcade-pet/collection')
        .set('x-test-user', 'u1')
        .expect(200);
      expect(res.body).toEqual(collection);
      expect(collections.getCollection).toHaveBeenCalledWith('u1');
    });
  });

  describe('PUT collection', () => {
    it('answers 400 with validation details for a malformed body', async () => {
      const res = await request(http)
        .put('/arcade-pet/collection')
        .set('x-test-user', 'u1')
        .send({ baseRevision: -1, pets: 'nope', isAtHome: 'yes' })
        .expect(400);
      const body = res.body as { statusCode: number; message: string };
      expect(body.statusCode).toBe(400);
      expect(typeof body.message).toBe('string');
      expect(collections.syncCollection).not.toHaveBeenCalled();
    });

    it('rejects unknown fields such as client-supplied balances', async () => {
      await request(http)
        .put('/arcade-pet/collection')
        .set('x-test-user', 'u1')
        .send({
          baseRevision: 1,
          pets: [],
          activePetId: null,
          isAtHome: false,
          gemBalance: 999999,
        })
        .expect(400);
    });

    it('syncs under the authenticated user id', async () => {
      collections.syncCollection.mockResolvedValue({
        status: 'ok',
        collection,
      });
      await request(http)
        .put('/arcade-pet/collection')
        .set('x-test-user', 'u1')
        .send({ baseRevision: 1, pets: [], activePetId: null, isAtHome: false })
        .expect(200);
      expect(collections.syncCollection).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ baseRevision: 1 }),
      );
    });
  });

  describe('POST collection/action', () => {
    const post = (body: object) =>
      request(http)
        .post('/arcade-pet/collection/action')
        .set('x-test-user', 'u1')
        .send(body);

    it('answers 400 for an unknown action type', async () => {
      await post({ type: 'mint_gems' }).expect(400);
      expect(economy.perform).not.toHaveBeenCalled();
    });

    it('answers 400 when a required field is missing', async () => {
      await post({ type: 'upgrade_home' }).expect(400);
    });

    it('answers 400 for a non-uuid actionId', async () => {
      await post({ type: 'claim_daily', actionId: 'nope' }).expect(400);
    });

    it('performs the action and forwards the action id', async () => {
      economy.perform.mockResolvedValue({ ok: true, collection });
      const res = await post({
        type: 'claim_daily',
        actionId: ACTION_ID,
      }).expect(201);
      expect(res.body).toEqual({ ok: true, collection });
      expect(economy.perform).toHaveBeenCalledWith(
        'u1',
        { type: 'claim_daily' },
        ACTION_ID,
      );
    });

    it.each<[ArcadePetEconomyError, number]>([
      ['INVALID_SPEC', 400],
      ['SELF_GIFT', 400],
      ['INSUFFICIENT_GEMS', 402],
      ['INSUFFICIENT_COINS', 402],
      ['PET_NOT_FOUND', 404],
      ['PRESENT_NOT_FOUND', 404],
      ['RECIPIENT_NOT_FOUND', 404],
      ['HOME_FULL', 409],
      ['HOME_MAX', 409],
      ['DUPLICATE_PET', 409],
      ['ALREADY_CLAIMED', 409],
      ['NOTHING_TO_CLAIM', 409],
      ['INBOX_FULL', 409],
      ['CONTENTION', 409],
    ])(
      'maps rejection %s to HTTP %i and keeps the collection',
      async (error, status) => {
        economy.perform.mockResolvedValue({ ok: false, error, collection });
        const res = await post({ type: 'claim_daily' }).expect(status);
        const body = res.body as {
          error: string;
          details: { collection: ArcadePetCollectionResponse };
        };
        expect(body.error).toBe(error);
        expect(body.details.collection).toEqual(collection);
      },
    );
  });
});
