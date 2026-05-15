import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import type { UserRole } from '../auth/lib/roles';
import { escapeRegExp } from './lib/escape-regexp';
import type {
  AdminUserItem,
  AdminUsersResponse,
} from './interfaces/admin-user.interface';

interface ListArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: UserRole;
}

interface UserDocLean {
  _id: Types.ObjectId;
  email: string;
  username: string;
  displayName?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async list(args: ListArgs): Promise<AdminUsersResponse> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 50;
    const filter: Record<string, unknown> = {};
    if (args.role) filter.role = args.role;
    if (args.q && args.q.trim()) {
      const escaped = escapeRegExp(args.q.trim());
      filter.$or = [
        { username: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { displayName: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(
          '-passwordHash -referralCode -referredBy -usernameNormalized -blockedUsers',
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean<UserDocLean[]>(),
      this.userModel.countDocuments(filter),
    ]);

    const items = docs.map((doc) => this.toAdminUserItem(doc));
    return { items, total, page, pageSize };
  }

  async updateRole(
    targetId: string,
    newRole: UserRole,
    requesterUserId: string,
  ): Promise<AdminUserItem> {
    if (!Types.ObjectId.isValid(targetId)) {
      throw new BadRequestException({ code: 'INVALID_USER_ID' });
    }

    if (targetId === requesterUserId) {
      throw new ForbiddenException({ code: 'SELF_ROLE_CHANGE_FORBIDDEN' });
    }

    const target = await this.userModel
      .findById(targetId)
      .lean<UserDocLean | null>();
    if (!target) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    }

    if (target.role === newRole) {
      return this.toAdminUserItem(target);
    }

    if (newRole !== 'admin' && target.role === 'admin') {
      const otherAdminCount = await this.userModel.countDocuments({
        role: 'admin',
        _id: { $ne: target._id },
      });
      if (otherAdminCount === 0) {
        throw new ConflictException({ code: 'LAST_ADMIN_PROTECTED' });
      }
    }

    const updated = await this.userModel.findByIdAndUpdate(
      targetId,
      { $set: { role: newRole } },
      { new: true, lean: true },
    );
    if (!updated) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    }
    // Cast: Mongoose's findByIdAndUpdate with `lean: true` returns a
    // Document-shaped type that doesn't expose lean fields cleanly; the
    // cast is the simplest path. Verified at runtime by toAdminUserItem.
    return this.toAdminUserItem(updated as unknown as UserDocLean);
  }

  private toAdminUserItem(doc: UserDocLean): AdminUserItem {
    return {
      id: doc._id.toString(),
      email: doc.email,
      username: doc.username,
      displayName: doc.displayName ?? null,
      role: doc.role,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
