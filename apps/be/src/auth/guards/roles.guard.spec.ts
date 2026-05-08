import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesGuard } from './roles.guard';
import { User } from '../schemas/user.schema';

type MockUserModel = {
  findById: jest.Mock;
};

const buildContext = (
  user: { userId?: string } | undefined,
): ExecutionContext => {
  const handler = function handler() {};
  const cls = class Anon {};
  return {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
};

const buildModel = (role: string | null): MockUserModel => ({
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(role === null ? null : { role }),
    }),
  }),
});

describe('RolesGuard', () => {
  let reflector: Reflector;

  const setup = async (model: MockUserModel) => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    reflector = moduleRef.get(Reflector);
    return moduleRef.get(RolesGuard);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('falls open when no @Roles() metadata is present', async () => {
    const model = buildModel('free');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ok = await guard.canActivate(buildContext({ userId: 'u1' }));
    expect(ok).toBe(true);
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('allows when DB role matches one of the required roles', async () => {
    const model = buildModel('admin');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ok = await guard.canActivate(buildContext({ userId: 'u1' }));
    expect(ok).toBe(true);
  });

  it('denies when DB role does not match', async () => {
    const model = buildModel('developer');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ok = await guard.canActivate(buildContext({ userId: 'u1' }));
    expect(ok).toBe(false);
  });

  it('throws ForbiddenException when DB lookup returns null (deleted user)', async () => {
    const model = buildModel(null);
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    await expect(
      guard.canActivate(buildContext({ userId: 'u1' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when req.user is missing', async () => {
    const model = buildModel('admin');
    const guard = await setup(model);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    await expect(guard.canActivate(buildContext(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
