'use client';

import { useState } from 'react';
import type { ClanWar, Clan } from '../model/types';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';

interface ClanWarMatchHudProps {
  war: ClanWar;
  myClan?: Clan | null;
  className?: string;
}

export function ClanWarMatchHud({
  war,
  myClan,
  className,
}: ClanWarMatchHudProps) {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);

  const initiatorScore = war.initiatorScore;
  const targetScore = war.targetClanScore;
  const targetGoal = Math.max(1, war.targetScore || 5);

  const isMyClanInitiator = myClan?.id === war.initiatorClanId;
  const isMyClanTarget = myClan?.id === war.targetClanId;

  const initiatorLeading = initiatorScore > targetScore;
  const targetLeading = targetScore > initiatorScore;

  const rawRivalTitle =
    t('pages.clans.rivalMatchHudTitle' as TranslationKey) ||
    t('clans.rivalMatchHudTitle' as TranslationKey);
  const rivalTitle =
    rawRivalTitle &&
    rawRivalTitle !== 'pages.clans.rivalMatchHudTitle' &&
    rawRivalTitle !== 'clans.rivalMatchHudTitle'
      ? rawRivalTitle
      : 'Clan War Match';

  const rawFirstToWins =
    t('pages.clans.firstToWins' as TranslationKey) ||
    t('clans.firstToWins' as TranslationKey);
  const firstToWins =
    rawFirstToWins &&
    rawFirstToWins !== 'pages.clans.firstToWins' &&
    rawFirstToWins !== 'clans.firstToWins'
      ? rawFirstToWins.replace('{target}', String(targetGoal))
      : `First to ${targetGoal} wins`;

  const rawLive =
    t('pages.clans.liveBadge' as TranslationKey) ||
    t('clans.liveBadge' as TranslationKey);
  const liveText =
    rawLive &&
    rawLive !== 'pages.clans.liveBadge' &&
    rawLive !== 'clans.liveBadge'
      ? rawLive
      : 'LIVE';

  const rawYourClan =
    t('pages.clans.yourClan' as TranslationKey) ||
    t('clans.yourClan' as TranslationKey);
  const yourClanText =
    rawYourClan &&
    rawYourClan !== 'pages.clans.yourClan' &&
    rawYourClan !== 'clans.yourClan'
      ? rawYourClan
      : 'Your Clan';

  return (
    <aside
      aria-label={`${rivalTitle}: [${war.initiatorClanTag}] ${initiatorScore} vs [${war.targetClanTag}] ${targetScore}`}
      data-testid="clan-war-match-hud"
      className={cx(
        'relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[var(--glassBg)] to-rose-950/40 p-2 sm:p-2.5 backdrop-blur-md transition-all duration-300 shadow-lg shadow-amber-950/20',
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-xs shadow-inner">
            ⚔️
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-wide text-amber-300 uppercase">
              {rivalTitle}
            </span>
            <span
              data-testid="clan-war-hud-live-badge"
              className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-rose-400 uppercase"
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rose-400" />
              {liveText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            data-testid="clan-war-hud-target-goal"
            className="text-[11px] font-medium text-amber-200/80 hidden sm:inline"
          >
            {firstToWins}
          </span>
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            aria-label={isMinimized ? 'Expand War HUD' : 'Collapse War HUD'}
            className="rounded p-1 text-xs text-amber-300/80 hover:bg-amber-500/10 hover:text-amber-200"
          >
            {isMinimized ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="mt-2 flex flex-col gap-1.5 pt-1 border-t border-amber-500/20">
          <div className="grid grid-cols-11 items-center gap-1 sm:gap-2">
            <div className="col-span-5 flex items-center justify-between gap-1.5 rounded-lg bg-black/30 px-2 py-1">
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className={cx(
                    'truncate text-xs font-bold',
                    initiatorLeading
                      ? 'text-amber-300'
                      : 'text-[var(--foreground)]',
                  )}
                >
                  [{war.initiatorClanTag}]
                </span>
                {isMyClanInitiator && (
                  <span className="rounded bg-amber-400/20 px-1 py-0.5 text-[9px] font-semibold text-amber-300 hidden md:inline">
                    {yourClanText}
                  </span>
                )}
              </div>
              <span
                data-testid="clan-war-hud-initiator-score"
                className={cx(
                  'text-sm font-extrabold font-mono',
                  initiatorLeading
                    ? 'text-amber-300'
                    : 'text-[var(--foreground)]/80',
                )}
              >
                {initiatorScore}
              </span>
            </div>

            <div className="col-span-1 flex justify-center text-[10px] font-bold text-amber-400/60 uppercase">
              vs
            </div>

            <div className="col-span-5 flex items-center justify-between gap-1.5 rounded-lg bg-black/30 px-2 py-1">
              <span
                data-testid="clan-war-hud-target-score"
                className={cx(
                  'text-sm font-extrabold font-mono',
                  targetLeading
                    ? 'text-amber-300'
                    : 'text-[var(--foreground)]/80',
                )}
              >
                {targetScore}
              </span>
              <div className="flex items-center gap-1 min-w-0 text-right">
                {isMyClanTarget && (
                  <span className="rounded bg-amber-400/20 px-1 py-0.5 text-[9px] font-semibold text-amber-300 hidden md:inline">
                    {yourClanText}
                  </span>
                )}
                <span
                  className={cx(
                    'truncate text-xs font-bold',
                    targetLeading
                      ? 'text-amber-300'
                      : 'text-[var(--foreground)]',
                  )}
                >
                  [{war.targetClanTag}]
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 w-full pt-0.5">
            <div className="flex items-center gap-1 flex-1">
              {Array.from({ length: targetGoal }).map((_, i) => (
                <span
                  key={`init-pip-${i}`}
                  className={cx(
                    'h-1.5 flex-1 rounded-full transition-colors duration-300',
                    i < initiatorScore
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                      : 'bg-white/10',
                  )}
                />
              ))}
            </div>
            <div className="h-2 w-[1px] bg-white/20 shrink-0" />
            <div className="flex items-center gap-1 flex-1 justify-end flex-row-reverse">
              {Array.from({ length: targetGoal }).map((_, i) => (
                <span
                  key={`target-pip-${i}`}
                  className={cx(
                    'h-1.5 flex-1 rounded-full transition-colors duration-300',
                    i < targetScore
                      ? 'bg-rose-400 shadow-sm shadow-rose-400/50'
                      : 'bg-white/10',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
