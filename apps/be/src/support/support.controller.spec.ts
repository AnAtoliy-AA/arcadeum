import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import type { App } from 'supertest/types';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

type ServerHandle = Parameters<typeof request>[0];

describe('SupportController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let support: { submit: jest.Mock };

  beforeAll(async () => {
    support = { submit: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [{ provide: SupportService, useValue: support }],
    })
      .overrideGuard(ThrottlerGuard)
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
    support.submit.mockReset();
  });

  const valid = {
    name: 'Alice',
    email: 'alice@example.com',
    subject: 'Help',
    message: 'A real message.',
  };

  it('accepts a valid submission and calls the service', async () => {
    support.submit.mockResolvedValue({
      id: 'abc',
      status: { discord: 'sent', email: 'sent' },
    });

    const res = await request(server()).post('/support/contact').send(valid);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'abc',
      status: { discord: 'sent', email: 'sent' },
    });
    expect(support.submit).toHaveBeenCalledWith(
      expect.objectContaining(valid),
      expect.any(String),
    );
  });

  it('rejects missing required fields', async () => {
    const res = await request(server())
      .post('/support/contact')
      .send({ name: 'Alice' });
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });

  it('rejects invalid email', async () => {
    const res = await request(server())
      .post('/support/contact')
      .send({ ...valid, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });

  it('rejects when the honeypot is filled', async () => {
    const res = await request(server())
      .post('/support/contact')
      .send({ ...valid, website: 'https://spammer.example' });
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });

  it('rejects unknown fields (whitelist)', async () => {
    const res = await request(server())
      .post('/support/contact')
      .send({ ...valid, extra: 'nope' });
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });

  it('caps message length', async () => {
    const res = await request(server())
      .post('/support/contact')
      .send({ ...valid, message: 'x'.repeat(1201) });
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });
});
