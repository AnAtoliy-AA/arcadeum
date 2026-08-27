import { Injectable } from '@nestjs/common';

export interface PotRakeResult {
  netPot: number;
  rakeAmount: number;
}

export interface MatchLossRecord {
  opponentId: string;
  coinsLost: number;
}

export interface MatchForfeitRecord {
  opponentId: string;
  outcome: 'win' | 'loss' | 'forfeit';
  durationSeconds: number;
}

export interface WinConcentrationResult {
  suspicious: boolean;
  targetOpponentId?: string;
  concentrationRatio: number;
  totalCoinsLost: number;
}

export interface RapidForfeitResult {
  suspicious: boolean;
  targetOpponentId?: string;
  forfeitCount: number;
}

@Injectable()
export class AntiCollusionService {
  calculatePotRake(
    potAmount: number,
    rakePercent = 0.03,
    maxRakeCap?: number,
  ): PotRakeResult {
    if (potAmount <= 0 || rakePercent <= 0) {
      return { netPot: Math.max(0, potAmount), rakeAmount: 0 };
    }

    const rawRake = potAmount * rakePercent;
    const cappedRake =
      maxRakeCap !== undefined && maxRakeCap >= 0
        ? Math.min(rawRake, maxRakeCap)
        : rawRake;
    const rakeAmount = Math.floor(cappedRake);
    const netPot = potAmount - rakeAmount;

    return { netPot, rakeAmount };
  }

  detectWinConcentration(
    losses: MatchLossRecord[],
    threshold = 0.8,
    minTotalLost = 100,
  ): WinConcentrationResult {
    if (!losses || losses.length === 0) {
      return { suspicious: false, concentrationRatio: 0, totalCoinsLost: 0 };
    }

    let totalCoinsLost = 0;
    const lossByOpponent = new Map<string, number>();

    for (const record of losses) {
      if (record.coinsLost > 0) {
        totalCoinsLost += record.coinsLost;
        const current = lossByOpponent.get(record.opponentId) ?? 0;
        lossByOpponent.set(record.opponentId, current + record.coinsLost);
      }
    }

    if (totalCoinsLost < minTotalLost) {
      return { suspicious: false, concentrationRatio: 0, totalCoinsLost };
    }

    let maxLostToSingle = 0;
    let targetOpponentId: string | undefined;

    for (const [oppId, lostAmount] of lossByOpponent.entries()) {
      if (lostAmount > maxLostToSingle) {
        maxLostToSingle = lostAmount;
        targetOpponentId = oppId;
      }
    }

    const concentrationRatio =
      totalCoinsLost > 0 ? maxLostToSingle / totalCoinsLost : 0;
    const suspicious = concentrationRatio >= threshold;

    return {
      suspicious,
      targetOpponentId: suspicious ? targetOpponentId : undefined,
      concentrationRatio,
      totalCoinsLost,
    };
  }

  detectRapidForfeits(
    matches: MatchForfeitRecord[],
    minForfeits = 3,
    maxDurationSeconds = 30,
  ): RapidForfeitResult {
    if (!matches || matches.length === 0) {
      return { suspicious: false, forfeitCount: 0 };
    }

    const forfeitsByOpponent = new Map<string, number>();

    for (const match of matches) {
      if (
        match.outcome === 'forfeit' &&
        match.durationSeconds <= maxDurationSeconds
      ) {
        const count = (forfeitsByOpponent.get(match.opponentId) ?? 0) + 1;
        forfeitsByOpponent.set(match.opponentId, count);
      }
    }

    for (const [oppId, count] of forfeitsByOpponent.entries()) {
      if (count >= minForfeits) {
        return {
          suspicious: true,
          targetOpponentId: oppId,
          forfeitCount: count,
        };
      }
    }

    return { suspicious: false, forfeitCount: 0 };
  }
}
