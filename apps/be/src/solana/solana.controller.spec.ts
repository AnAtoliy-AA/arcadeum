jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({})),
  PublicKey: jest.fn().mockImplementation((key: string) => ({
    toBase58: () => key,
    equals: (other: { toBase58: () => string }) =>
      other?.toBase58?.() === key,
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
import { WalletService } from '../wallet/wallet.service';
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
    transferArcadeum: jest.fn(),
    getSolPrice: jest.fn(),
    getArcadeumPrice: jest.fn(),
  };

  const walletService = {
    getBalance: jest.fn(),
    debit: jest.fn(),
  };

  const adminUserId = 'admin-user-id';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SolanaController],
      providers: [
        { provide: SolanaService, useValue: solanaService },
        { provide: WalletService, useValue: walletService },
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
    solanaService.transferArcadeum.mockReset();
    solanaService.getSolPrice.mockReset();
    solanaService.getArcadeumPrice.mockReset();
    walletService.getBalance.mockReset();
    walletService.debit.mockReset();
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

  describe('POST /solana/withdraw', () => {
    it('debits wallet and calls transferArcadeum', async () => {
      walletService.getBalance.mockResolvedValue({
        coins: 0,
        gems: 0,
        arcadeum: 1000,
      });
      walletService.debit.mockResolvedValue({});
      solanaService.transferArcadeum.mockResolvedValue('sig-123');

      const res = await request(server())
        .post('/solana/withdraw')
        .send({
          walletAddress: 'HN7cHqfpFJzHUgMpX1QcSxKxJzVsUPqJyzA9BMjouQ8c',
          amount: 100,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        success: true,
        signature: 'sig-123',
        amount: 100,
        fee: 2,
      });
      expect(walletService.debit).toHaveBeenCalledTimes(2);
      expect(solanaService.transferArcadeum).toHaveBeenCalledWith(
        'HN7cHqfpFJzHUgMpX1QcSxKxJzVsUPqJyzA9BMjouQ8c',
        100,
      );
    });

    it('throws on insufficient balance', async () => {
      walletService.getBalance.mockResolvedValue({
        coins: 0,
        gems: 0,
        arcadeum: 50,
      });

      await request(server())
        .post('/solana/withdraw')
        .send({
          walletAddress: 'HN7cHqfpFJzHUgMpX1QcSxKxJzVsUPqJyzA9BMjouQ8c',
          amount: 100,
        })
        .expect(500);

      expect(walletService.debit).not.toHaveBeenCalled();
      expect(solanaService.transferArcadeum).not.toHaveBeenCalled();
    });
  });

  describe('POST /solana/buyback', () => {
    it('returns estimated ARCADEUM amount based on SOL price', async () => {
      solanaService.getSolPrice.mockResolvedValue(150);
      solanaService.getArcadeumPrice.mockResolvedValue(0.01);

      const res = await request(server())
        .post('/solana/buyback')
        .send({ solAmount: 1 })
        .expect(201);

      const body = res.body as Record<string, unknown>;
      expect(body).toMatchObject({
        success: true,
        solAmount: 1,
        solPriceUsd: 150,
        arcadeumPriceUsd: 0.01,
        estimatedArcadeum: 15000,
        message: expect.stringContaining('DEX integration'),
      });
    });
  });
});
