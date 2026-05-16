import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AdminUsersService } from './admin-users.service';
import { User } from '../auth/schemas/user.schema';

const oid = () => new Types.ObjectId().toString();

const buildUserDoc = (
  overrides: Partial<{
    _id: Types.ObjectId | string;
    email: string;
    username: string;
    displayName: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => {
  const _id =
    overrides._id instanceof Types.ObjectId
      ? overrides._id
      : new Types.ObjectId(
          typeof overrides._id === 'string' ? overrides._id : undefined,
        );
  return {
    _id,
    email: overrides.email ?? 'a@x.com',
    username: overrides.username ?? 'alice',
    displayName: overrides.displayName ?? null,
    role: overrides.role ?? 'free',
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-02T00:00:00Z'),
  };
};

const buildFindChain = (returnDocs: unknown[]) => ({
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDocs),
});

const buildFindByIdChain = (returnDoc: unknown) => ({
  lean: jest.fn().mockResolvedValue(returnDoc),
});

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let userModel: {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    countDocuments: jest.Mock;
  };

  beforeEach(async () => {
    userModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = moduleRef.get(AdminUsersService);
  });

  describe('list', () => {
    it('returns paginated results with sort, skip, projection', async () => {
      const docs = [buildUserDoc({ username: 'alice' })];
      const findChain = buildFindChain(docs);
      userModel.find.mockReturnValue(findChain);
      userModel.countDocuments.mockResolvedValue(1);

      const result = await service.list({ page: 1, pageSize: 50 });

      expect(userModel.find).toHaveBeenCalledWith({});
      expect(findChain.select).toHaveBeenCalledWith(
        '-passwordHash -referralCode -referredBy -usernameNormalized -blockedUsers',
      );
      expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
      expect(findChain.skip).toHaveBeenCalledWith(0);
      expect(findChain.limit).toHaveBeenCalledWith(50);
      expect(result.total).toBe(1);
      expect(result.items[0]?.username).toBe('alice');
      expect(result.items[0]?.id).toBe(docs[0]._id.toString());
    });

    it('skips correctly for higher pages', async () => {
      const findChain = buildFindChain([]);
      userModel.find.mockReturnValue(findChain);
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ page: 3, pageSize: 25 });

      expect(findChain.skip).toHaveBeenCalledWith(50);
      expect(findChain.limit).toHaveBeenCalledWith(25);
    });

    it('applies role filter', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ role: 'admin' });

      expect(userModel.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(userModel.countDocuments).toHaveBeenCalledWith({ role: 'admin' });
    });

    it('applies q across username/email/displayName with case-insensitive regex', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ q: 'alice' });

      const calls = userModel.find.mock.calls as unknown as Array<unknown[]>;
      const filter = calls[0]?.[0] as Record<string, unknown> & {
        $or?: Array<{ username?: { $regex?: string } }>;
        role?: string;
      };
      expect(filter).toEqual({
        $or: [
          { username: { $regex: 'alice', $options: 'i' } },
          { email: { $regex: 'alice', $options: 'i' } },
          { displayName: { $regex: 'alice', $options: 'i' } },
        ],
      });
    });

    it('escapes regex metacharacters in q', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ q: 'a*b+c(d' });

      const calls = userModel.find.mock.calls as unknown as Array<unknown[]>;
      const filter = calls[0]?.[0] as Record<string, unknown> & {
        $or?: Array<{ username?: { $regex?: string } }>;
        role?: string;
      };
      expect(filter.$or?.[0]?.username?.$regex).toBe('a\\*b\\+c\\(d');
    });

    it('combines q and role filters', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ q: 'al', role: 'admin' });

      const calls = userModel.find.mock.calls as unknown as Array<unknown[]>;
      const filter = calls[0]?.[0] as Record<string, unknown> & {
        $or?: Array<{ username?: { $regex?: string } }>;
        role?: string;
      };
      expect(filter.role).toBe('admin');
      expect(filter.$or).toBeDefined();
    });

    it('returns total independent of pagination slice', async () => {
      const findChain = buildFindChain([buildUserDoc()]);
      userModel.find.mockReturnValue(findChain);
      userModel.countDocuments.mockResolvedValue(123);

      const result = await service.list({ page: 1, pageSize: 1 });

      expect(result.total).toBe(123);
      expect(result.items.length).toBe(1);
    });

    it('maps doc -> AdminUserItem stripping internal fields', async () => {
      const baseDoc = buildUserDoc({
        username: 'bob',
        email: 'b@x.com',
        role: 'admin',
      });
      const doc = {
        ...baseDoc,
        passwordHash: 'should not appear',
        referralCode: 'CODE',
        usernameNormalized: 'bob',
        blockedUsers: ['x'],
      };
      userModel.find.mockReturnValue(buildFindChain([doc]));
      userModel.countDocuments.mockResolvedValue(1);

      const result = await service.list({});
      const item = result.items[0];
      expect(item).toBeDefined();
      if (!item) return;

      expect(item).toEqual({
        id: doc._id.toString(),
        email: 'b@x.com',
        username: 'bob',
        displayName: null,
        role: 'admin',
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      });
      expect(Object.keys(item)).not.toContain('passwordHash');
      expect(Object.keys(item)).not.toContain('referralCode');
      expect(Object.keys(item)).not.toContain('usernameNormalized');
      expect(Object.keys(item)).not.toContain('blockedUsers');
    });
  });

  describe('updateRole', () => {
    it('rejects malformed ObjectId with INVALID_USER_ID', async () => {
      try {
        await service.updateRole('not-an-object-id', 'admin', oid());
        fail('expected BadRequestException');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect((e as BadRequestException).getResponse()).toMatchObject({
          code: 'INVALID_USER_ID',
        });
      }
    });

    it('rejects self-edit with SELF_ROLE_CHANGE_FORBIDDEN', async () => {
      const me = oid();
      try {
        await service.updateRole(me, 'free', me);
        fail('expected ForbiddenException');
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect((e as ForbiddenException).getResponse()).toMatchObject({
          code: 'SELF_ROLE_CHANGE_FORBIDDEN',
        });
      }
    });

    it('self-check fires before existence check', async () => {
      const me = oid();
      await expect(service.updateRole(me, 'free', me)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('rejects USER_NOT_FOUND when target missing', async () => {
      userModel.findById.mockReturnValue(buildFindByIdChain(null));
      try {
        await service.updateRole(oid(), 'free', oid());
        fail('expected NotFoundException');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect((e as NotFoundException).getResponse()).toMatchObject({
          code: 'USER_NOT_FOUND',
        });
      }
    });

    it('returns existing item without saving when role unchanged', async () => {
      const target = buildUserDoc({ role: 'admin' });
      userModel.findById.mockReturnValue(buildFindByIdChain(target));

      const result = await service.updateRole(
        target._id.toString(),
        'admin',
        oid(),
      );

      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result.role).toBe('admin');
      expect(result.id).toBe(target._id.toString());
    });

    it('rejects LAST_ADMIN_PROTECTED when demoting only admin', async () => {
      const target = buildUserDoc({ role: 'admin' });
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(0);

      try {
        await service.updateRole(target._id.toString(), 'free', oid());
        fail('expected ConflictException');
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect((e as ConflictException).getResponse()).toMatchObject({
          code: 'LAST_ADMIN_PROTECTED',
        });
      }
      expect(userModel.countDocuments).toHaveBeenCalledWith({
        role: 'admin',
        _id: { $ne: target._id },
      });
    });

    it('allows admin demotion when other admins exist', async () => {
      const target = buildUserDoc({ role: 'admin' });
      const updated = { ...target, role: 'free' };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(2);
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.updateRole(
        target._id.toString(),
        'free',
        oid(),
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.role).toBe('free');
    });

    it('happy path: free -> admin updates and returns mapped item', async () => {
      const target = buildUserDoc({ role: 'free' });
      const updated = { ...target, role: 'admin' };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.updateRole(
        target._id.toString(),
        'admin',
        oid(),
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        target._id.toString(),
        { $set: { role: 'admin' } },
        { new: true, lean: true },
      );
      expect(result.role).toBe('admin');
    });
  });
});
