import { useTranslation } from '@/shared/i18n/useTranslation';
import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';
import type { PachisiToken } from '../types';
import { YARD_PROGRESS } from '../types';
import { PachisiTokenView } from './PachisiTokenView';
import { moveAriaFor } from '../lib/moveAria';
import { TEAM_ACCENTS, type TeamIndex } from '../lib/teams';

interface PachisiYardProps {
  seat: number;
  ownerId: string | null;
  currentUserId: string | null;
  isActive: boolean;
  tokens: PachisiToken[];
  movable: Set<number>;
  onMove: (tokenId: number) => void;
  /** Team index in 2v2 mode (undefined otherwise). */
  team?: TeamIndex | null;
  /** True for the viewer's own yard. */
  isSelf?: boolean;
  /** True for the viewer's partner's yard. */
  isPartner?: boolean;
  /** Current die, used to describe the destination in aria labels. */
  die?: number | null;
  /** Token ids just captured; they play the sent-home animation. */
  sentHomeIds?: ReadonlySet<number>;
  /** Destination preview: token id on hover/focus, null on leave. */
  onPreview?: (tokenId: number | null) => void;
}

export function PachisiYard({
  seat,
  ownerId,
  currentUserId,
  isActive,
  tokens,
  movable,
  onMove,
  team = null,
  isSelf = false,
  isPartner = false,
  die = null,
  sentHomeIds,
  onPreview,
}: PachisiYardProps) {
  const { t } = useTranslation();
  const isMine = ownerId != null && ownerId === currentUserId;
  const slotCount = Math.max(tokens.length, 4);

  return (
    <div
      className={`pachisi-yard pachisi-yard-area-${seat} relative m-[5%] flex items-center justify-center rounded-xl border p-[8%] ${
        ownerId != null ? `pachisi-yard-seat-${seat} border-2` : 'border'
      } ${isActive ? `pachisi-yard-active pachisi-yard-active-seat-${seat}` : ''}`}
      data-team={team ?? undefined}
    >
      {team !== null && ownerId != null && (
        <span
          className="pointer-events-none absolute left-1 top-0.5 z-40 flex max-w-[95%] items-center gap-1 truncate rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase leading-none tracking-wide text-white shadow"
          style={{
            backgroundColor: TEAM_ACCENTS[team].solid,
            transform: 'rotate(var(--pachisi-counter-rot, 0deg))',
          }}
          data-testid={`pachisi-yard-team-${seat}`}
        >
          {t('games.pachisi_v1.game.team.label', { n: team + 1 })}
          {isSelf && <span>{`· ${t('games.pachisi_v1.game.team.you')}`}</span>}
          {isPartner && (
            <span>{`· ${t('games.pachisi_v1.game.team.partner')}`}</span>
          )}
        </span>
      )}
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
                isPartner={isPartner}
                progress={tok.progress}
                onHoverChange={
                  clickable && onPreview
                    ? (active) => onPreview(active ? tok.id : null)
                    : undefined
                }
                ariaLabel={
                  clickable
                    ? isPartner
                      ? t('games.pachisi_v1.game.team.movePartnerTokenAria', {
                          id: tok.id,
                        })
                      : (() => {
                          const { key, params } = moveAriaFor(seat, tok, die);
                          return t(key, params);
                        })()
                    : undefined
                }
                data-testid={`yard-token-${seat}-${slot}`}
                testId={`yard-token-${seat}-${slot}`}
                onClick={clickable ? () => onMove(tok.id) : undefined}
                className={`pointer-events-auto z-30 aspect-square w-[62%] ${
                  sentHomeIds?.has(tok.id) ? 'pachisi-token-sent-home' : ''
                } ${clickable ? BOARD_CELL_FOCUS_CLASS : ''}`}
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
