import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RefreshTokenService } from './refresh-token.service';

const userId = new Types.ObjectId();

function build(stored: Record<string, unknown>) {
  const refreshModel = {
    findOne: jest.fn().mockResolvedValue(stored),
    create: jest.fn().mockResolvedValue({ id: 'new-id' }),
    updateOne: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({}),
  };
  const userModel = {
    findById: jest.fn().mockResolvedValue({ _id: userId, email: 'a@b.c' }),
  };
  const jwt = {
    signAsync: jest.fn().mockResolvedValue('access'),
    decode: jest.fn().mockReturnValue({ exp: 9999999999 }),
  };
  const config = { get: jest.fn().mockReturnValue(undefined) };
  const service = new RefreshTokenService(
    config as never,
    refreshModel as never,
    userModel as never,
    jwt as never,
  );
  return { service, refreshModel };
}

const profile = () => ({}) as never;
const ensure = (u: never) =>
  Promise.resolve({ ...(u as object), username: 'u' }) as never;

describe('RefreshTokenService.refreshToken grace window', () => {
  const raw = 'abc.def';
  let hash: string;
  beforeAll(async () => {
    hash = await bcrypt.hash(raw, 4);
  });

  const doc = (over: Record<string, unknown>) => ({
    _id: 'doc1',
    id: 'doc1',
    userId,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 60_000),
    revoked: false,
    save: jest.fn(),
    ...over,
  });

  it('rotates a live token and stamps rotatedAt', async () => {
    const { service, refreshModel } = build(doc({}));
    const res = await service.refreshToken(raw, profile, ensure);
    expect(res.refreshToken).toBeTruthy();
    expect(refreshModel.updateOne).toHaveBeenCalledWith(
      { _id: 'doc1', revoked: false },
      { $set: { revoked: true, rotatedAt: expect.any(Date) as Date } },
    );
  });

  it('accepts a just-rotated token without revoking the family', async () => {
    const { service, refreshModel } = build(
      doc({ revoked: true, rotatedAt: new Date(Date.now() - 5_000) }),
    );
    const res = await service.refreshToken(raw, profile, ensure);
    expect(res.accessToken).toBe('access');
    expect(refreshModel.updateMany).not.toHaveBeenCalled();
  });

  it('revokes the family when a rotated token is replayed after the grace window', async () => {
    const { service, refreshModel } = build(
      doc({ revoked: true, rotatedAt: new Date(Date.now() - 120_000) }),
    );
    await expect(service.refreshToken(raw, profile, ensure)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(refreshModel.updateMany).toHaveBeenCalled();
  });

  it('does not grant grace to a revoked token with no rotatedAt', async () => {
    const { service, refreshModel } = build(doc({ revoked: true }));
    await expect(service.refreshToken(raw, profile, ensure)).rejects.toThrow(
      'Refresh token revoked',
    );
    expect(refreshModel.updateMany).toHaveBeenCalled();
  });

  it('requires a matching hash even inside the grace window', async () => {
    const { service, refreshModel } = build(
      doc({ revoked: true, rotatedAt: new Date() }),
    );
    await expect(
      service.refreshToken('abc.wrong', profile, ensure),
    ).rejects.toThrow(UnauthorizedException);
    expect(refreshModel.create).not.toHaveBeenCalled();
  });
});
