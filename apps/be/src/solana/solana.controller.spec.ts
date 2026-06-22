jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({})),
  PublicKey: jest.fn().mockImplementation((key: string) => ({
    toBase58: () => key,
    equals: (other: { toBase58: () => string }) => other?.toBase58?.() === key,
  })),
  Keypair: { generate: jest.fn() },
  Transaction: jest.fn(),
  SystemProgram: { transfer: jest.fn() },
  LAMPORTS_PER_SOL: 1_000_000_000,
}));

jest.mock('@solana/spl-token', () => ({
  createTransferInstruction: jest.fn(),
  getAssociatedTokenAddress: jest.fn(),
  getAccount: jest.fn(),
}));

jest.mock('./lib/solana-keypair', () => ({
  getPlatformKeypair: jest.fn(),
}));

import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { SolanaController } from './solana.controller';
import { SolanaService } from './solana.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

type ServerHandle = Parameters<typeof request>[0];

describe('SolanaController', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();

  const solanaService = {
    getPlatformBalance: jest.fn(),
    verifyTransaction: jest.fn(),
    getTokenMetadata: jest.fn(),
  };

  const adminUserId = 'admin-user-id';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SolanaController],
      providers: [
        { provide: SolanaService, useValue: solanaService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: adminUserId,
            email: 'admin@test.com',
            username: 'admin',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          return req.user?.userId === adminUserId;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    solanaService.getPlatformBalance.mockReset();
    solanaService.verifyTransaction.mockReset();
    solanaService.getTokenMetadata.mockReset();
  });

  describe('GET /solana/platform-balance', () => {
    it('returns balance', async () => {
      solanaService.getPlatformBalance.mockResolvedValue({
        sol: 10,
        arcadeum: 500,
      });

      const res = await request(server())
        .get('/solana/platform-balance')
        .expect(200);

      expect(res.body).toEqual({ sol: 10, arcadeum: 500 });
      expect(solanaService.getPlatformBalance).toHaveBeenCalled();
    });
  });

  describe('GET /solana/token-metadata', () => {
    it('returns token metadata', async () => {
      solanaService.getTokenMetadata.mockResolvedValue({
        name: 'Arcadeum Games',
        symbol: 'ARC',
      });

      const res = await request(server())
        .get('/solana/token-metadata')
        .expect(200);

      expect(res.body.name).toBe('Arcadeum Games');
    });
  });

  describe('POST /solana/verify-transaction', () => {
    it('returns valid when transaction is verified', async () => {
      solanaService.verifyTransaction.mockResolvedValue(true);

      const res = await request(server())
        .post('/solana/verify-transaction')
        .send({
          signature: 'test-sig',
          amount: 100,
          senderAddress: 'HN7cHqfpFJzHUgMpX1QcSxKxJzVsUPqJyzA9BMjouQ8c',
        })
        .expect(201);

      expect(res.body.valid).toBe(true);
    });

    it('returns invalid when transaction fails verification', async () => {
      solanaService.verifyTransaction.mockResolvedValue(false);

      const res = await request(server())
        .post('/solana/verify-transaction')
        .send({
          signature: 'bad-sig',
          amount: 100,
          senderAddress: 'HN7cHqfpFJzHUgMpX1QcSxKxJzVsUPqJyzA9BMjouQ8c',
        })
        .expect(201);

      expect(res.body.valid).toBe(false);
    });
  });
});
