'use client';

import { memo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { CatDashClientState } from '../types';
import { RealisticCat } from './RealisticCat';

interface BoardFooterProps {
  snapshot: CatDashClientState;
  resolveName: (id?: string | null) => string;
}

export const BoardFooter = memo(function BoardFooter({
  snapshot,
  resolveName,
}: BoardFooterProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-row items-stretch justify-center flex-wrap gap-2.5">
        {snapshot.players.map((player) => {
          const isCurrent =
            snapshot.players[snapshot.currentPlayerIndex]?.playerId ===
            player.playerId;
          return (
            <div
              key={player.playerId}
              className={`flex flex-row gap-2.5 items-center rounded-2xl border px-3.5 py-2 transition-all duration-200 ${
                player.isReady ? 'opacity-100' : 'opacity-40'
              } ${
                isCurrent
                  ? 'bg-purple-900/30 border-purple-500/50 ring-1 ring-purple-400/40'
                  : 'bg-slate-900/40 border-white/10'
              }`}
            >
              <RealisticCat catId={player.catId} size={28} />
              <span
                className={`text-sm ${
                  isCurrent
                    ? 'font-extrabold text-white'
                    : 'font-semibold text-slate-300'
                }`}
              >
                {resolveName(player.playerId)}
              </span>
              <span className="text-xs font-bold text-slate-400">
                🎲 {player.powerTokens}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-row items-stretch justify-center flex-wrap gap-4 pt-1 text-slate-400">
        <LegendItem
          color="bg-emerald-500"
          label={t('games.cat_dash_v1.board.start' as TranslationKey)}
        />
        <LegendItem
          color="bg-amber-500"
          label={t('games.cat_dash_v1.board.finish' as TranslationKey)}
        />
        <LegendItem
          icon="⚡"
          label={t('games.cat_dash_v1.board.obstacle' as TranslationKey)}
        />
        <LegendItem
          icon="⭐"
          label={t('games.cat_dash_v1.board.bonus' as TranslationKey)}
        />
        <LegendItem
          icon="🪤"
          label={t('games.cat_dash_v1.board.trap' as TranslationKey)}
        />
      </div>
    </>
  );
});

function LegendItem({
  color,
  icon,
  label,
}: {
  color?: string;
  icon?: string;
  label: string;
}) {
  return (
    <div className="flex flex-row items-center gap-1.5">
      {color ? (
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
      ) : (
        <span className="text-sm">{icon}</span>
      )}
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}
