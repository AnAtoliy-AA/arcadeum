'use client';

import { useId, type ReactNode } from 'react';
import Link from 'next/link';
import type { ActivityFeedItem } from '@/shared/api/activity';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { getActivityGameMeta } from '../lib/activityGameMeta';
import { formatScore } from '../lib/formatActivityTime';
import { ActivityActorName, useActorLabel } from './ActivityActor';
import { ActivityResultChip } from './ActivityResultChip';
import {
  ActivityAvatarWithGame,
  ActivityCardAction,
  ActivityCardShell,
  ActivityTime,
  EventIcon,
  MetaLine,
  RatingDelta,
} from './ActivityCardParts';

const EVENT_ICONS: Record<
  Exclude<ActivityFeedItem['type'], 'game_completed'>,
  string
> = {
  achievement_unlocked:
    'M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.1l1-5.8L3.5 9.2l5.9-.9L12 3z',
  level_up: 'M12 19V5M5 12l7-7 7 7',
  win_streak:
    'M12 3c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2.5 1.5-4 2.5-5 .5 2 1.5 3 2.5 3 0-3-1-5.5 0-8z',
  tournament_won:
    'M8 4h8v5a4 4 0 01-8 0V4zM4 5h4v3a3 3 0 01-4-3zm16 0h-4v3a3 3 0 004-3zM10 15h4v3h3v2H7v-2h3v-3z',
};

/** Up to three names, then "+N". */
export function useNameList() {
  const label = useActorLabel();
  return (actors: ActivityFeedItem['opponents']): string => {
    const names = actors.map(label);
    if (names.length <= 3) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
  };
}

function useGameName(gameId: string | null): string | null {
  const { t } = useTranslation();
  const meta = getActivityGameMeta(gameId);
  return meta?.nameKey ? t(meta.nameKey) : null;
}

export function ActivityCard({ item }: { item: ActivityFeedItem }) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const titleId = useId();
  const nameList = useNameList();
  const game = getActivityGameMeta(item.gameId);
  const gameName = useGameName(item.gameId);
  const gameHref = game?.landingHref ? `/${locale}${game.landingHref}` : null;

  let summary: ReactNode = null;
  let meta: ReactNode[] = [];
  let indicator: ReactNode = null;

  if (item.type === 'game_completed') {
    summary =
      gameHref && gameName ? (
        <Link
          href={gameHref}
          className="font-medium text-[var(--color)] hover:underline"
        >
          {gameName}
        </Link>
      ) : (
        <span>{gameName ?? t('home.activityFeed.someGame')}</span>
      );
    meta = [
      item.opponents.length > 0 &&
        t('home.activityFeed.versus', { names: nameList(item.opponents) }),
      item.teammates.length > 0 &&
        t('home.activityFeed.withTeam', { names: nameList(item.teammates) }),
      item.score && (
        <span
          className="tabular-nums"
          title={t('home.activityFeed.scoreLabel')}
        >
          {formatScore(item.score)}
        </span>
      ),
      item.ratingDelta !== null && (
        <RatingDelta
          delta={item.ratingDelta}
          label={t('home.activityFeed.ratingLabel', {
            delta: item.ratingDelta,
          })}
        />
      ),
    ];
    indicator = item.result ? (
      <ActivityResultChip result={item.result} endReason={item.endReason} />
    ) : null;
  } else {
    if (item.type === 'achievement_unlocked') {
      summary = t('home.activityFeed.achievementUnlocked', {
        name: item.achievement?.name || t('home.activityFeed.anAchievement'),
      });
    } else if (item.type === 'level_up') {
      summary = t('home.activityFeed.levelUp', { level: item.level ?? 0 });
    } else if (item.type === 'win_streak') {
      summary = t('home.activityFeed.winStreak', { count: item.streak ?? 0 });
    } else {
      summary = item.tournament?.name
        ? t('home.activityFeed.tournamentWon', { name: item.tournament.name })
        : t('home.activityFeed.tournamentWonUnnamed');
    }
    meta = [gameName];
    indicator = <EventIcon path={EVENT_ICONS[item.type]} />;
  }

  const action = item.replayId ? (
    <ActivityCardAction
      kind="replay"
      href={`/${locale}/replay/${encodeURIComponent(item.replayId)}`}
      label={t('home.activityFeed.replay')}
      ariaLabel={t('home.activityFeed.replayAria', { game: gameName ?? '' })}
    />
  ) : gameHref && gameName ? (
    <ActivityCardAction
      kind="game"
      href={gameHref}
      label={t('home.activityFeed.play')}
      ariaLabel={t('home.activityFeed.playAria', { game: gameName })}
    />
  ) : null;

  return (
    <ActivityCardShell
      accent={game?.accent ?? null}
      labelledBy={titleId}
      testId="activity-card"
    >
      <ActivityAvatarWithGame actor={item.actor} game={game} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          id={titleId}
          className="m-0 text-[13px] leading-5 text-[var(--textSecondary)]"
        >
          <ActivityActorName actor={item.actor} />{' '}
          <span className="mx-0.5" aria-hidden>
            {'·'}
          </span>{' '}
          {summary}
        </p>
        <MetaLine parts={meta} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {indicator}
        <ActivityTime timestamp={item.timestamp} />
        {action}
      </div>
    </ActivityCardShell>
  );
}
