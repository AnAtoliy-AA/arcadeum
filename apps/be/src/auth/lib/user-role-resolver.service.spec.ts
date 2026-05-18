import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRoleResolver } from './user-role-resolver.service';
import { User } from '../schemas/user.schema';

describe('UserRoleResolver', () => {
  it('returns "free" for null/undefined userId (anonymous)', async () => {
    const model = { findById: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole(undefined)).resolves.toBe('free');
    await expect(svc.resolveRole(null)).resolves.toBe('free');
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('reads role from User collection', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ role: 'vip' }),
        }),
      }),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole('507f1f77bcf86cd799439012')).resolves.toBe(
      'vip',
    );
  });

  it('returns "free" if user not found', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      }),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole('507f1f77bcf86cd799439011')).resolves.toBe(
      'free',
    );
  });

  it('treats anon_* userId as anonymous (does not call findById)', async () => {
    const model = { findById: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole('anon_abc123')).resolves.toBe('free');
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('treats bot_* userId as anonymous (does not call findById)', async () => {
    const model = { findById: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole('bot_xyz')).resolves.toBe('free');
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('treats invalid ObjectId as anonymous (does not call findById)', async () => {
    const model = { findById: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRoleResolver,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    const svc = moduleRef.get(UserRoleResolver);
    await expect(svc.resolveRole('not-an-object-id')).resolves.toBe('free');
    expect(model.findById).not.toHaveBeenCalled();
  });
});
