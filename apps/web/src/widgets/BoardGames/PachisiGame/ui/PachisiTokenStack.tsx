'use client';

import type { ReactElement } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';
import { PachisiTokenView } from './PachisiTokenView';
import type { PachisiToken } from '../types';

export interface PlacedToken {
  ownerId: string;
  seat: number;
  token: PachisiToken;
}

interface PachisiTokenStackProps {
  tokens: PlacedToken[];
  cellKey: string;
  currentUserId: string | null;
  canMove: boolean;
  movable: Set<number>;
  onMove: (tokenId: number) => void;
  isLandingCell?: boolean;
}

export function PachisiTokenStack({
  tokens,
  cellKey,
  currentUserId,
  canMove,
  movable,
  onMove,
  isLandingCell = false,
}: PachisiTokenStackProps): ReactElement {
  const { t } = useTranslation();

  const isBlockade =
    tokens.length >= 2 && tokens.every((t) => t.ownerId === tokens[0].ownerId);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative flex h-full w-full items-center justify-center">
        {tokens.map((placed, i) => {
          const movableToken =
            canMove &&
            placed.ownerId === currentUserId &&
            movable.has(placed.token.id);

          let layoutClass = 'aspect-square h-[74%] w-[74%] shrink-0';
          if (tokens.length === 2) {
            layoutClass =
              i === 0
                ? 'aspect-square h-[60%] w-[60%] shrink-0 -translate-x-1.5 -translate-y-1.5'
                : 'aspect-square h-[60%] w-[60%] shrink-0 translate-x-1.5 translate-y-1.5';
          } else if (tokens.length >= 3) {
            const offsets = [
              '-translate-x-1.5 -translate-y-1.5',
              'translate-x-1.5 -translate-y-1.5',
              '-translate-x-1.5 translate-y-1.5',
              'translate-x-1.5 translate-y-1.5',
            ];
            layoutClass = `aspect-square h-[48%] w-[48%] shrink-0 ${offsets[i % 4]}`;
          }

          const zIndexClass = movableToken ? 'z-30' : i === 0 ? 'z-10' : 'z-20';
          const testId = cellKey.startsWith('lane-')
            ? tokens.length === 1 || i === 0
              ? cellKey
              : `${cellKey}-${placed.token.id}`
            : `token-cell-${cellKey}-${placed.token.id}`;

          const landClass = isLandingCell ? 'pachisi-token-land' : '';

          return (
            <PachisiTokenView
              key={`${placed.ownerId}-${placed.token.id}`}
              seat={placed.seat}
              isMovable={movableToken}
              isButton={movableToken}
              stackIndex={tokens.length > 1 ? i : undefined}
              isBlockade={isBlockade}
              ariaLabel={
                movableToken
                  ? t('games.pachisi_v1.game.moveTokenAria', {
                      id: placed.token.id,
                    })
                  : undefined
              }
              onClick={movableToken ? () => onMove(placed.token.id) : undefined}
              testId={testId}
              className={`pointer-events-auto absolute ${layoutClass} ${zIndexClass} ${landClass} ${
                movableToken ? BOARD_CELL_FOCUS_CLASS : ''
              }`}
            />
          );
        })}
        {tokens.length > 1 && (
          <span
            data-testid={`stack-count-${cellKey}`}
            className={`pointer-events-none absolute -top-1 -right-1 z-30 flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[8px] font-black shadow-sm ring-1 ${
              isBlockade
                ? 'bg-amber-950/90 text-amber-300 ring-amber-400/60'
                : 'bg-black/85 text-white ring-white/30'
            }`}
          >
            {isBlockade && (
              <svg
                className="h-2 w-2 text-amber-300 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              </svg>
            )}
            {tokens.length}
          </span>
        )}
      </div>
    </div>
  );
}
