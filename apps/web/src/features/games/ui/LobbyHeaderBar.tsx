'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { LobbyRoomCode } from './LobbyRoomCode';
import { LobbyStatusChip } from './LobbyChips';
import type { LobbyPhase } from './lobbyConfig';
import { RatingBadge } from '@/features/ranking/ui/RatingBadge';
import {
  RoomNameBadge,
  RoomNameIcon,
  RoomNameText,
  FastBadge,
  GameHeader,
  GameInfo,
  GameTitleText,
  VariantText,
  HeaderActions,
  IconButton,
} from './lobbyStyles';
import type { RankingTier } from '@/features/ranking/model/types';
import type { GameLobbyTheme } from './ReusableGameLobby.types';

export interface LobbyHeaderBarProps {
  gameName: string;
  variantName?: string;
  roomName: string;
  roomIcon: string;
  theme: GameLobbyTheme;
  isFastMode?: boolean;
  fastRoomLabel: string;
  fieldSizeBadgeText: string | null;
  isRanked: boolean;
  myRating?: { elo: number; tier?: RankingTier | null } | null;
  headerActionsSlot?: ReactNode;
  showFullscreenButton: boolean;
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
  roomCode?: string;
  phase?: LobbyPhase;
}

export function LobbyHeaderBar({
  gameName,
  variantName,
  roomName,
  roomIcon,
  theme,
  isFastMode,
  fastRoomLabel,
  fieldSizeBadgeText,
  isRanked,
  myRating,
  headerActionsSlot,
  showFullscreenButton,
  isFullscreen,
  onToggleFullscreen,
  roomCode,
  phase,
}: LobbyHeaderBarProps) {
  const { t } = useTranslation();
  return (
    <GameHeader>
      <GameInfo>
        <GameTitleText gradient={theme.titleGradient}>
          {gameName}
          {variantName && (
            <VariantText
              gradient={theme.variantGradient}
            >{` : ${variantName}`}</VariantText>
          )}
        </GameTitleText>
        <RoomNameBadge>
          <RoomNameIcon>{roomIcon}</RoomNameIcon>
          <RoomNameText data-testid="room-name-text">{roomName}</RoomNameText>
        </RoomNameBadge>
        {phase && <LobbyStatusChip phase={phase} />}
        {roomCode && <LobbyRoomCode code={roomCode} />}
        {isFastMode && (
          <FastBadge>
            <span>⚡</span>
            <span>{fastRoomLabel}</span>
          </FastBadge>
        )}
        {fieldSizeBadgeText && (
          <span
            data-testid="lobby-field-size-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--info)]/40 bg-[var(--info)]/15 text-[var(--textPrimary)] shadow-sm shrink-0"
          >
            <span className="text-[12px]">⊞</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.5px]">
              {fieldSizeBadgeText}
            </span>
          </span>
        )}
        {isRanked && (
          <span
            data-testid="lobby-ranked-badge"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[var(--warning)]/50 bg-[var(--warning)]/15 text-[var(--textPrimary)] shrink-0"
          >
            <span className="text-[12px]">★</span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.8px]">
              {t('games.rooms.ranked')}
            </span>
          </span>
        )}
        {isRanked && myRating && (
          <RatingBadge elo={myRating.elo} tier={myRating.tier} size="sm" />
        )}
      </GameInfo>
      <HeaderActions>
        {headerActionsSlot}
        {showFullscreenButton && onToggleFullscreen && (
          <IconButton
            onClick={onToggleFullscreen}
            title={t(
              isFullscreen
                ? 'games.lobby.exitFullscreen'
                : 'games.lobby.enterFullscreen',
            )}
            aria-label={t(
              isFullscreen
                ? 'games.lobby.exitFullscreen'
                : 'games.lobby.enterFullscreen',
            )}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </IconButton>
        )}
      </HeaderActions>
    </GameHeader>
  );
}
