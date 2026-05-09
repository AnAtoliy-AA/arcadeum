import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AdminPaymentNotesController } from './admin-payment-notes.controller';
import { PaymentNotesService } from './payment-notes.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PaymentNote } from './schemas/payment-note.schema';
import { User } from '../auth/schemas/user.schema';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

interface ResponseBody {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
}
type ServerHandle = Parameters<typeof request>[0];

describe('AdminPaymentNotesController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let noteModel: { find: jest.Mock; countDocuments: jest.Mock };
  let userModel: { find: jest.Mock };

  const buildFindChain = (returnDocs: unknown[]) => ({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(returnDocs),
  });

  beforeAll(async () => {
    noteModel = { find: jest.fn(), countDocuments: jest.fn() };
    userModel = { find: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminPaymentNotesController],
      providers: [
        PaymentNotesService,
        { provide: getModelToken(PaymentNote.name), useValue: noteModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: 'u1',
            email: 'me@x',
            username: 'me',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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
    noteModel.find.mockReset();
    noteModel.countDocuments.mockReset();
    userModel.find.mockReset();
  });

  it('returns 200 with default pagination', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);

    const res = await request(server())
      .get('/admin/payments/notes')
      .expect(200);
    expect(res.body as unknown).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });
  });

  it('rejects pageSize=999 with 400 (proves global ValidationPipe registered)', async () => {
    await request(server())
      .get('/admin/payments/notes?pageSize=999')
      .expect(400);
  });

  it('rejects unknown query param (forbidNonWhitelisted)', async () => {
    await request(server()).get('/admin/payments/notes?nope=1').expect(400);
  });

  it('rejects invalid visibility enum with 400', async () => {
    await request(server())
      .get('/admin/payments/notes?visibility=invalid')
      .expect(400);
  });

  it('passes query through to service (page=2, pageSize=25, visibility=private)', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);

    const res = await request(server())
      .get('/admin/payments/notes?page=2&pageSize=25&visibility=private')
      .expect(200);

    const body = res.body as ResponseBody;
    expect(body.page).toBe(2);
    expect(body.pageSize).toBe(25);
    expect(noteModel.find).toHaveBeenCalledWith({ isPublic: false });
  });
});
