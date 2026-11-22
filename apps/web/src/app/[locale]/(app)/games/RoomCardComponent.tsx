'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useLanguage } from '@/shared/i18n';
import { formatRelative } from '@/shared/i18n/formatters';
import { GAME_ROOM_STATUS, type GameRoomSummary } from '@/shared/types/games';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useRoutes } from '@/shared/config/useRoutes';
import { resolveGameDisplayInfo } from '@/features/games/lib/variantRegistry';
import { cx } from '@arcadeum/ui/utils/cx';
import { LinkButton } from '@arcadeum/ui';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import styles from './RoomCardComponent.module.scss';
import {
  RoomCard,
  StatusBadge,
  GameName,
  RoomActions,
  FastBadge,
  FastBadgeText,
  RankedBadge,
  AiVsAiBadge,
  BadgeIcon,
} from './room-card-components';
import { RoomCardAvatars } from './RoomCardAvatars';
import {
  isBotRoom,
  memberLabel,
  resolveRoomCta,
  seatsLeft,
} from './roomCardUtils';

interface RoomCardComponentProps {
  room: GameRoomSummary;
  viewMode: 'grid' | 'list';
}

export function RoomCardComponent({ room, viewMode }: RoomCardComponentProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const isList = viewMode === 'list';

  const isParticipant =
    !!snapshot.userId &&
    (room.hostId === snapshot.userId ||
      room.members?.some((m) => m.id === snapshot.userId) === true);

  const {
    displayName: rawDisplayName,
    variantName,
    gradient,
  } = resolveGameDisplayInfo(room.gameId, room.gameOptions);
  const baseName =
    t(`games.${room.gameId}.name` as TranslationKey) || rawDisplayName;
  const variantLabel =
    variantName && variantName.includes('.')
      ? t(variantName as TranslationKey)
      : variantName;
  const gameName = variantLabel ? `${baseName}: ${variantLabel}` : baseName;

  const labelFor = useMemo(() => {
    const labels = {
      guest: (id: string) => t('roomsBrowser.card.guest', { id }),
      bot: t('roomsBrowser.card.bot'),
    };
    return (m: Parameters<typeof memberLabel>[0]) => memberLabel(m, labels);
  }, [t]);

  const members = useMemo(
    () => room.members ?? (room.host ? [room.host] : []),
    [room.members, room.host],
  );
  const hostLabel = room.host
    ? labelFor(room.host)
    : labelFor({ id: room.hostId });

  const isCompleted = room.status === GAME_ROOM_STATUS.COMPLETED;
  const cta = resolveRoomCta(room, isParticipant);
  const botRoom = isBotRoom(room);
  const left = seatsLeft(room);
  const canSpectate = isCompleted || !isParticipant || cta === 'full';
  const watchHref = `${routes.gameRoom(room.id)}?mode=watch`;
  const createdAgo = formatRelative(room.createdAt, locale || 'en');

  const seatsText =
    room.maxPlayers != null
      ? `${room.playerCount}/${room.maxPlayers}`
      : `${room.playerCount}`;
  const seatsHint =
    room.status === GAME_ROOM_STATUS.LOBBY && left != null && left > 0
      ? left === 1
        ? t('roomsBrowser.card.seatsLeftOne')
        : t('roomsBrowser.card.seatsLeft', { count: left })
      : null;

  const ctaLabel =
    cta === 'resume'
      ? t('roomsBrowser.card.resume')
      : botRoom
        ? t('roomsBrowser.card.play')
        : t('roomsBrowser.card.join');

  return (
    <RoomCard
      status={isCompleted ? 'completed' : undefined}
      className={cx(
        styles.roomCard,
        isList && styles.listView,
        isCompleted && styles.completed,
      )}
      data-testid="room-card"
    >
      <div className={cx('flex min-w-0 flex-col gap-1', isList && 'flex-1')}>
        <div className="flex items-center justify-between gap-2">
          <GameName gradient={gradient}>{gameName}</GameName>
          <StatusBadge status={room.status}>
            {t(`games.rooms.status.${room.status}`) || room.status}
          </StatusBadge>
        </div>
        <h3 className={styles.roomTitle} title={room.name}>
          {room.name}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {botRoom && (
            <AiVsAiBadge data-testid="bot-room-badge">
              <BadgeIcon>🤖</BadgeIcon>
              <FastBadgeText>{t('roomsBrowser.card.botRoom')}</FastBadgeText>
            </AiVsAiBadge>
          )}
          {room.gameOptions?.idleTimerEnabled && (
            <FastBadge>
              <BadgeIcon>⚡</BadgeIcon>
              <FastBadgeText>{t('games.rooms.fastRoom')}</FastBadgeText>
            </FastBadge>
          )}
          {room.gameOptions?.ranked === true && (
            <RankedBadge data-testid="ranked-badge">
              <BadgeIcon>★</BadgeIcon>
              <FastBadgeText>{t('games.rooms.ranked')}</FastBadgeText>
            </RankedBadge>
          )}
          {room.visibility === 'private' && (
            <span className="text-xs text-[var(--textSecondary)]">
              🔒 {t('roomsBrowser.card.private')}
            </span>
          )}
          {room.hasPassword && (
            <span
              className="text-xs"
              title={t('roomsBrowser.card.passwordProtected')}
              aria-label={t('roomsBrowser.card.passwordProtected')}
            >
              🔑
            </span>
          )}
        </div>
      </div>

      <div
        className={cx(
          'flex items-center justify-between gap-3',
          isList && 'w-[260px] max-[768px]:w-full',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {members.length > 0 && (
            <RoomCardAvatars members={members} labelFor={labelFor} />
          )}
          <div className="flex min-w-0 flex-col">
            <span
              className="text-sm font-semibold text-[var(--color)]"
              data-testid="room-card-seats"
            >
              {seatsText}
              <span className="ml-1 text-xs font-normal text-[var(--textSecondary)]">
                {t('roomsBrowser.card.players')}
              </span>
            </span>
            {seatsHint && (
              <span className="text-xs text-[var(--success)]">{seatsHint}</span>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-end text-xs text-[var(--textSecondary)]">
          <span className="max-w-[120px] truncate" title={hostLabel}>
            {t('roomsBrowser.card.host')}: {hostLabel}
          </span>
          <span>{createdAgo}</span>
        </div>
      </div>

      <RoomActions className={isList ? 'min-w-[180px]' : undefined}>
        {(cta === 'join' || cta === 'resume') && (
          <LinkButton
            href={routes.gameRoom(room.id)}
            variant="primary"
            size="sm"
            className="flex-1 whitespace-nowrap"
          >
            {ctaLabel}
          </LinkButton>
        )}
        {cta === 'full' && (
          <span
            className="flex flex-1 items-center justify-center rounded-xl border border-[var(--glassBorder)] px-3 text-xs font-semibold text-[var(--textSecondary)]"
            data-testid="room-card-full"
          >
            {t('roomsBrowser.card.full')}
          </span>
        )}
        {canSpectate && (
          <LinkButton
            href={watchHref}
            variant="secondary"
            size="sm"
            className={cx('whitespace-nowrap', cta === 'none' && 'flex-1')}
          >
            {t('roomsBrowser.card.spectate')}
          </LinkButton>
        )}
      </RoomActions>
    </RoomCard>
  );
}
