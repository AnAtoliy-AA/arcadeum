import { Injectable, Logger } from '@nestjs/common';
import { getGameTreat } from '@arcadeum/games-core';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import { ArcadePetFeatureService } from './arcade-pet-feature.service';

/**
 * Server-side treat rewards. Treats are minted only from a match result the
 * backend itself verified (session winners), never from client requests, and
 * only while the ArcadePet feature flag is on for the player.
 */
@Injectable()
export class ArcadePetTreatRewardService {
  private readonly logger = new Logger(ArcadePetTreatRewardService.name);

  constructor(
    private readonly collections: ArcadePetCollectionService,
    private readonly feature: ArcadePetFeatureService,
  ) {}

  /** Awards each human winner their game's treat; idempotent per session. */
  async awardWinTreats(
    gameId: string,
    winners: readonly string[],
    sessionId: string | undefined,
  ): Promise<void> {
    const treat = getGameTreat(gameId);
    if (!treat || !sessionId) return;

    const humanWinners = winners.filter(
      (id) => !id.startsWith('bot-') && !id.startsWith('anon_'),
    );
    for (const userId of humanWinners) {
      try {
        if (!(await this.feature.isEnabledFor(userId))) continue;
        await this.collections.awardTreat(userId, treat, `treat:${sessionId}`);
      } catch (err) {
        this.logger.warn(
          `Treat award failed for ${userId}: ${(err as Error).message}`,
        );
      }
    }
  }
}
