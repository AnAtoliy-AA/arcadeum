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
      className="flex flex-col gap-4 p-4 md:p-5 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl w-full"
      data-testid="center-action-console"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
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

      <div className="flex flex-col items-center justify-center py-2">
        <button
          type="button"
          onClick={onRollDice}
          disabled={!myTurn || isGameOver || isRolling}
          data-testid="dice-overlay-roll-button"
          className={`relative group flex flex-col items-center justify-center w-full max-w-sm px-8 py-5 rounded-3xl border text-center transition-all duration-300 ${
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
                <span className="text-3xl filter drop-shadow">🎲</span>
                <span className="text-xl md:text-2xl font-black text-white tracking-wide uppercase drop-shadow">
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
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/60 border border-white/10 text-[11px] font-bold text-amber-300">
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
        className="flex flex-col gap-2.5 border-t border-white/10 pt-3"
        data-testid="tactical-ability-bar"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🐾</span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            {t('games.cat_dash_v1.dashboard.tacticalDeck' as TranslationKey)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={!myTurn || isGameOver || isRolling}
            onClick={onCatnap}
            data-testid="action-btn-catnap"
            className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-left transition-all ${
              myTurn && !isGameOver && !isRolling
                ? 'bg-slate-950/60 hover:bg-slate-900 border-cyan-500/40 hover:border-cyan-400 text-white shadow-lg shadow-cyan-500/5 cursor-pointer active:scale-[0.98]'
                : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-base">💤</span>
                <span className="text-xs font-black text-cyan-300">
                  {t('games.cat_dash_v1.actions.catnap' as TranslationKey)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-black">
                +1 ⚡ & 🛡️
              </span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              {t('games.cat_dash_v1.actions.catnapDesc' as TranslationKey)}
            </span>
          </button>

          <button
            type="button"
            disabled={!myTurn || isGameOver || isRolling || powerTokens < 1}
            onClick={onPounce}
            data-testid="action-btn-pounce"
            className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-left transition-all ${
              myTurn && !isGameOver && !isRolling && powerTokens >= 1
                ? 'bg-slate-950/60 hover:bg-slate-900 border-emerald-500/40 hover:border-emerald-400 text-white shadow-lg shadow-emerald-500/5 cursor-pointer active:scale-[0.98]'
                : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-base">🐾</span>
                <span className="text-xs font-black text-emerald-300">
                  {t('games.cat_dash_v1.actions.pounce' as TranslationKey)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black">
                1 ⚡
              </span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              {t('games.cat_dash_v1.actions.pounceDesc' as TranslationKey)}
            </span>
          </button>

          <button
            type="button"
            disabled={!myTurn || isGameOver || isRolling || powerTokens < 1}
            onClick={onDeployTrap}
            data-testid="action-btn-deploy-trap"
            className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-left transition-all ${
              myTurn && !isGameOver && !isRolling && powerTokens >= 1
                ? 'bg-slate-950/60 hover:bg-slate-900 border-purple-500/40 hover:border-purple-400 text-white shadow-lg shadow-purple-500/5 cursor-pointer active:scale-[0.98]'
                : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-base">🪤</span>
                <span className="text-xs font-black text-purple-300">
                  {t('games.cat_dash_v1.actions.deployTrap' as TranslationKey)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px] font-black">
                1 ⚡
              </span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              {t('games.cat_dash_v1.actions.deployTrapDesc' as TranslationKey)}
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
                className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-left transition-all ${
                  isUsed
                    ? 'bg-slate-950/30 border-white/5 opacity-30 cursor-not-allowed'
                    : canActivate
                      ? 'bg-slate-950/60 hover:bg-slate-900 border-amber-500/40 hover:border-amber-400 text-white shadow-lg shadow-amber-500/5 cursor-pointer active:scale-[0.98]'
                      : 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ability.icon}</span>
                    <span className="text-xs font-black text-amber-300 truncate">
                      {ability.name}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
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
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  {ability.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
