'use client';

import type { ReactNode } from 'react';
import { Badge, ProgressBar } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { xpProgress, toRoman } from '@/shared/lib/xp-level';
import type { PublicUserProfile } from '@/shared/api/profile';

interface ProfileHeroCardProps {
  profile: PublicUserProfile;
  /** Action buttons (share, add friend, gift, ...). */
  actions?: ReactNode;
}

/** Profile header: gradient banner, avatar, identity chips and level progress. */
export function ProfileHeroCard({ profile, actions }: ProfileHeroCardProps) {
  const { t } = useTranslation();
  const name = profile.displayName || profile.username;
  const { level, progress, xpInLevel, xpNeeded } = xpProgress(profile.xp ?? 0);
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <section
      data-testid="profile-hero"
      className="overflow-hidden rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] shadow-sm"
    >
      <div
        aria-hidden
        className="h-20 bg-gradient-to-r from-[var(--primary)]/40 via-[var(--info)]/25 to-[var(--primary)]/10 sm:h-24"
      />
      <div className="flex flex-col gap-4 px-4 pb-5 sm:px-6">
        <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-row items-end gap-4">
            <EquippedPlayerAvatar
              name={name}
              size="lg"
              equippedAvatarId={profile.equippedAvatarId}
              equippedBadgeId={profile.equippedBadgeId}
              equippedNameColorId={profile.equippedNameColorId}
              equippedFrameId={profile.equippedFrameId}
              equippedAuraId={profile.equippedAuraId}
              equippedBannerId={profile.equippedBannerId}
            />
            <div className="flex min-w-0 flex-col gap-0.5 pb-1">
              <h1
                data-testid="profile-name"
                className="m-0 truncate text-xl font-extrabold tracking-tight text-[var(--textPrimary)] sm:text-2xl"
              >
                {name}
              </h1>
              <span className="truncate text-sm text-[var(--textSecondary)]">
                @{profile.username}
              </span>
            </div>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2">
            {actions}
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center gap-1.5">
          <Badge variant="info" size="sm">
            {profile.role}
          </Badge>
          {profile.prestige > 0 && (
            <Badge variant="warning" size="sm">
              P{toRoman(profile.prestige)}
            </Badge>
          )}
          {profile.countryCode && (
            <Badge variant="neutral" size="sm">
              {profile.countryCode}
            </Badge>
          )}
          {profile.createdAt && (
            <span className="text-xs text-[var(--textMuted)]">
              {t('games.common.profile.joined', {
                date: new Date(profile.createdAt).toLocaleDateString(),
              })}
            </span>
          )}
        </div>

        <div
          data-testid="profile-level"
          className="flex flex-col gap-1.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3"
        >
          <div className="flex flex-row items-center justify-between text-sm font-semibold text-[var(--textPrimary)]">
            <span>{t('games.common.profile.level', { level })}</span>
            <span className="text-xs font-medium text-[var(--textSecondary)]">
              {t('games.common.profile.xp', {
                xp: (profile.xp ?? 0).toLocaleString(),
              })}
              {xpNeeded > 0 && ` (${xpInLevel}/${xpNeeded})`}
            </span>
          </div>
          <ProgressBar
            value={percent}
            height={6}
            ariaLabel={t('games.common.profile.level', { level })}
          />
        </div>
      </div>
    </section>
  );
}
