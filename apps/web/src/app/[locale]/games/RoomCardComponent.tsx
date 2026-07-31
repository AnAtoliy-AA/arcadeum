'use client';

import { useCallback, useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { formatRelative } from '@/shared/i18n/formatters';
import { GAME_ROOM_STATUS, type GameRoomSummary } from '@/shared/types/games';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { resolveGameDisplayInfo } from '@/features/games/lib/variantRegistry';
import cardStyles from './RoomCardComponent.module.scss';
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
} from './room-card.styles';
import { LinkButton } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { XStack, YStack } from 'tamagui';

import { useRoutes } from '@/shared/config/useRoutes';

const MAX_VISIBLE_PARTICIPANTS = 8;

interface RoomCardComponentProps {
  room: GameRoomSummary;
  viewMode: 'grid' | 'list';
}

export function RoomCardComponent({ room, viewMode }: RoomCardComponentProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();

  const isParticipant = useMemo(() => {
    if (!snapshot.userId) return false;
    return (
      room.hostId === snapshot.userId ||
      room.members?.some((m) => m.id === snapshot.userId) === true
    );
  }, [snapshot.userId, room.hostId, room.members]);

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

  const isCompleted = room.status === GAME_ROOM_STATUS.COMPLETED;

  const createdAgo = useMemo(
    () => formatRelative(room.createdAt, locale || 'en'),
    [room.createdAt, locale],
  );

  return (
    <StyledRoomCard
      status={isCompleted ? 'completed' : undefined}
      hoverStyle={
        viewMode === 'list'
          ? {
              scale: 1,
              y: -2,
              borderColor: 'rgba(122, 215, 255, 0.4)',
              backgroundColor: '$backgroundHover',
            }
          : undefined
      }
      className={`${cardStyles.roomCard} ${viewMode === 'list' ? cardStyles.listView : ''} ${isCompleted ? cardStyles.completed : ''}`}
      data-testid="room-card"
    >
      <div
        style={
          viewMode === 'list'
            ? {
                display: 'grid',
                gridTemplateColumns: '1fr 110px 120px 80px 80px 120px 200px',
                alignItems: 'center',
                gap: '0 1rem',
              }
            : undefined
        }
      >
        <StyledRoomHeader className={cardStyles.roomHeader}>
          <YStack gap="$1" minWidth={0}>
            <h3 className={cardStyles.roomTitle} title={room.name}>
              {room.name}
            </h3>
            <StyledGameName
              className={variantGradient ? 'text-gradient' : undefined}
              style={
                variantGradient ? { backgroundImage: variantGradient } : {}
              }
            >
              {gameName}
            </StyledGameName>
          </YStack>

          {room.gameOptions?.idleTimerEnabled && (
            <FastBadge>
              <BadgeIcon>⚡</BadgeIcon>
              <FastBadgeText>{t('games.rooms.fastRoom')}</FastBadgeText>
            </FastBadge>
          )}
        </StyledRoomHeader>

        {viewMode === 'list' && (
          <XStack alignItems="center" justifyContent="center">
            <StyledStatusBadge status={room.status}>
              {t(`games.rooms.status.${room.status}`) || room.status}
            </StyledStatusBadge>
          </XStack>
        )}

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
                <MetaIcon>
                  {room.visibility === 'private' ? '🔒' : '🌐'}
                </MetaIcon>
                <YStack>
                  <MetaLabel>{t('games.rooms.visibilityLabel')}</MetaLabel>
                  <MetaValue>
                    {room.visibility === 'private'
                      ? t('games.rooms.visibility.private')
                      : t('games.rooms.visibility.public')}
                    {room.hasPassword ? ' 🔑' : ''}
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
                        <EquippedPlayerAvatar
                          name={formatMemberLabel(member)}
                          size="icon"
                          equippedAvatarId={member.equippedAvatarId ?? null}
                          equippedBadgeId={member.equippedBadgeId ?? null}
                          equippedNameColorId={member.equippedNameColorId}
                          equippedFrameId={member.equippedFrameId}
                          equippedAuraId={member.equippedAuraId}
                          equippedBannerId={member.equippedBannerId}
                        />
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
                          style={{
                            opacity: 1,
                            fontSize: 10,
                            fontWeight: '700',
                          }}
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
          <>
            <XStack
              className={cardStyles.metaCol}
              gap="$1.5"
              alignItems="center"
            >
              {room.members
                ?.slice(0, MAX_VISIBLE_PARTICIPANTS)
                .map((member) => (
                  <div
                    key={member.id}
                    className={cardStyles.avatarOverlap}
                    title={formatMemberLabel(member)}
                  >
                    <EquippedPlayerAvatar
                      name={formatMemberLabel(member)}
                      size="icon"
                      equippedAvatarId={member.equippedAvatarId ?? null}
                      equippedBadgeId={member.equippedBadgeId ?? null}
                      equippedNameColorId={member.equippedNameColorId}
                      equippedFrameId={member.equippedFrameId}
                      equippedAuraId={member.equippedAuraId}
                      equippedBannerId={member.equippedBannerId}
                    />
                  </div>
                ))}
              {room.members &&
                room.members.length > MAX_VISIBLE_PARTICIPANTS && (
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
            <MetaRow className={cardStyles.metaCol}>
              <YStack gap="$0.5">
                <MetaLabel>{t('games.rooms.playersLabel')}</MetaLabel>
                <MetaValue>
                  {room.maxPlayers
                    ? `${room.playerCount}/${room.maxPlayers}`
                    : room.playerCount}
                </MetaValue>
              </YStack>
            </MetaRow>
            <MetaRow className={cardStyles.metaCol}>
              <YStack gap="$0.5">
                <MetaLabel>{t('games.rooms.visibilityLabel')}</MetaLabel>
                <MetaValue>
                  {room.visibility === 'private'
                    ? t('games.rooms.visibility.private')
                    : t('games.rooms.visibility.public')}
                  {room.hasPassword ? ' 🔑' : ''}
                </MetaValue>
              </YStack>
            </MetaRow>
            <MetaRow className={cardStyles.metaCol}>
              <YStack gap="$0.5">
                <MetaLabel>{t('games.rooms.createdLabel')}</MetaLabel>
                <MetaValue>{createdAgo}</MetaValue>
              </YStack>
            </MetaRow>
          </>
        )}

        <StyledRoomActions className={cardStyles.actionsCol}>
          {!isCompleted &&
            (room.status === GAME_ROOM_STATUS.LOBBY || isParticipant) && (
              <LinkButton
                href={routes.gameRoom(room.id)}
                variant="primary"
                size="sm"
                flex={viewMode === 'grid' ? 1 : 0}
                style={{ whiteSpace: 'nowrap' }}
              >
                {t('games.common.joinRoom')}
              </LinkButton>
            )}
          {(isCompleted ||
            room.status === GAME_ROOM_STATUS.LOBBY ||
            !isParticipant) && (
            <LinkButton
              href={`${routes.gameRoom(room.id)}?mode=watch`}
              variant="secondary"
              size="sm"
              style={{
                whiteSpace: 'nowrap',
                ...(isCompleted ? { opacity: 0.5 } : {}),
              }}
            >
              {t('games.common.watchRoom')}
            </LinkButton>
          )}
        </StyledRoomActions>
      </div>
    </StyledRoomCard>
  );
}
