import type {
  TournamentStatus,
  TournamentGameType,
  TournamentLocale,
} from '../schemas/tournament.schema';

export type { TournamentStatus, TournamentGameType, TournamentLocale };

export type EffectiveTournamentStatus =
  | TournamentStatus
  | 'registration_closed'
  | 'awaiting_results';

export interface TournamentLocaleContentItem {
  name: string;
  description?: string;
}

export type TournamentContentMap = Partial<
  Record<TournamentLocale, TournamentLocaleContentItem>
> & {
  en: TournamentLocaleContentItem;
};

export interface TournamentRegistrationItem {
  userId: string;
  displayName: string | null;
  registeredAt: string;
  waitlist: boolean;
}

export interface AdminTournamentItem {
  id: string;
  status: TournamentStatus;
  gameType: TournamentGameType;
  scheduledAt: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  content: TournamentContentMap;
  registeredCount: number;
  waitlistCount: number;
  createdBy: { id: string; displayName: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTournamentsListResponse {
  items: AdminTournamentItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicTournamentItem {
  id: string;
  gameType: TournamentGameType;
  scheduledAt: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  status: TournamentStatus;
  effectiveStatus: EffectiveTournamentStatus;
  registeredCount: number;
  waitlistCount: number;
  isRegistered: boolean;
  isWaitlisted: boolean;
  name: string;
  description?: string;
}

export interface PublicTournamentsListResponse {
  items: PublicTournamentItem[];
  total: number;
}

export interface RegistrationsListResponse {
  items: TournamentRegistrationItem[];
  total: number;
  page: number;
  pageSize: number;
}
