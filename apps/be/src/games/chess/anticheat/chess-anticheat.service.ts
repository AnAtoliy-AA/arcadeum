import { Injectable, Logger } from '@nestjs/common';
import type { CheatAnalysis, CheatFlag, CheatReason } from './chess-anticheat.types';

@Injectable()
export class ChessAnticheatService {
  private readonly logger = new Logger(ChessAnticheatService.name);
  private readonly flags = new Map<string, CheatFlag[]>();

  async analyzeGame(
    sessionId: string,
    userId: string,
    moveTimes: number[],
    engineMatchCount: number,
    totalMoves: number,
    playerRating: number,
  ): Promise<CheatAnalysis> {
    const engineMatchRate = totalMoves > 0 ? engineMatchCount / totalMoves : 0;
    const avgMoveTime =
      moveTimes.length > 0
        ? moveTimes.reduce((a, b) => a + b, 0) / moveTimes.length
        : 0;
    const moveTimeVariance = this.calculateVariance(moveTimes);
    const topMoveRate = engineMatchRate;

    const expectedAccuracy = this.expectedAccuracyForRating(playerRating);
    const deviation = engineMatchRate - expectedAccuracy;

    const reasons: CheatReason[] = [];
    let confidence = 0;

    if (engineMatchRate > 0.9 && playerRating < 2000) {
      reasons.push('engine_usage');
      confidence += 0.4;
    }

    if (moveTimeVariance < 0.1 && moveTimes.length > 10) {
      reasons.push('suspicious_timing');
      confidence += 0.2;
    }

    if (deviation > 0.3) {
      reasons.push('statistical_deviation');
      confidence += 0.3;
    }

    confidence = Math.min(confidence, 1.0);
    const suspicious = confidence > 0.5;

    const analysis: CheatAnalysis = {
      sessionId,
      userId,
      engineMatchRate,
      avgMoveTime,
      moveTimeVariance,
      topMoveRate,
      openingDepth: 0,
      suspicious,
      reasons,
      confidence,
    };

    if (suspicious) {
      this.logger.warn(
        `Suspicious activity detected for user ${userId} in session ${sessionId}: confidence=${confidence.toFixed(2)}`,
      );
    }

    return analysis;
  }

  flagUser(userId: string, reason: CheatReason, confidence: number, evidence: string[]): void {
    const existing = this.flags.get(userId) ?? [];
    existing.push({
      userId,
      reason,
      confidence,
      evidence,
      flaggedAt: new Date(),
      reviewed: false,
    });
    this.flags.set(userId, existing);
  }

  getFlaggedUsers(): CheatFlag[] {
    const all: CheatFlag[] = [];
    for (const flags of this.flags.values()) {
      all.push(...flags.filter((f) => !f.reviewed));
    }
    return all;
  }

  adjustConfidence(userId: string, newEvidence: string): void {
    const flags = this.flags.get(userId);
    if (!flags) return;
    const unreviewed = flags.find((f) => !f.reviewed);
    if (unreviewed) {
      unreviewed.evidence.push(newEvidence);
      unreviewed.confidence = Math.min(unreviewed.confidence + 0.1, 1.0);
    }
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => (v - mean) ** 2);
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private expectedAccuracyForRating(rating: number): number {
    if (rating < 800) return 0.3;
    if (rating < 1200) return 0.4;
    if (rating < 1600) return 0.5;
    if (rating < 2000) return 0.6;
    if (rating < 2400) return 0.7;
    return 0.8;
  }
}
