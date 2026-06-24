import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { OriginGuard } from './lib/origin.guard';

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
      .overrideGuard(OriginGuard)
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
    message: 'A real message long enough to pass.',
    submittedAt: Date.now() - 5000,
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

  it('rejects messages shorter than 10 chars', async () => {
    const res = await request(server())
      .post('/support/contact')
      .send({ ...valid, message: 'too short' });
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });

  it('rejects messages with >2 URLs (link-spam cap)', async () => {
    const res = await request(server())
      .post('/support/contact')
      .send({
        ...valid,
        message:
          'Check https://a.com and https://b.com and https://c.com please',
      });
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });

  it('rejects when submittedAt is missing', async () => {
    const { submittedAt: _drop, ...withoutTs } = valid;
    void _drop;
    const res = await request(server())
      .post('/support/contact')
      .send(withoutTs);
    expect(res.status).toBe(400);
    expect(support.submit).not.toHaveBeenCalled();
  });
});
