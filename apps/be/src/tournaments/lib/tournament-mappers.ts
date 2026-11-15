import { Types } from 'mongoose';
import { deriveEffectiveStatus } from './derive-effective-window';
import type {
  AdminTournamentItem,
  PublicTournamentItem,
  TournamentContentMap,
  TournamentLocaleContentItem,
  TournamentGameType,
  TournamentLocale,
  TournamentStatus,
} from '../interfaces/tournament.interface';

export interface PopulatedCreator {
  _id: Types.ObjectId;
  displayName?: string | null;
}

export interface RegistrationLean {
  userId: Types.ObjectId;
  displayName?: string | null;
  registeredAt: Date;
  waitlist: boolean;
}

export interface TournamentLean {
  _id: Types.ObjectId;
  status: TournamentStatus;
  gameType: TournamentGameType;
  scheduledAt: Date;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  entryFeeCoins: number;
  prizePoolCoins: number;
  winnerUserId: string | null;
  content: TournamentContentMap;
  registrations: RegistrationLean[];
  createdBy: Types.ObjectId | PopulatedCreator;
  createdAt: Date;
  updatedAt: Date;
}

export function extractCreator(
  raw: Types.ObjectId | PopulatedCreator,
): { id: string; displayName: string | null } | null {
  if (raw instanceof Types.ObjectId) {
    return { id: raw.toString(), displayName: null };
  }
  if (raw && typeof raw === 'object' && '_id' in raw) {
    return {
      id: raw._id.toString(),
      displayName: raw.displayName ?? null,
    };
  }
  return null;
}

export function toAdminItem(d: TournamentLean): AdminTournamentItem {
  const createdBy = extractCreator(d.createdBy);
  const registeredCount = d.registrations.filter((r) => !r.waitlist).length;
  const waitlistCount = d.registrations.length - registeredCount;
  return {
    id: d._id.toString(),
    status: d.status,
    gameType: d.gameType,
    scheduledAt: d.scheduledAt.toISOString(),
    registrationOpensAt: d.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: d.registrationClosesAt?.toISOString() ?? null,
    maxPlayers: d.maxPlayers,
    prizeDescription: d.prizeDescription ?? null,
    resultText: d.resultText ?? null,
    content: d.content,
    registeredCount,
    waitlistCount,
    createdBy,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export function toPublicItem(
  d: TournamentLean,
  locale: TournamentLocale,
  isAuthenticated: boolean,
  callerUserId?: string,
  now: Date = new Date(),
): PublicTournamentItem {
  const localized: TournamentLocaleContentItem =
    d.content[locale] ?? d.content.en;
  const registeredCount = d.registrations.filter((r) => !r.waitlist).length;
  const waitlistCount = d.registrations.length - registeredCount;
  const userMatch =
    isAuthenticated && callerUserId
      ? d.registrations.find((r) => r.userId.toString() === callerUserId)
      : undefined;

  const out: PublicTournamentItem = {
    id: d._id.toString(),
    gameType: d.gameType,
    scheduledAt: d.scheduledAt.toISOString(),
    registrationOpensAt: d.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: d.registrationClosesAt?.toISOString() ?? null,
    maxPlayers: d.maxPlayers,
    prizeDescription: d.prizeDescription ?? null,
    resultText: d.resultText ?? null,
    entryFeeCoins: d.entryFeeCoins ?? 0,
    prizePoolCoins: d.prizePoolCoins ?? 0,
    status: d.status,
    effectiveStatus: deriveEffectiveStatus({
      status: d.status,
      scheduledAt: d.scheduledAt,
      registrationOpensAt: d.registrationOpensAt,
      registrationClosesAt: d.registrationClosesAt,
      now,
    }),
    registeredCount,
    waitlistCount,
    isRegistered: !!userMatch,
    isWaitlisted: !!userMatch?.waitlist,
    name: localized.name,
  };
  if (localized.description) out.description = localized.description;
  return out;
}
