'use client';

import { type ReactNode } from 'react';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

export type MilestoneTone =
  'amber' | 'orange' | 'yellow' | 'fuchsia' | 'cyan' | 'emerald' | 'purple';

export interface GameMilestoneToastProps {
  isOpen?: boolean;
  icon: ReactNode;
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
  onDismiss: () => void;
  tone?: MilestoneTone;
  sparkles?: string[];
  hasHalo?: boolean;
  hasAmbientGlow?: boolean;
  cardClassName?: string;
  className?: string;
  dataTestId?: string;
  actionTestId?: string;
}

interface ToneStyleConfig {
  cardClass: string;
  iconBgClass: string;
  badgeClass: string;
  btnClass: string;
  haloClass: string;
  ambientGlowClass: string;
}

const TONE_STYLES: Record<MilestoneTone, ToneStyleConfig> = {
  cyan: {
    cardClass:
      'border-2 border-cyan-300 bg-neutral-950/95 shadow-[0_0_50px_rgba(6,182,212,0.65)] ring-2 ring-cyan-300/80 text-cyan-100',
    iconBgClass:
      'bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/50',
    badgeClass:
      'border-cyan-300/70 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    btnClass:
      'bg-cyan-300 hover:bg-cyan-200 text-black shadow-lg shadow-cyan-300/40',
    haloClass: 'bg-cyan-400/40 blur-sm',
    ambientGlowClass:
      'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 opacity-40 blur-md',
  },
  fuchsia: {
    cardClass:
      'border-2 border-fuchsia-400 bg-neutral-950/95 shadow-[0_0_40px_rgba(217,70,239,0.55)] ring-2 ring-fuchsia-400/70 text-fuchsia-100',
    iconBgClass:
      'bg-gradient-to-br from-fuchsia-400 via-purple-500 to-pink-600 text-white shadow-lg shadow-fuchsia-500/50',
    badgeClass:
      'border-fuchsia-300/60 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.4)]',
    btnClass:
      'bg-fuchsia-400 hover:bg-fuchsia-300 text-black shadow-lg shadow-fuchsia-400/40',
    haloClass: 'bg-fuchsia-400/40 blur-sm',
    ambientGlowClass: 'bg-fuchsia-500/35 blur-md',
  },
  yellow: {
    cardClass:
      'border-2 border-yellow-300 bg-neutral-950/95 shadow-[0_0_35px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/70 text-yellow-100',
    iconBgClass:
      'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50',
    badgeClass:
      'border-yellow-300/70 bg-yellow-500/25 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.4)]',
    btnClass:
      'bg-yellow-300 hover:bg-yellow-200 text-black shadow-lg shadow-yellow-300/40',
    haloClass: 'bg-yellow-400/40 blur-sm',
    ambientGlowClass: 'bg-yellow-400/30 blur-md',
  },
  orange: {
    cardClass:
      'border-2 border-orange-400/80 bg-neutral-950/95 shadow-2xl shadow-orange-500/30 ring-1 ring-orange-400/50 text-orange-100',
    iconBgClass:
      'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/30',
    badgeClass: 'border-orange-400/40 bg-orange-500/15 text-orange-200',
    btnClass:
      'bg-orange-400 hover:bg-orange-300 text-black shadow-md shadow-orange-400/30',
    haloClass: 'bg-orange-400/30 blur-sm',
    ambientGlowClass: 'bg-orange-500/25 blur-md',
  },
  amber: {
    cardClass:
      'border-2 border-amber-400/80 bg-neutral-950/95 shadow-2xl shadow-amber-500/25 ring-1 ring-amber-400/40 text-amber-100',
    iconBgClass:
      'bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/30',
    badgeClass: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
    btnClass:
      'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-400/30',
    haloClass: 'bg-amber-400/30 blur-sm',
    ambientGlowClass: 'bg-amber-500/25 blur-md',
  },
  emerald: {
    cardClass:
      'border-2 border-emerald-400/80 bg-neutral-950/95 shadow-2xl shadow-emerald-500/30 ring-1 ring-emerald-400/50 text-emerald-100',
    iconBgClass:
      'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/30',
    badgeClass: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
    btnClass:
      'bg-emerald-400 hover:bg-emerald-300 text-black shadow-md shadow-emerald-400/30',
    haloClass: 'bg-emerald-400/30 blur-sm',
    ambientGlowClass: 'bg-emerald-500/25 blur-md',
  },
  purple: {
    cardClass:
      'border-2 border-purple-400/80 bg-neutral-950/95 shadow-2xl shadow-purple-500/30 ring-1 ring-purple-400/50 text-purple-100',
    iconBgClass:
      'bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-md shadow-purple-500/30',
    badgeClass: 'border-purple-400/40 bg-purple-500/15 text-purple-200',
    btnClass:
      'bg-purple-400 hover:bg-purple-300 text-black shadow-md shadow-purple-400/30',
    haloClass: 'bg-purple-400/30 blur-sm',
    ambientGlowClass: 'bg-purple-500/25 blur-md',
  },
};

export function GameMilestoneToast({
  isOpen = true,
  icon,
  badge,
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
  tone = 'amber',
  sparkles = [],
  hasHalo,
  hasAmbientGlow,
  cardClassName,
  className,
  dataTestId = 'game-milestone-toast',
  actionTestId = 'game-milestone-dismiss',
}: GameMilestoneToastProps) {
  if (!isOpen) return null;

  const style = TONE_STYLES[tone];
  const showHalo = hasHalo ?? (tone === 'yellow' || tone === 'cyan');
  const showGlow = hasAmbientGlow ?? (tone === 'cyan' || tone === 'fuchsia');

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onDismiss();
    }
  };

  return (
    <div
      data-testid={dataTestId}
      onAnimationEnd={onDismiss}
      className={cx(
        'fixed z-[120] bottom-4 inset-x-4 mx-auto w-auto max-w-[calc(100vw-2rem)] sm:w-max sm:max-w-md md:max-w-lg sm:bottom-auto sm:inset-x-auto sm:top-20 sm:right-6 sm:mx-0 flex items-center justify-between gap-3 sm:gap-4 rounded-2xl p-2.5 sm:p-3.5 backdrop-blur-2xl animate-milestone-toast pointer-events-auto select-none overflow-visible',
        style.cardClass,
        cardClassName,
        className,
      )}
    >
      {showGlow && (
        <div
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute -inset-1 rounded-2xl -z-10 animate-pulse',
            style.ambientGlowClass,
          )}
        />
      )}

      {sparkles.length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2.5 right-4 flex items-center gap-1.5 text-xs animate-bounce"
        >
          {sparkles.map((sp, i) => (
            <span key={i} className="drop-shadow-md">
              {sp}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="relative shrink-0">
          {showHalo && (
            <div
              aria-hidden="true"
              className={cx(
                'pointer-events-none absolute -inset-1 rounded-xl animate-pulse',
                style.haloClass,
              )}
            />
          )}
          <span
            className={cx(
              'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold',
              style.iconBgClass,
            )}
          >
            {icon}
          </span>
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            {badge && (
              <span
                className={cx(
                  'shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                  style.badgeClass,
                )}
              >
                {badge}
              </span>
            )}
            <span className="text-xs sm:text-sm font-extrabold tracking-wide whitespace-nowrap">
              {title}
            </span>
          </div>
          {description && (
            <span className="text-xs opacity-90 font-medium whitespace-nowrap">
              {description}
            </span>
          )}
        </div>
      </div>

      {actionLabel && (
        <Button
          size="sm"
          variant="primary"
          onClick={handleAction}
          data-testid={actionTestId}
          className={cx(
            'shrink-0 h-8 px-3 text-xs font-bold border-none active:scale-95 transition-transform whitespace-nowrap',
            style.btnClass,
          )}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
