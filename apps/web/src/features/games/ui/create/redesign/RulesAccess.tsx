'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/shared/lib/useTranslation';
import s from './GameCreateView.module.scss';
import type { GameId } from './data/themes';

// Both rules modals are Tamagui-heavy and only needed once the user
// actually opens them. Defer loading until the button is clicked.
const SeaBattleRulesModal = dynamic(
  () =>
    import('@/widgets/SeaBattleGame/ui/RulesModal').then((m) => m.RulesModal),
  { ssr: false },
);

const CriticalRulesModal = dynamic(
  () =>
    import('@/widgets/CriticalGame/ui/RulesModal').then((m) => m.RulesModal),
  { ssr: false },
);

const TicTacToeRulesModal = dynamic(
  () =>
    import('@/widgets/TicTacToeGame/ui/RulesModal').then((m) => m.RulesModal),
  { ssr: false },
);

const CascadeRulesModal = dynamic(
  () => import('@/widgets/CascadeGame/ui/RulesModal').then((m) => m.RulesModal),
  { ssr: false },
);

interface Props {
  gameId: GameId;
  themeId: string;
}

// Per-game "Game Rules" link that opens the corresponding rules modal.
// Glimworm doesn't ship a rules modal yet — the button is hidden for
// that game.
export function RulesAccess({ gameId, themeId }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (gameId === 'glimworm_v1') return null;

  const label = t('games.rules.button') || 'Game Rules';

  return (
    <>
      <button
        type="button"
        data-testid="view-rules-button"
        className={s.railRulesBtn}
        onClick={() => setOpen(true)}
      >
        <span className={s.railRulesIcon} aria-hidden="true">
          📖
        </span>
        {label}
      </button>
      {gameId === 'sea_battle_v1' ? (
        <SeaBattleRulesModal
          isOpen={open}
          onClose={() => setOpen(false)}
          t={t}
        />
      ) : null}
      {gameId === 'critical_v1' ? (
        <CriticalRulesModal
          isOpen={open}
          onClose={() => setOpen(false)}
          currentVariant={themeId || 'cyberpunk'}
          t={t}
        />
      ) : null}
      {gameId === 'tic_tac_toe_v1' ? (
        <TicTacToeRulesModal
          open={open}
          onClose={() => setOpen(false)}
          boardSize={3}
          winLength={3}
        />
      ) : null}
      {gameId === 'cascade_v1' ? (
        <CascadeRulesModal
          open={open}
          onClose={() => setOpen(false)}
          // RulesModal internally validates against CASCADE_VARIANT_IDS and
          // falls back to 'cosmic' for unknown values, so an unconstrained
          // themeId is safe here.
          variant={themeId as never}
        />
      ) : null}
    </>
  );
}
