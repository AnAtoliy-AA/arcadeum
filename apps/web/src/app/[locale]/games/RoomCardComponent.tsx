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
  StyledRoomCard,
  StyledRoomHeader,
  StyledStatusBadge,
  StyledGameName,
  StyledRoomActions,
  ParticipantsLabel,
  FastBadge,
  FastBadgeText,
  BadgeIcon,
  RoomMeta,
  MetaGrid,
  MetaRow,
  MetaIcon,
  MetaLabel,
  MetaValue,
  MetaListContainer,
} from './room-card.styles';
import { LinkButton, Avatar } from '@arcadeum/ui';
import { XStack, YStack } from 'tamagui';

import { useRoutes } from '@/shared/config/useRoutes';

const MAX_VISIBLE_PARTICIPANTS = 4;

interface RoomCardComponentProps {
  room: GameRoomSummary;
  viewMode: 'grid' | 'list';
}

export function RoomCardComponent({ room, viewMode }: RoomCardComponentProps) {
  const { t } = useTranslation();
  const routes = useRoutes();

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
    <StyledRoomCard
      viewMode={viewMode}
      className={cardStyles.roomCard}
      data-testid="room-card"
    >
      <StyledRoomHeader viewMode={viewMode}>
        <YStack gap="$1" flex={1} minWidth={0}>
          <h3 className={cardStyles.roomTitle} title={room.name}>
            {room.name}
          </h3>
          <StyledGameName
            className={variantGradient ? 'text-gradient' : undefined}
            style={variantGradient ? { backgroundImage: variantGradient } : {}}
          >
            {gameName}
          </StyledGameName>
        </YStack>

        <XStack gap="$2" alignItems="center">
          {room.gameOptions?.idleTimerEnabled && (
            <FastBadge>
              <BadgeIcon>⚡</BadgeIcon>
              <FastBadgeText>{t('games.rooms.fastRoom')}</FastBadgeText>
            </FastBadge>
          )}
          {viewMode === 'list' && (
            <StyledStatusBadge status={room.status}>
              {t(`games.rooms.status.${room.status}`) || room.status}
            </StyledStatusBadge>
          )}
        </XStack>
      </StyledRoomHeader>

      {viewMode === 'grid' ? (
        <RoomMeta>
          <MetaGrid>
            <MetaRow>
              <MetaIcon>👑</MetaIcon>
              <YStack>
                <MetaLabel>{t('games.rooms.hostLabel')}</MetaLabel>
                <MetaValue>{room.host?.displayName || room.hostId}</MetaValue>
              </YStack>
            </MetaRow>
            <MetaRow>
              <MetaIcon>👥</MetaIcon>
              <YStack>
                <MetaLabel>{t('games.rooms.playersLabel')}</MetaLabel>
                <MetaValue>
                  {room.maxPlayers
                    ? `${room.playerCount}/${room.maxPlayers}`
                    : `${room.playerCount}`}
                </MetaValue>
              </YStack>
            </MetaRow>
            <MetaRow>
              <MetaIcon>{room.visibility === 'private' ? '🔒' : '🌐'}</MetaIcon>
              <YStack>
                <MetaLabel>{t('games.rooms.visibilityLabel')}</MetaLabel>
                <MetaValue>
                  {room.visibility === 'private'
                    ? t('games.rooms.visibility.private')
                    : t('games.rooms.visibility.public')}
                </MetaValue>
              </YStack>
            </MetaRow>
            <MetaRow>
              <MetaIcon>⏱️</MetaIcon>
              <YStack>
                <MetaLabel>{t('games.rooms.statusLabel')}</MetaLabel>
                <StyledStatusBadge status={room.status}>
                  {t(`games.rooms.status.${room.status}`) || room.status}
                </StyledStatusBadge>
              </YStack>
            </MetaRow>
          </MetaGrid>

          {room.members && room.members.length > 0 && (
            <YStack gap="$2">
              <ParticipantsLabel>
                {t('games.rooms.participants')}
              </ParticipantsLabel>
              <XStack className={cardStyles.participantAvatars}>
                {room.members
                  .slice(0, MAX_VISIBLE_PARTICIPANTS)
                  .map((member) => (
                    <div
                      key={member.id}
                      className={cardStyles.avatarOverlap}
                      title={formatMemberLabel(member)}
                    >
                      <Avatar name={formatMemberLabel(member)} size="sm" />
                    </div>
                  ))}
                {room.members.length > MAX_VISIBLE_PARTICIPANTS && (
                  <div className={cardStyles.avatarOverlap}>
                    <YStack
                      width={32}
                      height={32}
                      borderRadius={16}
                      backgroundColor="$backgroundFocus"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <MetaLabel
                        style={{ opacity: 1, fontSize: 10, fontWeight: '700' }}
                      >
                        +{room.members.length - MAX_VISIBLE_PARTICIPANTS}
                      </MetaLabel>
                    </YStack>
                  </div>
                )}
              </XStack>
            </YStack>
          )}
        </RoomMeta>
      ) : (
        <MetaListContainer>
          <MetaRow minWidth={150}>
            <MetaIcon>👑</MetaIcon>
            <MetaValue>{room.host?.displayName || room.hostId}</MetaValue>
          </MetaRow>
          <MetaRow minWidth={80}>
            <MetaIcon>👥</MetaIcon>
            <MetaValue>
              {room.maxPlayers
                ? `${room.playerCount}/${room.maxPlayers}`
                : room.playerCount}
            </MetaValue>
          </MetaRow>
          <MetaRow minWidth={100}>
            <MetaIcon>{room.visibility === 'private' ? '🔒' : '🌐'}</MetaIcon>
            <MetaValue>
              {room.visibility === 'private'
                ? t('games.rooms.visibility.private')
                : t('games.rooms.visibility.public')}
            </MetaValue>
          </MetaRow>
          {room.members && room.members.length > 0 && (
            <MetaRow minWidth={120}>
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

      <StyledRoomActions viewMode={viewMode}>
        <LinkButton
          href={routes.gameRoom(room.id)}
          variant="primary"
          size="md"
          flex={viewMode === 'grid' ? 1 : 0}
        >
          {t('games.common.joinRoom')}
        </LinkButton>
        <LinkButton
          href={`${routes.gameRoom(room.id)}?mode=watch`}
          variant="secondary"
          size="md"
          flex={viewMode === 'grid' ? 1 : 0}
        >
          {t('games.common.watchRoom')}
        </LinkButton>
      </StyledRoomActions>
    </StyledRoomCard>
  );
}
