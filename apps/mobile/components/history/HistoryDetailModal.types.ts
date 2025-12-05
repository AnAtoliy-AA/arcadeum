import type { TranslationKey } from '@/lib/i18n/messages';
import type { Replacements } from '@/lib/i18n/types';
import type {
  HistoryDetail,
  HistorySummary,
} from '@/pages/History/api/historyApi';
import type { HistoryDetailModalStyles } from './HistoryDetailModal.styles';

export type ParticipantsSelection = Record<string, boolean>;

export type TranslateFn = (
  key: TranslationKey,
  replacements?: Replacements,
) => string;

export interface HistoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSummary: HistorySummary | null;
  detail: HistoryDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  detailErrorNeedsRefresh: boolean;
  onRefreshHistoryAfterRemoval: () => void;
  isHost: boolean;
  rematchError: string | null;
  rematchLoading: boolean;
  onStartRematch: () => void;
  participantSelection: ParticipantsSelection;
  onToggleParticipant: (id: string, value: boolean) => void;
  removeError: string | null;
  removeLoading: boolean;
  onRemoveRequest: () => void;
  currentUserId: string;
  mutedTextColor: string;
  tintColor: string;
  buttonTextColor: string;
  dangerColor: string;
  t: TranslateFn;
  onSettingsPress: () => void;
  settingsDisabled?: boolean;
  settingsActive?: boolean;
}

export interface ModalHeaderProps {
  gameName: string;
  tintColor: string;
  mutedTextColor: string;
  onClose: () => void;
  onSettingsPress: () => void;
  settingsDisabled: boolean;
  settingsActive: boolean;
  insetTop: number;
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export interface LoadingStateProps {
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export interface ErrorStateProps {
  error: string;
  needsRefresh: boolean;
  buttonTextColor: string;
  onRefresh: () => void;
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export interface TimestampDisplayProps {
  lastActivityAt?: string;
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export interface RematchSectionProps {
  rematchError: string | null;
  rematchLoading: boolean;
  buttonTextColor: string;
  onStartRematch: () => void;
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export interface ParticipantsSectionProps {
  participants: HistoryDetail['summary']['participants'];
  participantSelection: ParticipantsSelection;
  isHost: boolean;
  currentUserId: string;
  tintColor: string;
  mutedTextColor: string;
  onToggleParticipant: (id: string, value: boolean) => void;
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export interface RemoveSectionProps {
  removeError: string | null;
  removeLoading: boolean;
  dangerColor: string;
  onRemoveRequest: () => void;
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export interface LogsSectionProps {
  logs: HistoryDetail['logs'];
  styles: HistoryDetailModalStyles;
  t: TranslateFn;
}

export type { HistoryDetail, HistorySummary };
