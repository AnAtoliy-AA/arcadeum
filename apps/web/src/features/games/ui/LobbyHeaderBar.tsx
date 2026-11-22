'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
        {isFastMode && (
          <FastBadge>
            <span>⚡</span>
            <span>{fastRoomLabel}</span>
          </FastBadge>
        )}
        {fieldSizeBadgeText && (
          <span
            data-testid="lobby-field-size-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.15)] text-[#93c5fd] shadow-sm shrink-0"
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
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#facc15] bg-[rgba(250,204,21,0.18)] text-[#ffd700] shadow-[0_4px_12px_rgba(250,204,21,0.25)] shrink-0"
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
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </IconButton>
        )}
      </HeaderActions>
    </GameHeader>
  );
}
