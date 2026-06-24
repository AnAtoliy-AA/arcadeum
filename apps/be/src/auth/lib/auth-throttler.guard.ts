import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { isE2EMode } from '../../support/lib/e2e-mode';

// E2E runs hammer the password-reset endpoints across 6 Playwright projects
// and consecutive suite runs; the production per-IP cap would lock the
// suite out for an hour after the first execution. In e2e the limiter has
// nothing useful to defend against, so skip it — same approach support takes.
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected shouldSkip(): Promise<boolean> {
    return Promise.resolve(isE2EMode());
  }
}
