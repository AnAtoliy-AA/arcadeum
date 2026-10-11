'use client';

import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

interface Game2048MilestoneToastProps {
  milestone: number | null;
  onDismiss: () => void;
}

interface MilestoneTier {
  icon: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  cardClass: string;
  iconBgClass: string;
  badgeClass: string;
  btnClass: string;
  sparkles: string[];
  haloClass?: string;
  ambientGlowClass?: string;
}

function getTierConfig(milestone: number): MilestoneTier {
  if (milestone >= 8192) {
    return {
      icon: '🌌',
      badgeKey: 'games.game_2048_v1.milestone.badge_8192' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_8192' as TranslationKey,
      cardClass:
        'border-2 border-cyan-300 bg-neutral-950/95 shadow-[0_0_50px_rgba(6,182,212,0.65)] ring-2 ring-cyan-300/80 text-cyan-100',
      iconBgClass:
        'bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/50',
      badgeClass:
        'border-cyan-300/70 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
      btnClass:
        'bg-cyan-300 hover:bg-cyan-200 text-black shadow-lg shadow-cyan-300/40',
      sparkles: ['✨', '🌌', '⚡', '🌟'],
      ambientGlowClass:
        'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 opacity-40 blur-md',
    };
  }

  if (milestone >= 4096) {
    return {
      icon: '💎',
      badgeKey: 'games.game_2048_v1.milestone.badge_4096' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_4096' as TranslationKey,
      cardClass:
        'border-2 border-fuchsia-400 bg-neutral-950/95 shadow-[0_0_40px_rgba(217,70,239,0.55)] ring-2 ring-fuchsia-400/70 text-fuchsia-100',
      iconBgClass:
        'bg-gradient-to-br from-fuchsia-400 via-purple-500 to-pink-600 text-white shadow-lg shadow-fuchsia-500/50',
      badgeClass:
        'border-fuchsia-300/60 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.4)]',
      btnClass:
        'bg-fuchsia-400 hover:bg-fuchsia-300 text-black shadow-lg shadow-fuchsia-400/40',
      sparkles: ['✨', '💎', '🌟'],
      ambientGlowClass: 'bg-fuchsia-500/35 blur-md',
    };
  }

  if (milestone >= 2048) {
    return {
      icon: '👑',
      badgeKey: 'games.game_2048_v1.milestone.badge_2048' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_2048' as TranslationKey,
      cardClass:
        'border-2 border-yellow-300 bg-neutral-950/95 shadow-[0_0_35px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/70 text-yellow-100',
      iconBgClass:
        'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50',
      badgeClass:
        'border-yellow-300/70 bg-yellow-500/25 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.4)]',
      btnClass:
        'bg-yellow-300 hover:bg-yellow-200 text-black shadow-lg shadow-yellow-300/40',
      sparkles: ['✨', '👑', '🎉'],
      haloClass: 'bg-yellow-400/40 blur-sm',
    };
  }

  if (milestone >= 1024) {
    return {
      icon: '🔥',
      badgeKey: 'games.game_2048_v1.milestone.badge_1024' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_1024' as TranslationKey,
      cardClass:
        'border-2 border-orange-400/80 bg-neutral-950/95 shadow-2xl shadow-orange-500/30 ring-1 ring-orange-400/50 text-orange-100',
      iconBgClass:
        'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/30',
      badgeClass: 'border-orange-400/40 bg-orange-500/15 text-orange-200',
      btnClass:
        'bg-orange-400 hover:bg-orange-300 text-black shadow-md shadow-orange-400/30',
      sparkles: [],
    };
  }

  if (milestone >= 512) {
    return {
      icon: '⚡',
      badgeKey: 'games.game_2048_v1.milestone.badge_512' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_512' as TranslationKey,
      cardClass:
        'border-2 border-amber-400/80 bg-neutral-950/95 shadow-2xl shadow-amber-500/25 ring-1 ring-amber-400/40 text-amber-100',
      iconBgClass:
        'bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/30',
      badgeClass: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
      btnClass:
        'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-400/30',
      sparkles: [],
    };
  }

  return {
    icon: '⚡',
    badgeKey: 'games.game_2048_v1.milestone.badge' as TranslationKey,
    titleKey: 'games.game_2048_v1.milestone.title' as TranslationKey,
    cardClass:
      'border-2 border-amber-400/80 bg-neutral-950/95 shadow-2xl shadow-amber-500/25 ring-1 ring-amber-400/40 text-amber-100',
    iconBgClass:
      'bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/30',
    badgeClass: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
    btnClass:
      'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-400/30',
    sparkles: [],
  };
}

export function Game2048MilestoneToast({
  milestone,
  onDismiss,
}: Game2048MilestoneToastProps) {
  const { t } = useTranslation();

  if (milestone === null) return null;

  const tier = getTierConfig(milestone);
  const title = t(tier.titleKey) || t('games.game_2048_v1.milestone.title');
  const badge = t(tier.badgeKey) || t('games.game_2048_v1.milestone.badge');

  return (
    <div
      data-testid="game-2048-milestone-toast"
      onAnimationEnd={onDismiss}
      className={cx(
        'fixed z-[120] bottom-4 inset-x-4 mx-auto max-w-sm sm:bottom-auto sm:inset-x-auto sm:top-20 sm:right-6 sm:mx-0 flex items-center justify-between gap-2.5 rounded-2xl p-2.5 sm:p-3 backdrop-blur-2xl animate-milestone-toast pointer-events-auto select-none overflow-visible',
        tier.cardClass,
      )}
    >
      {tier.ambientGlowClass && (
        <div
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute -inset-1 rounded-2xl -z-10 animate-pulse',
            tier.ambientGlowClass,
          )}
        />
      )}

      {tier.sparkles.length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2.5 right-4 flex items-center gap-1.5 text-xs animate-bounce"
        >
          {tier.sparkles.map((sp, i) => (
            <span key={i} className="drop-shadow-md">
              {sp}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative shrink-0">
          {tier.haloClass && (
            <div
              aria-hidden="true"
              className={cx(
                'pointer-events-none absolute -inset-1 rounded-xl animate-pulse',
                tier.haloClass,
              )}
            />
          )}
          <span
            className={cx(
              'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold',
              tier.iconBgClass,
            )}
          >
            {tier.icon}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cx(
                'rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                tier.badgeClass,
              )}
            >
              {badge}
            </span>
            <span className="text-xs sm:text-sm font-extrabold tracking-wide truncate">
              {title}
            </span>
          </div>
          <span className="text-xs opacity-90 font-medium truncate">
            {t('games.game_2048_v1.milestone.body', { tile: milestone })}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant="primary"
        onClick={onDismiss}
        data-testid="game-2048-milestone-dismiss"
        className={cx(
          'shrink-0 h-8 px-3 text-xs font-bold border-none active:scale-95 transition-transform',
          tier.btnClass,
        )}
      >
        {t('games.game_2048_v1.milestone.keepGoing')}
      </Button>
    </div>
  );
}
