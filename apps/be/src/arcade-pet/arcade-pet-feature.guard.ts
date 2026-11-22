import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { ArcadePetFeatureService } from './arcade-pet-feature.service';

/** Runs after JwtAuthGuard; answers 404 for every route while the flag is off. */
@Injectable()
export class ArcadePetFeatureGuard implements CanActivate {
  constructor(private readonly feature: ArcadePetFeatureService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    // JwtAuthGuard stores the validated payload on `req.user`; Express types
    // it as an untyped `User`, so it is narrowed to the strategy's payload.
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    await this.feature.assertEnabledFor(user.userId);
    return true;
  }
}
