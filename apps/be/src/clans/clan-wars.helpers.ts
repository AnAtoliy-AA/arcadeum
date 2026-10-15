import { Types } from 'mongoose';
import { ClanWarLogEntry, ClanWarStatus } from './schemas/clan-war.schema';

export interface ClanWarView {
  id: string;
  initiatorClanId: string;
  initiatorClanName: string;
  initiatorClanTag: string;
  initiatorScore: number;
  targetClanId: string;
  targetClanName: string;
  targetClanTag: string;
  targetClanScore: number;
  targetScore: number;
  gameId: string;
  status: ClanWarStatus;
  winnerClanId: string | null;
  expiresAt: string;
  createdAt: string;
  matchLogs: ClanWarLogEntry[];
}

export interface LeanClanWarDoc {
  _id: Types.ObjectId;
  initiatorClanId: Types.ObjectId;
  initiatorClanName: string;
  initiatorClanTag: string;
  initiatorScore: number;
  targetClanId: Types.ObjectId;
  targetClanName: string;
  targetClanTag: string;
  targetClanScore: number;
  targetScore: number;
  gameId: string;
  status: ClanWarStatus;
  winnerClanId: Types.ObjectId | null;
  expiresAt: Date;
  createdAt: Date;
  matchLogs: ClanWarLogEntry[];
}

export const DEFAULT_SEEDED_WARS = [
  {
    initiatorClanName: 'Vanguard Knights',
    initiatorClanTag: 'VNG',
    initiatorScore: 3,
    targetClanName: 'Shadow Syndicate',
    targetClanTag: 'SHD',
    targetClanScore: 2,
    targetScore: 5,
    gameId: 'sea-battle',
    status: 'active' as ClanWarStatus,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    matchLogs: [
      {
        id: 'log-1',
        playerClanId: 'seed-vng',
        playerName: 'CaptainStorm',
        opponentClanId: 'seed-shd',
        opponentName: 'NightRaven',
        gameId: 'sea-battle',
        winnerClanId: 'seed-vng',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'log-2',
        playerClanId: 'seed-shd',
        playerName: 'DarkPhantom',
        opponentClanId: 'seed-vng',
        opponentName: 'IronShield',
        gameId: 'sea-battle',
        winnerClanId: 'seed-shd',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    initiatorClanName: 'Apex Grandmasters',
    initiatorClanTag: 'APEX',
    initiatorScore: 4,
    targetClanName: 'Quantum Tacticians',
    targetClanTag: 'QT',
    targetClanScore: 1,
    targetScore: 5,
    gameId: 'chess',
    status: 'active' as ClanWarStatus,
    expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
    matchLogs: [
      {
        id: 'log-3',
        playerClanId: 'seed-apex',
        playerName: 'CheckmateKing',
        opponentClanId: 'seed-qt',
        opponentName: 'QuantumRook',
        gameId: 'chess',
        winnerClanId: 'seed-apex',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  },
];

export function mapToClanWarView(doc: LeanClanWarDoc): ClanWarView {
  return {
    id: doc._id.toString(),
    initiatorClanId: doc.initiatorClanId.toString(),
    initiatorClanName: doc.initiatorClanName,
    initiatorClanTag: doc.initiatorClanTag,
    initiatorScore: doc.initiatorScore,
    targetClanId: doc.targetClanId.toString(),
    targetClanName: doc.targetClanName,
    targetClanTag: doc.targetClanTag,
    targetClanScore: doc.targetClanScore,
    targetScore: doc.targetScore,
    gameId: doc.gameId,
    status: doc.status,
    winnerClanId: doc.winnerClanId ? doc.winnerClanId.toString() : null,
    expiresAt: doc.expiresAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    matchLogs: doc.matchLogs ?? [],
  };
}

export function determineExpiredWarWinner(
  initiatorScore: number,
  targetScore: number,
  initiatorClanId: Types.ObjectId,
  targetClanId: Types.ObjectId,
): Types.ObjectId | null {
  if (initiatorScore > targetScore) return initiatorClanId;
  if (targetScore > initiatorScore) return targetClanId;
  return null;
}
