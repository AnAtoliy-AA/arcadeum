import { useTranslation } from '@/shared/i18n/useTranslation';
import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';
import type { PachisiToken } from '../types';
import { YARD_PROGRESS } from '../types';
import { PachisiTokenView } from './PachisiTokenView';

interface PachisiYardProps {
  seat: number;
  ownerId: string | null;
  currentUserId: string | null;
  isActive: boolean;
  tokens: PachisiToken[];
  movable: Set<number>;
  onMove: (tokenId: number) => void;
}

export function PachisiYard({
  seat,
  ownerId,
  currentUserId,
  isActive,
  tokens,
  movable,
  onMove,
}: PachisiYardProps) {
  const { t } = useTranslation();
  const isMine = ownerId != null && ownerId === currentUserId;
  const slotCount = Math.max(tokens.length, 4);

  return (
    <div
      className={`pachisi-yard pachisi-yard-area-${seat} m-[5%] flex items-center justify-center rounded-xl border p-[8%] ${
        ownerId != null ? `pachisi-yard-seat-${seat} border-2` : 'border'
      } ${isActive ? `pachisi-yard-active pachisi-yard-active-seat-${seat}` : ''}`}
    >
      <div className="grid aspect-square h-auto w-full grid-cols-2 grid-rows-2 place-items-center">
        {Array.from({ length: slotCount }).map((_, slot) => {
          const tok = tokens[slot];
          const inYard =
            tok != null && (tok.progress < 0 || tok.progress === YARD_PROGRESS);
          const clickable = inYard && isMine && movable.has(tok.id);

          if (inYard) {
            return (
              <PachisiTokenView
                key={`yard-token-${tok.id}`}
                seat={seat}
                isMovable={clickable}
                isButton={clickable}
                ariaLabel={
                  clickable
                    ? t('games.pachisi_v1.game.moveTokenAria', {
                        id: tok.id,
                      })
                    : undefined
                }
                data-testid={`yard-token-${seat}-${slot}`}
                testId={`yard-token-${seat}-${slot}`}
                onClick={clickable ? () => onMove(tok.id) : undefined}
                className={`pointer-events-auto z-30 aspect-square w-[62%] ${
                  clickable ? BOARD_CELL_FOCUS_CLASS : ''
                }`}
              />
            );
          }

          return (
            <span
              key={`yard-empty-${seat}-${slot}`}
              className="pachisi-yard-slot-empty aspect-square w-[62%] rounded-full opacity-40"
              data-testid={`yard-token-${seat}-${slot}`}
            />
          );
        })}
      </div>
    </div>
  );
}
