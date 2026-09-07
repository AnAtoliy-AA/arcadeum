export type CheatReason =
  | 'engine_usage'
  | 'suspicious_timing'
  | 'opening_preparation'
  | 'statistical_deviation'
  | 'multiple_accounts';

export interface CheatFlag {
  userId: string;
  reason: CheatReason;
  confidence: number;
  evidence: string[];
  flaggedAt: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface CheatAnalysis {
  sessionId: string;
  userId: string;
  engineMatchRate: number;
  avgMoveTime: number;
  moveTimeVariance: number;
  topMoveRate: number;
  openingDepth: number;
  suspicious: boolean;
  reasons: CheatReason[];
  confidence: number;
}
