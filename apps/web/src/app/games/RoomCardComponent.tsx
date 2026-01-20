'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gameMetadata } from '@/features/games/registry';
import type { GameRoomSummary } from '@/shared/types/games';
import { CARD_VARIANTS } from './create/constants';
import {
  RoomCard,
  RoomTitle,
  FastBadge,
  StatusBadge,
  RoomMeta,
  MetaRow,
  MetaIcon,
  MetaLabel,
  MetaValue,
  ParticipantsList,
  ParticipantChip,
  RoomActions,
  ActionButton,
  RoomHeader,
  BadgeIcon,
  ParticipantsLabel,
  MetaListContainer,
  GameNameValue,
} from './room-card.styles';

const MAX_VISIBLE_PARTICIPANTS = 5;

interface RoomCardComponentProps {
  room: GameRoomSummary;
  viewMode: 'grid' | 'list';
}

export function RoomCardComponent({ room, viewMode }: RoomCardComponentProps) {
  const { t } = useTranslation();

  const gameId =
    room.gameId === 'exploding_kittens_v1' ? 'critical_v1' : room.gameId;

  let gameName =
    gameMetadata[gameId as keyof typeof gameMetadata]?.name ?? room.gameId;

  let variantGradient: string | undefined;

  // Append variant name if available (specifically for Critical)
  if (
    gameId === 'critical_v1' &&
    room.gameOptions?.cardVariant &&
    room.gameOptions.cardVariant !== 'random'
  ) {
    const variant = CARD_VARIANTS.find(
      (v) => v.id === room.gameOptions?.cardVariant,
    );
    if (variant) {
      gameName = `${gameName}: ${variant.name}`;
      variantGradient = variant.gradient;
    }
  }

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
    <RoomCard key={room.id} $viewMode={viewMode}>
      {/* Header: Name and Status - column in list, row in grid */}
      <RoomHeader $viewMode={viewMode}>
        <RoomTitle title={room.name}>{room.name}</RoomTitle>
        {room.gameOptions?.idleTimerEnabled && (
          <FastBadge>
            <BadgeIcon>⚡</BadgeIcon>
            {t('games.rooms.fastRoom')}
          </FastBadge>
        )}
        {viewMode === 'list' && (
          <StatusBadge status={room.status}>
            {t(`games.rooms.status.${room.status}`) || room.status}
          </StatusBadge>
        )}
      </RoomHeader>

      {/* Meta Info */}
      {viewMode === 'grid' ? (
        <RoomMeta>
          <MetaRow>
            <MetaIcon>🎮</MetaIcon>
            <MetaLabel>{t('games.rooms.gameLabel') || 'Game'}</MetaLabel>
            <GameNameValue $gradient={variantGradient}>
              {gameName}
            </GameNameValue>
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
            <StatusBadge status={room.status}>
              {t(`games.rooms.status.${room.status}`) || room.status}
            </StatusBadge>
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
                    <ParticipantChip
                      key={member.id}
                      $isHost={room.host?.id === member.id}
                    >
                      {formatMemberLabel(member)}
                    </ParticipantChip>
                  ))}
                {room.members.length > MAX_VISIBLE_PARTICIPANTS && (
                  <ParticipantChip>
                    + {room.members.length - MAX_VISIBLE_PARTICIPANTS} more
                  </ParticipantChip>
                )}
              </ParticipantsList>
            </div>
          )}
        </RoomMeta>
      ) : (
        <MetaListContainer>
          <MetaRow title={t('games.rooms.gameLabel') || 'Game'}>
            <MetaIcon>🎮</MetaIcon>
            <GameNameValue $gradient={variantGradient}>
              {gameName}
            </GameNameValue>
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

      <RoomActions $viewMode={viewMode}>
        <ActionButton href={`/games/rooms/${room.id}`} variant="primary">
          {t('games.common.joinRoom')}
        </ActionButton>
        <ActionButton href={`/games/rooms/${room.id}`} variant="secondary">
          {t('games.common.watchRoom')}
        </ActionButton>
      </RoomActions>
    </RoomCard>
  );
}
