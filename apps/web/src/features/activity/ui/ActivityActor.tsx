'use client';

import Link from 'next/link';
import { cx } from '@arcadeum/ui/utils/cx';
import type { ActivityFeedActor } from '@/shared/api/activity';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';

/** Display label for an actor: public name, or a neutral role label. */
export function useActorLabel() {
  const { t } = useTranslation();
  return (actor: ActivityFeedActor): string => {
    if (actor.kind === 'user' && actor.name) return actor.name;
    if (actor.kind === 'bot') return t('home.activityFeed.bot');
    if (actor.kind === 'guest') return t('home.activityFeed.guest');
    return t('home.activityFeed.hiddenPlayer');
  };
}

export function ActivityActorAvatar({ actor }: { actor: ActivityFeedActor }) {
  const label = useActorLabel()(actor);
  return (
    <span aria-hidden className="shrink-0">
      <EquippedPlayerAvatar
        name={label}
        size="icon"
        equippedAvatarId={actor.avatarId}
        equippedBadgeId={null}
        equippedFrameId={actor.frameId}
        role={actor.role}
      />
    </span>
  );
}

interface ActivityActorNameProps {
  actor: ActivityFeedActor;
  className?: string;
}

/** Name linking to the public profile; plain text for guests and bots. */
export function ActivityActorName({
  actor,
  className,
}: ActivityActorNameProps) {
  const routes = useRoutes();
  const label = useActorLabel()(actor);
  const base = cx('font-semibold text-[var(--color)]', className);
  if (actor.kind === 'user' && actor.profileId) {
    return (
      <Link
        href={routes.playerProfile(actor.profileId)}
        className={cx(
          base,
          'rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
        )}
      >
        {label}
      </Link>
    );
  }
  return (
    <span
      className={cx(
        base,
        actor.kind !== 'user' && 'font-medium text-[var(--textSecondary)]',
      )}
    >
      {label}
    </span>
  );
}
