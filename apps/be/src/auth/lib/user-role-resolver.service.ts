import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, type UserDocument } from '../schemas/user.schema';
import type { UserRole } from './roles';

@Injectable()
export class UserRoleResolver {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async resolveRole(userId: string | null | undefined): Promise<UserRole> {
    if (!userId) return 'free';
    if (userId.startsWith('anon_') || userId.startsWith('bot_')) return 'free';
    if (!isValidObjectId(userId)) return 'free';
    const doc = await this.userModel
      .findById(userId)
      .select('role')
      .lean<{ role: UserRole } | null>();
    return doc?.role ?? 'free';
  }
}
