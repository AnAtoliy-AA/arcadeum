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
          <span className="pointer-events-none absolute -top-1 -right-1 z-30 rounded-full bg-black/85 px-1 py-0.2 text-[8px] font-black text-white shadow-sm ring-1 ring-white/30">
            {tokens.length}
          </span>
        )}
      </div>
    </div>
  );
}
