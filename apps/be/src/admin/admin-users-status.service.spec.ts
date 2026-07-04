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
    isBlocked: boolean;
    blockedAt: Date | null;
    blockedReason: string | null;
    deletedAt: Date | null;
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
    isBlocked: overrides.isBlocked ?? false,
    blockedAt: overrides.blockedAt ?? null,
    blockedReason: overrides.blockedReason ?? null,
    deletedAt: overrides.deletedAt ?? null,
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

describe('AdminUsersService - Status Management', () => {
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

  describe('list with status filter', () => {
    it('applies active status filter', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ status: 'active' });

      expect(userModel.find).toHaveBeenCalledWith({
        isBlocked: { $ne: true },
        deletedAt: null,
      });
    });

    it('applies blocked status filter', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ status: 'blocked' });

      expect(userModel.find).toHaveBeenCalledWith({
        isBlocked: true,
        deletedAt: null,
      });
    });

    it('applies deleted status filter', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({ status: 'deleted' });

      expect(userModel.find).toHaveBeenCalledWith({
        deletedAt: { $ne: null },
      });
    });

    it('defaults to excluding deleted users when no status filter', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      await service.list({});

      expect(userModel.find).toHaveBeenCalledWith({
        deletedAt: null,
      });
    });
  });

  describe('block', () => {
    it('rejects malformed ObjectId with INVALID_USER_ID', async () => {
      try {
        await service.block('not-an-object-id', oid());
        fail('expected BadRequestException');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect((e as BadRequestException).getResponse()).toMatchObject({
          code: 'INVALID_USER_ID',
        });
      }
    });

    it('rejects self-block with CANNOT_BLOCK_SELF', async () => {
      const me = oid();
      try {
        await service.block(me, me);
        fail('expected ForbiddenException');
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect((e as ForbiddenException).getResponse()).toMatchObject({
          code: 'CANNOT_BLOCK_SELF',
        });
      }
    });

    it('rejects USER_NOT_FOUND when target missing', async () => {
      userModel.findById.mockReturnValue(buildFindByIdChain(null));
      try {
        await service.block(oid(), oid());
        fail('expected NotFoundException');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect((e as NotFoundException).getResponse()).toMatchObject({
          code: 'USER_NOT_FOUND',
        });
      }
    });

    it('blocks user successfully', async () => {
      const target = buildUserDoc({ isBlocked: false });
      const updated = { ...target, isBlocked: true };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.block(target._id.toString(), oid(), 'spam');

      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.isBlocked).toBe(true);
    });

    it('rejects blocking the last admin', async () => {
      const target = buildUserDoc({ role: 'admin', isBlocked: false });
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(0);

      try {
        await service.block(target._id.toString(), oid());
        fail('expected ConflictException');
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect((e as ConflictException).getResponse()).toMatchObject({
          code: 'LAST_ADMIN_PROTECTED',
        });
      }
    });
  });

  describe('unblock', () => {
    it('rejects malformed ObjectId with INVALID_USER_ID', async () => {
      try {
        await service.unblock('not-an-object-id', oid());
        fail('expected BadRequestException');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('unblocks user successfully', async () => {
      const target = buildUserDoc({ isBlocked: true });
      const updated = { ...target, isBlocked: false };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.unblock(target._id.toString(), oid());

      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.isBlocked).toBe(false);
    });
  });

  describe('softDelete', () => {
    it('rejects malformed ObjectId with INVALID_USER_ID', async () => {
      try {
        await service.softDelete('not-an-object-id', oid());
        fail('expected BadRequestException');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('rejects self-delete with CANNOT_DELETE_SELF', async () => {
      const me = oid();
      try {
        await service.softDelete(me, me);
        fail('expected ForbiddenException');
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect((e as ForbiddenException).getResponse()).toMatchObject({
          code: 'CANNOT_DELETE_SELF',
        });
      }
    });

    it('soft-deletes user successfully', async () => {
      const target = buildUserDoc({ deletedAt: null });
      const updated = { ...target, deletedAt: new Date() };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.softDelete(target._id.toString(), oid());

      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.deletedAt).not.toBeNull();
    });

    it('rejects deleting the last admin', async () => {
      const target = buildUserDoc({ role: 'admin', deletedAt: null });
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(0);

      try {
        await service.softDelete(target._id.toString(), oid());
        fail('expected ConflictException');
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect((e as ConflictException).getResponse()).toMatchObject({
          code: 'LAST_ADMIN_PROTECTED',
        });
      }
    });
  });

  describe('restore', () => {
    it('rejects malformed ObjectId with INVALID_USER_ID', async () => {
      try {
        await service.restore('not-an-object-id', oid());
        fail('expected BadRequestException');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('restores user successfully', async () => {
      const target = buildUserDoc({ deletedAt: new Date() });
      const updated = { ...target, deletedAt: null };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.restore(target._id.toString(), oid());

      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.deletedAt).toBeNull();
    });
  });
});
