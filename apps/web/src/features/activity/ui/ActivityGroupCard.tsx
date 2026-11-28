'use client';

import { useId } from 'react';
import Link from 'next/link';
import type { ActivityFeedItem } from '@/shared/api/activity';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { getActivityGameMeta } from '../lib/activityGameMeta';
import { ActivityActorName } from './ActivityActor';
import { ActivityResultChip } from './ActivityResultChip';
import { useNameList } from './ActivityCard';
import {
  ActivityAvatarWithGame,
  ActivityCardAction,
  ActivityCardShell,
  ActivityTime,
  MetaLine,
  RatingDelta,
} from './ActivityCardParts';

/** Unique opponents across the run, keeping first-seen order. */
function uniqueOpponents(items: ActivityFeedItem[]) {
  const seen = new Set<string>();
  const out: ActivityFeedItem['opponents'] = [];
  for (const item of items) {
    for (const o of item.opponents) {
      const key = o.profileId ?? `${o.kind}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(o);
    }
  }
  return out;
}

/**
 * Several near-identical results by one player, e.g. "Anatoli: 5 wins in
 * Sea Battle in the last hour". Replaces the wall of identical rows.
 */
export function ActivityGroupCard({ items }: { items: ActivityFeedItem[] }) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const titleId = useId();
  const nameList = useNameList();
  const first = items[0];
  const game = getActivityGameMeta(first.gameId);
  const gameName = game?.nameKey
    ? t(game.nameKey)
    : t('home.activityFeed.someGame');
  const gameHref = game?.landingHref ? `/${locale}${game.landingHref}` : null;
  const count = items.length;
  const summaryKey =
    first.result === 'win'
      ? 'home.activityFeed.groupWins'
      : first.result === 'draw'
        ? 'home.activityFeed.groupDraws'
        : first.result === 'loss'
          ? 'home.activityFeed.groupLosses'
          : 'home.activityFeed.groupPlayed';
  const opponents = uniqueOpponents(items);
  const deltas = items
    .map((i) => i.ratingDelta)
    .filter((d): d is number => d !== null);
  const totalDelta =
    deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) : null;

  return (
    <ActivityCardShell
      accent={game?.accent ?? null}
      labelledBy={titleId}
      testId="activity-group"
    >
      <ActivityAvatarWithGame actor={first.actor} game={game} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          id={titleId}
          className="m-0 text-[13px] leading-5 text-[var(--textSecondary)]"
        >
          <ActivityActorName actor={first.actor} />{' '}
          <span className="mx-0.5" aria-hidden>
            {'·'}
          </span>{' '}
          {gameHref ? (
            <Link
              href={gameHref}
              className="font-medium text-[var(--color)] hover:underline"
            >
              {gameName}
            </Link>
          ) : (
            gameName
          )}
        </p>
        <MetaLine
          parts={[
            <span key="sum" className="font-medium text-[var(--color)]">
              {t(summaryKey, { count })}
            </span>,
            opponents.length > 0 &&
              t('home.activityFeed.versus', { names: nameList(opponents) }),
            totalDelta !== null && (
              <RatingDelta
                key="delta"
                delta={totalDelta}
                label={t('home.activityFeed.ratingLabel', {
                  delta: totalDelta,
                })}
              />
            ),
          ]}
        />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-1">
          {first.result && <ActivityResultChip result={first.result} />}
          <span
            className="rounded-full bg-[color:color-mix(in_srgb,var(--feed-accent)_16%,transparent)] px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[var(--color)]"
            aria-hidden
          >
            {`×${count}`}
          </span>
        </span>
        <ActivityTime timestamp={first.timestamp} />
        {gameHref && (
          <ActivityCardAction
            kind="game"
            href={gameHref}
            label={t('home.activityFeed.play')}
            ariaLabel={t('home.activityFeed.playAria', { game: gameName })}
          />
        )}
      </div>
    </ActivityCardShell>
  );
}
