'use client';

import { memo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { CatDashPlayer, CatId } from '../types';
import { RACER_TACTICAL_ABILITIES } from './catData';

interface CenterActionConsoleProps {
  myTurn: boolean;
  isGameOver: boolean;
  isRolling: boolean;
  onRollDice: () => void;
  onCatnap: () => void;
  onPounce: () => void;
  onDeployTrap: () => void;
  onUseAbility: (abilityId: string) => void;
  myPlayer?: CatDashPlayer;
  currentPlayer?: CatDashPlayer;
  resolveName: (id?: string | null) => string;
  lastRollValue: number | null;
}

export const CenterActionConsole = memo(function CenterActionConsole({
  myTurn,
  isGameOver,
  isRolling,
  onRollDice,
  onCatnap,
  onPounce,
  onDeployTrap,
  onUseAbility,
  myPlayer,
  currentPlayer,
  resolveName,
  lastRollValue,
}: CenterActionConsoleProps) {
  const { t } = useTranslation();
  const powerTokens = myPlayer?.powerTokens ?? 0;
  const shielded = myPlayer?.shielded ?? false;
  const speedBoost = myPlayer?.speedBoostPending ?? 0;
  const abilities = myPlayer
    ? (RACER_TACTICAL_ABILITIES[myPlayer.catId as CatId] ?? [])
    : [];
  const abilitiesUsed = myPlayer?.abilitiesUsed ?? [];

  return (
    <div
      className="flex w-full flex-col gap-2 rounded-3xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-xl md:gap-3 md:p-4"
      data-testid="center-action-console"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 md:gap-3 md:pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            {t('games.cat_dash_v1.dashboard.commandDeck' as TranslationKey)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {shielded && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-extrabold animate-pulse"
              data-testid="buff-shield"
            >
              <span>🛡️</span>
              <span>
                {t(
                  'games.cat_dash_v1.dashboard.shieldActive' as TranslationKey,
                )}
              </span>
            </div>
          )}
          {speedBoost > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-extrabold animate-pulse"
              data-testid="buff-speed-boost"
            >
              <span>🚀</span>
              <span>
                {speedBoost === 999
                  ? t(
                      'games.cat_dash_v1.dashboard.apexPrimed' as TranslationKey,
                    )
                  : t(
                      'games.cat_dash_v1.dashboard.speedPrimed' as TranslationKey,
                    )}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/60 border border-white/10">
            <span className="text-amber-400 text-sm">⚡</span>
            <span className="text-xs font-black text-slate-200">
              {t(
                'games.cat_dash_v1.dashboard.powerTokensCount' as TranslationKey,
                {
                  count: powerTokens,
                },
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center justify-center border-b border-white/10 pb-2 pt-1 md:pb-3 md:pt-2">
          <button
            type="button"
            onClick={onRollDice}
            disabled={!myTurn || isGameOver || isRolling}
            data-testid="dice-overlay-roll-button"
            aria-label={t(
              'games.cat_dash_v1.dashboard.rollNow' as TranslationKey,
            )}
            className={`group relative flex w-full max-w-none flex-col items-center justify-center rounded-3xl border px-4 py-2.5 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:px-6 md:py-3 ${
              isRolling
                ? 'bg-purple-950/60 border-purple-400/60 shadow-xl shadow-purple-500/30 cursor-wait'
                : myTurn && !isGameOver
                  ? 'bg-gradient-to-b from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 border-purple-400/80 shadow-2xl shadow-purple-600/40 cursor-pointer active:scale-[0.98] ring-4 ring-purple-500/30'
                  : 'bg-slate-950/40 border-white/10 opacity-60 cursor-not-allowed'
            }`}
          >
            {isRolling ? (
              <div
                className="flex flex-col items-center gap-2"
                data-testid="dice-overlay-rolling-state"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/30 border border-purple-300 flex items-center justify-center text-3xl animate-bounce">
                  🎲
                </div>
                <span className="text-sm font-black text-purple-200 uppercase tracking-widest animate-pulse">
                  {t('games.cat_dash_v1.dashboard.rolling' as TranslationKey)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow md:text-3xl">
                    🎲
                  </span>
                  <span className="text-lg font-black uppercase tracking-wide text-white drop-shadow md:text-2xl">
                    {t('games.cat_dash_v1.dashboard.rollNow' as TranslationKey)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-purple-200">
                  {myTurn && !isGameOver
                    ? t(
                        'games.cat_dash_v1.dashboard.pressSpace' as TranslationKey,
                      )
                    : currentPlayer
                      ? t(
                          'games.cat_dash_v1.dashboard.waitingForPlayer' as TranslationKey,
                          {
                            name: resolveName(currentPlayer.playerId),
                          },
                        )
                      : t(
                          'games.cat_dash_v1.dashboard.yourTurnToRoll' as TranslationKey,
                        )}
                </span>
                {lastRollValue && (
                  <span className="mt-1 rounded-full border border-white/10 bg-slate-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 md:px-2.5 md:text-[11px]">
                    {t(
                      'games.cat_dash_v1.dashboard.rolledMoved' as TranslationKey,
                      {
                        roll: lastRollValue,
                        move: lastRollValue,
                      },
                    )}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>

        <div
          className="flex flex-col gap-2 pt-1 md:gap-2 md:pt-2"
          data-testid="tactical-ability-bar"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🐾</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              {t('games.cat_dash_v1.dashboard.tacticalDeck' as TranslationKey)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-2 lg:grid-cols-3 lg:gap-1.5">
            <button
              type="button"
              disabled={!myTurn || isGameOver || isRolling}
              onClick={onCatnap}
              data-testid="action-btn-catnap"
              aria-label={t(
                'games.cat_dash_v1.actions.catnap' as TranslationKey,
              )}
              className={`relative flex min-w-0 flex-col items-start gap-1 rounded-2xl border p-1.5 text-left transition-all md:p-2.5 ${
                myTurn && !isGameOver && !isRolling
                  ? 'bg-slate-950/60 hover:bg-slate-900 border-cyan-500/40 hover:border-cyan-400 text-white shadow-lg shadow-cyan-500/5 cursor-pointer active:scale-[0.98]'
                  : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex min-w-0 items-center gap-1.5 pr-12">
                <span className="text-sm md:text-base">💤</span>
                <span className="min-w-0 text-[10px] font-black leading-tight text-cyan-300 md:text-[11px]">
                  {t('games.cat_dash_v1.actions.catnap' as TranslationKey)}
                </span>
              </div>
              <span className="absolute right-1 top-1 rounded-md border border-cyan-400/40 bg-cyan-500/20 px-1 py-0.5 text-[8px] font-black md:text-[9px]">
                +1 ⚡
              </span>
              <span className="max-h-5 truncate overflow-hidden text-[10px] leading-tight text-slate-400 md:text-[11px] lg:hidden">
                {t('games.cat_dash_v1.actions.catnapDesc' as TranslationKey)}
              </span>
            </button>

            <button
              type="button"
              disabled={!myTurn || isGameOver || isRolling || powerTokens < 1}
              onClick={onPounce}
              data-testid="action-btn-pounce"
              aria-label={t(
                'games.cat_dash_v1.actions.pounce' as TranslationKey,
              )}
              className={`relative flex min-w-0 flex-col items-start gap-1 rounded-2xl border p-1.5 text-left transition-all md:p-2.5 ${
                myTurn && !isGameOver && !isRolling && powerTokens >= 1
                  ? 'bg-slate-950/60 hover:bg-slate-900 border-emerald-500/40 hover:border-emerald-400 text-white shadow-lg shadow-emerald-500/5 cursor-pointer active:scale-[0.98]'
                  : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex min-w-0 items-center gap-1.5 pr-12">
                <span className="text-sm md:text-base">🐾</span>
                <span className="min-w-0 text-[10px] font-black leading-tight text-emerald-300 md:text-[11px]">
                  {t('games.cat_dash_v1.actions.pounce' as TranslationKey)}
                </span>
              </div>
              <span className="absolute right-1 top-1 rounded-md border border-emerald-400/40 bg-emerald-500/20 px-1 py-0.5 text-[8px] font-black md:text-[9px]">
                1 ⚡
              </span>
              <span className="max-h-5 truncate overflow-hidden text-[10px] leading-tight text-slate-400 md:text-[11px] lg:hidden">
                {t('games.cat_dash_v1.actions.pounceDesc' as TranslationKey)}
              </span>
            </button>

            <button
              type="button"
              disabled={!myTurn || isGameOver || isRolling || powerTokens < 1}
              onClick={onDeployTrap}
              data-testid="action-btn-deploy-trap"
              aria-label={t(
                'games.cat_dash_v1.actions.deployTrap' as TranslationKey,
              )}
              className={`relative flex min-w-0 flex-col items-start gap-1 rounded-2xl border p-1.5 text-left transition-all md:p-2.5 ${
                myTurn && !isGameOver && !isRolling && powerTokens >= 1
                  ? 'bg-slate-950/60 hover:bg-slate-900 border-purple-500/40 hover:border-purple-400 text-white shadow-lg shadow-purple-500/5 cursor-pointer active:scale-[0.98]'
                  : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex min-w-0 items-center gap-1.5 pr-12">
                <span className="text-sm md:text-base">🪤</span>
                <span className="min-w-0 text-[10px] font-black leading-tight text-purple-300 md:text-[11px]">
                  {t('games.cat_dash_v1.actions.deployTrap' as TranslationKey)}
                </span>
              </div>
              <span className="absolute right-1 top-1 rounded-md border border-purple-400/40 bg-purple-500/20 px-1 py-0.5 text-[8px] font-black md:text-[9px]">
                1 ⚡
              </span>
              <span className="max-h-5 truncate overflow-hidden text-[10px] leading-tight text-slate-400 md:text-[11px] lg:hidden">
                {t(
                  'games.cat_dash_v1.actions.deployTrapDesc' as TranslationKey,
                )}
              </span>
            </button>

            {abilities.map((ability, idx) => {
              const isUsed =
                abilitiesUsed.includes(ability.id) ||
                abilitiesUsed.includes(`ability_${idx + 1}`);
              const canAfford = powerTokens >= ability.cost;
              const canActivate =
                myTurn && !isGameOver && !isRolling && !isUsed && canAfford;

              return (
                <button
                  key={ability.id}
                  type="button"
                  disabled={!canActivate}
                  onClick={() => onUseAbility(ability.id)}
                  data-testid={`ability-btn-${ability.id}`}
                  aria-label={`${ability.name}: ${ability.description}`}
                  title={ability.description}
                  className={`relative flex min-w-0 flex-col items-start gap-1 rounded-2xl border p-1.5 text-left transition-all md:p-2.5 ${
                    isUsed
                      ? 'bg-slate-950/30 border-white/5 opacity-30 cursor-not-allowed'
                      : canActivate
                        ? 'bg-slate-950/60 hover:bg-slate-900 border-amber-500/40 hover:border-amber-400 text-white shadow-lg shadow-amber-500/5 cursor-pointer active:scale-[0.98]'
                        : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-1.5 pr-12">
                    <span className="text-sm md:text-base">{ability.icon}</span>
                    <span className="min-w-0 text-[10px] font-black leading-tight text-amber-300 md:text-[11px]">
                      {ability.name}
                    </span>
                  </div>
                  <span
                    className={`absolute right-1 top-1 rounded-md border px-1 py-0.5 text-[8px] font-black md:text-[9px] ${
                      isUsed
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : canActivate
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {isUsed
                      ? t('games.cat_dash_v1.dashboard.used' as TranslationKey)
                      : `${ability.cost} ⚡`}
                  </span>
                  <span className="max-h-5 truncate overflow-hidden text-[10px] leading-tight text-slate-400 md:text-[11px] lg:hidden">
                    {ability.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
