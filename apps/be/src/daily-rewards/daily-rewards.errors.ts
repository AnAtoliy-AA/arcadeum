/**
 * Thrown by DailyRewardsService.claim when the user has already claimed
 * today (UTC). The controller maps this to HTTP 409 Conflict.
 *
 * Kept as a plain Error subclass (not a NestJS HttpException) so the service
 * layer stays transport-agnostic and the same exception is meaningful from
 * other callers (e.g. integration tests, future job runners).
 */
export class DailyRewardAlreadyClaimedError extends Error {
  constructor(
    public readonly userId: string,
    public readonly day: string,
  ) {
    super(`Daily reward already claimed by user ${userId} on ${day}`);
    this.name = 'DailyRewardAlreadyClaimedError';
  }
}
