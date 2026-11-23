import { Injectable } from '@nestjs/common';
import type {
  TournamentDocument,
  TournamentLocale,
} from '../schemas/tournament.schema';
import {
  WeeklyCupsService,
  computeNextCupDate,
} from '../weekly-cups/weekly-cups.service';
import { WEEKLY_CUP_DEFINITIONS } from '../weekly-cups/weekly-cups.config';
import type {
  SeaBattleBlitzCupConfig,
  SeaBattleBlitzCupResponse,
} from './sea-battle-blitz.types';
import type { WeeklyCupConfigUpdate } from '../weekly-cups/weekly-cups.types';

export function computeNextBlitzCupDate(now: Date = new Date()): Date {
  return computeNextCupDate(WEEKLY_CUP_DEFINITIONS['sea-battle'], now);
}

/**
 * Backwards-compatible Sea Battle facade over the shared WeeklyCupsService
 * (ARC-966). New games should use WeeklyCupsService directly.
 */
@Injectable()
export class SeaBattleBlitzService {
  constructor(private readonly cups: WeeklyCupsService) {}

  getBlitzCupConfig(): Promise<SeaBattleBlitzCupConfig> {
    return this.cups.getConfig('sea-battle');
  }

  isBlitzCupEnabled(): Promise<boolean> {
    return this.cups.isEnabled('sea-battle');
  }

  updateBlitzCupConfig(
    dto: WeeklyCupConfigUpdate,
    updatedBy?: string,
  ): Promise<{ ok: boolean } & SeaBattleBlitzCupConfig> {
    return this.cups.updateConfig('sea-battle', dto, updatedBy);
  }

  setBlitzCupEnabled(
    enabled: boolean,
    updatedBy?: string,
  ): Promise<{ ok: boolean } & SeaBattleBlitzCupConfig> {
    return this.cups.updateConfig('sea-battle', { enabled }, updatedBy);
  }

  ensureUpcomingBlitzCup(): Promise<TournamentDocument | null> {
    return this.cups.ensureUpcomingCup('sea-battle');
  }

  startBlitzCupIfDue(): Promise<void> {
    return this.cups.startCupIfDue('sea-battle');
  }

  getSeaBattleBlitzCup(
    locale: TournamentLocale,
    isAuthenticated: boolean,
    callerUserId?: string,
  ): Promise<SeaBattleBlitzCupResponse> {
    return this.cups.getCup(
      'sea-battle',
      locale,
      isAuthenticated,
      callerUserId,
    );
  }

  reportMatchResult(
    tournamentId: string,
    round: number,
    matchIndex: number,
    winnerUserId: string,
  ): Promise<void> {
    return this.cups.reportMatchResult(
      tournamentId,
      round,
      matchIndex,
      winnerUserId,
    );
  }
}
