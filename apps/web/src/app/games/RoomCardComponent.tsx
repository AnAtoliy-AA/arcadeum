'use client';

import { useCallback } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { resolveGameDisplayInfo } from '@/features/games/lib/variantRegistry';
import cardStyles from './RoomCardComponent.module.css';
import {
  getRoomCardStyle,
  getRoomHeaderStyle,
  getStatusBadgeStyle,
  getGameNameValueStyle,
  getRoomActionsStyle,
  getParticipantChipStyle,
  RoomMeta,
  MetaRow,
  MetaIcon,
  MetaLabel,
  MetaValue,
  ParticipantsList,
  ParticipantsLabel,
  MetaListContainer,
  FastBadge,
  BadgeIcon,
} from './room-card.styles';
import { LinkButton } from '@arcadeum/ui';

import { routes } from '@/shared/config/routes';

const MAX_VISIBLE_PARTICIPANTS = 5;

interface RoomCardComponentProps {
  room: GameRoomSummary;
  viewMode: 'grid' | 'list';
}

export function RoomCardComponent({ room, viewMode }: RoomCardComponentProps) {
  const { t } = useTranslation();

  const {
    displayName: rawDisplayName,
    variantName,
    gradient: variantGradient,
  } = resolveGameDisplayInfo(room.gameId, room.gameOptions);

  const translatedGameName =
    t(`games.${room.gameId}.name` as TranslationKey) || rawDisplayName;
  const translatedVariantName = variantName
    ? t(variantName as TranslationKey)
    : undefined;
  const gameName = translatedVariantName
    ? `${translatedGameName}: ${translatedVariantName}`
    : translatedGameName;

  const formatMemberLabel = useCallback(
    (member: {
      id: string;
      displayName: string;
      username?: string | null;
      email?: string | null;
      isHost: boolean;
    }) => {
      if (member.displayName && member.displayName.trim().length > 0) {
        return member.displayName;
      }
      return member.username ?? member.email ?? member.id;
    },
    [],
  );

  return (
    <div
      className={cardStyles.roomCard}
      style={getRoomCardStyle(viewMode)}
      data-testid="room-card"
    >
      {/* Header: Name and Status - column in list, row in grid */}
      <div style={getRoomHeaderStyle(viewMode)}>
        <h3 className={cardStyles.roomTitle} title={room.name}>
          {room.name}
        </h3>
        {room.gameOptions?.idleTimerEnabled && (
          <FastBadge>
            <BadgeIcon>⚡</BadgeIcon>
            {t('games.rooms.fastRoom')}
          </FastBadge>
        )}
        {viewMode === 'list' && (
          <span style={getStatusBadgeStyle(room.status)}>
            {t(`games.rooms.status.${room.status}`) || room.status}
          </span>
        )}
      </div>

      {/* Meta Info */}
      {viewMode === 'grid' ? (
        <RoomMeta>
          <MetaRow>
            <MetaIcon>🎮</MetaIcon>
            <MetaLabel>{t('games.rooms.gameLabel') || 'Game'}</MetaLabel>
            <span style={getGameNameValueStyle(variantGradient)}>
              {gameName}
            </span>
          </MetaRow>
          <MetaRow>
            <MetaIcon>👑</MetaIcon>
            <MetaLabel>{t('games.rooms.hostLabel')}</MetaLabel>
            <MetaValue>{room.host?.displayName || room.hostId}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaIcon>👥</MetaIcon>
            <MetaLabel>{t('games.rooms.playersLabel')}</MetaLabel>
            <MetaValue>
              {room.maxPlayers
                ? `${room.playerCount}/${room.maxPlayers}`
                : `${room.playerCount}`}
            </MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaIcon>⏱️</MetaIcon>
            <MetaLabel>{t('games.rooms.statusLabel')}</MetaLabel>
            <span style={getStatusBadgeStyle(room.status)}>
              {t(`games.rooms.status.${room.status}`) || room.status}
            </span>
          </MetaRow>
          <MetaRow>
            <MetaIcon>{room.visibility === 'private' ? '🔒' : '🌐'}</MetaIcon>
            <MetaLabel>{t('games.rooms.visibilityLabel')}</MetaLabel>
            <MetaValue>
              {room.visibility === 'private'
                ? t('games.rooms.visibility.private')
                : t('games.rooms.visibility.public')}
            </MetaValue>
          </MetaRow>
          {room.members && room.members.length > 0 && (
            <div>
              <ParticipantsLabel>
                {t('games.rooms.participants')}:
              </ParticipantsLabel>
              <ParticipantsList>
                {room.members
                  .slice(0, MAX_VISIBLE_PARTICIPANTS)
                  .map((member) => (
                    <span
                      key={member.id}
                      style={getParticipantChipStyle(
                        room.host?.id === member.id,
                      )}
                    >
                      {formatMemberLabel(member)}
                    </span>
                  ))}
                {room.members.length > MAX_VISIBLE_PARTICIPANTS && (
                  <span style={getParticipantChipStyle()}>
                    + {room.members.length - MAX_VISIBLE_PARTICIPANTS} more
                  </span>
                )}
              </ParticipantsList>
            </div>
          )}
        </RoomMeta>
      ) : (
        <MetaListContainer>
          <MetaRow>
            <MetaIcon>🎮</MetaIcon>
            <span style={getGameNameValueStyle(variantGradient)}>
              {gameName}
            </span>
          </MetaRow>
          <MetaRow>
            <MetaIcon>👑</MetaIcon>
            <MetaValue>{room.host?.displayName || room.hostId}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaIcon>👥</MetaIcon>
            <MetaValue>
              {room.maxPlayers
                ? `${room.playerCount}/${room.maxPlayers}`
                : room.playerCount}
            </MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaIcon>{room.visibility === 'private' ? '🔒' : '🌐'}</MetaIcon>
            <MetaValue>
              {room.visibility === 'private'
                ? t('games.rooms.visibility.private')
                : t('games.rooms.visibility.public')}
            </MetaValue>
          </MetaRow>
          {room.members && room.members.length > 0 && (
            <MetaRow>
              <MetaIcon>👤</MetaIcon>
              <MetaValue>
                {t('games.lounge.participantsCount', {
                  count: room.members.length,
                })}
              </MetaValue>
            </MetaRow>
          )}
        </MetaListContainer>
      )}

      <div style={getRoomActionsStyle(viewMode)}>
        <LinkButton href={routes.gameRoom(room.id)} variant="primary" size="sm">
          {t('games.common.joinRoom')}
        </LinkButton>
        <LinkButton
          href={routes.gameRoom(room.id)}
          variant="secondary"
          size="sm"
        >
          {t('games.common.watchRoom')}
        </LinkButton>
      </div>
    </div>
  );
}
