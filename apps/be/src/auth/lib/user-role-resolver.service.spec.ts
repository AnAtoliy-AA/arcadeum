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
    await expect(svc.resolveRole('u-1')).resolves.toBe('vip');
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
    await expect(svc.resolveRole('ghost')).resolves.toBe('free');
  });
});
