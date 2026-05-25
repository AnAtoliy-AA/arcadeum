import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { isE2EMode } from './e2e-mode';

// Wraps ThrottlerGuard with an E2E bypass. Playwright runs 6 projects, each
// posts once — under the production 5/hour/IP cap the last project always
// gets 429, and consecutive test-suite runs saturate the bucket fast. In
// e2e the rate limiter has nothing useful to defend against, so skip it.
@Injectable()
export class SupportThrottlerGuard extends ThrottlerGuard {
  protected shouldSkip(): Promise<boolean> {
    return Promise.resolve(isE2EMode());
  }
}
