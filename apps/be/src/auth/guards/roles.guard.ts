import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import type { UserRole } from '../lib/roles';
import type { AuthenticatedUser } from '../jwt/jwt.strategy';
import { ROLES_KEY } from './roles.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenException();

    const user = await this.userModel
      .findById(userId)
      .select('role isBlocked deletedAt')
      .lean<{
        role: UserRole;
        isBlocked?: boolean;
        deletedAt?: Date | null;
      } | null>();
    if (!user) throw new ForbiddenException();

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been removed');
    }

    return required.includes(user.role);
  }
}
