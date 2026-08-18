'use client';

import { HintButton } from './HintButton';
import { chessHintLabel } from './hint-label';
import type { ChessHint } from '../lib/hint-generator';
import type { TranslationKey } from '@/shared/lib/useTranslation';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

export interface CoachControlsProps {
  enabled: boolean;
  hintAvailable: boolean;
  hint: ChessHint | null;
  t: TranslateFn;
  onToggle: () => void;
  onHint: () => void;
}

/**
 * In-game coach controls: an "Enable hints" switch plus, when enabled and it's
 * the player's turn, the "💡 Hint" button with the generated suggestion.
 */
export function CoachControls({
  enabled,
  hintAvailable,
  hint,
  t,
  onToggle,
  onHint,
}: CoachControlsProps) {
  const hintLabel = hint ? chessHintLabel(hint) : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(15, 20, 30, 0.6)',
        border: '1px solid rgba(167, 139, 250, 0.18)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(221, 214, 254, 0.9)',
          }}
        >
          💡 {t('games.chess_v1.coach.title')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t('games.chess_v1.coach.title')}
          data-testid="coach-toggle"
          onClick={onToggle}
          style={{
            width: 38,
            height: 20,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: enabled
              ? 'rgba(16, 185, 129, 0.7)'
              : 'rgba(148, 163, 184, 0.3)',
            transition: 'background-color 0.15s ease',
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transform: enabled ? 'translateX(18px)' : 'translateX(0)',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>
      </div>
      {hintAvailable && (
        <HintButton
          label={t('games.chess_v1.coach.hint')}
          hint={hintLabel ? t(hintLabel.key, hintLabel.params) : null}
          onClick={onHint}
        />
      )}
    </div>
  );
}
