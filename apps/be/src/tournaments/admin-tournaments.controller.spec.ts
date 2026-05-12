import {
  BadRequestException,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AdminTournamentsController } from './admin-tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { Types } from 'mongoose';
import { ValidationPipe } from '@nestjs/common';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

const mockAdminId = new Types.ObjectId().toHexString();

const buildTournamentItem = (overrides: Record<string, unknown> = {}) => ({
  id: new Types.ObjectId().toHexString(),
  status: 'live',
  gameType: 'critical_v1',
  scheduledAt: new Date().toISOString(),
  registrationOpensAt: null,
  registrationClosesAt: null,
  maxPlayers: 16,
  prizeDescription: null,
  resultText: null,
  content: { en: { name: 'Cup' } },
  registeredCount: 1,
  waitlistCount: 0,
  createdBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('AdminTournamentsController — complete endpoint (Task 11)', () => {
  let app: INestApplication<App>;
  let userModel: { findById: jest.Mock };
  let service: { markComplete: jest.Mock };

  const tournamentId = new Types.ObjectId().toHexString();
  const winnerId = new Types.ObjectId().toHexString();

  beforeEach(() => {
    service.markComplete.mockReset();
  });

  beforeAll(async () => {
    userModel = {
      findById: jest.fn().mockReturnValue({
        select: () => ({ lean: () => Promise.resolve({ role: 'admin' }) }),
      }),
    };
    service = { markComplete: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminTournamentsController],
      providers: [
        RolesGuard,
        { provide: TournamentsService, useValue: service },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: mockAdminId,
            email: 'admin@x',
            username: 'admin',
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST :id/complete calls service.markComplete and returns updated tournament', async () => {
    const item = buildTournamentItem({ status: 'completed', id: tournamentId });
    service.markComplete.mockResolvedValue(item);

    const res = await request(app.getHttpServer())
      .post(`/admin/tournaments/${tournamentId}/complete`)
      .send({ winnerUserId: winnerId })
      .expect(201);

    expect(service.markComplete).toHaveBeenCalledWith(tournamentId, winnerId);
    expect(res.body).toMatchObject({ id: tournamentId, status: 'completed' });
  });

  it('rejects non-MongoId winnerUserId with 400', async () => {
    await request(app.getHttpServer())
      .post(`/admin/tournaments/${tournamentId}/complete`)
      .send({ winnerUserId: 'not-a-mongo-id' })
      .expect(400);

    expect(service.markComplete).not.toHaveBeenCalled();
  });

  it('surfaces 400 when service throws BadRequestException', async () => {
    service.markComplete.mockRejectedValue(
      new BadRequestException({ code: 'WINNER_NOT_REGISTERED' }),
    );

    await request(app.getHttpServer())
      .post(`/admin/tournaments/${tournamentId}/complete`)
      .send({ winnerUserId: winnerId })
      .expect(400);
  });
});
