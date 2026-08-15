'use client';

import {
  CardsIcon,
  EyeIcon,
  FootprintsIcon,
  HandIcon,
  HandshakeIcon,
  ShieldIcon,
  SparklesIcon,
  SwordsIcon,
} from '@arcadeum/ui';
import type { FC } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../../lib/cardUtils';
import { getCardRole, type CardRole } from '../../lib/cardRoles';
import { CardImage, hasArtFor } from '../styles/card-image';
import type { HandCardInstance } from '../../lib/combo';

interface HandCardProps {
  card: HandCardInstance;
  isSelected: boolean;
  disabled?: boolean;
  cardVariant?: string;
  /**
   * Number of duplicates of this card type in the hand. When > 1, a
   * count badge ("×N") is rendered in the top-right corner. The widget
   * still renders one tile per copy so each can be individually
   * selected — the badge is a quick legibility cue, not a stack.
   */
  count?: number;
  /** Show / hide the uppercase card name under the art (default: true). */
  showName?: boolean;
  /** Show / hide the description block under the name (default: true). */
  showDescription?: boolean;
  onToggle: () => void;
}

const ROLE_BORDER: Record<CardRole, string> = {
  attack: '#ef4444',
  defuse: '#34d399',
  skip: '#38bdf8',
  nope: '#f59e0b',
  favor: '#a78bfa',
  see: '#22d3ee',
  combo: '#facc15',
  special: '#f472b6',
};

// Glow colours are now CSS-attribute-keyed in `hudStyles.tsx` (§4.1) —
// the ::after pseudo-element reads `data-role` and `data-selected` and
// drives box-shadow + radius via custom properties. No JS payload.

/**
 * Fallback icon used when the active card variant has no sprite sheet
 * (e.g. the unthemed "default" variant). Keyed by role so the icon at
 * least tracks the border colour. SVG components render consistently
 * across OSes — the prior emoji glyphs (⚔, 🛡, 🃏, …) were Windows /
 * macOS / Android renderings apart.
 */
const ROLE_FALLBACK_ICON: Record<CardRole, FC<{ size?: number }>> = {
  attack: SwordsIcon,
  defuse: ShieldIcon,
  skip: FootprintsIcon,
  nope: HandIcon,
  favor: HandshakeIcon,
  see: EyeIcon,
  combo: CardsIcon,
  special: SparklesIcon,
};

const SELECT_RING = '#34d399';

/**
 * Single-card cell for the widget-mode hand. Renders the variant's
 * sprite via `<CardImage>` when available, with a role-keyed fallback
 * glyph as the underlay for the unthemed "default" variant. Name +
 * description overlay a bottom scrim so the artwork stays visible.
 * Border colour comes from the card's role family (`cardRoles.ts`);
 * selection lifts the cell and swaps the border to the accent green.
 * The legacy `PlayerHand` keeps the rich table-mode card on the
 * flag-off path.
 */
export function HandCard({
  card,
  isSelected,
  disabled = false,
  cardVariant,
  count,
  showName = true,
  showDescription = true,
  onToggle,
}: HandCardProps) {
  const { t } = useTranslation();
  const role = getCardRole(card.id);
  const name = t(getCardTranslationKey(card.id, cardVariant));
  const description = t(getCardDescriptionKey(card.id));
  const borderColor = isSelected ? SELECT_RING : ROLE_BORDER[role];
  // Stable id so the outer button can `aria-describedby` the visible
  // description block. Screen readers otherwise stop at the aria-label
  // (card name) and never hear the rules text.
  const descriptionId = `hand-card-description-${card.uid}`;
  const linkDescription = showDescription && !!description;

  // Fixed card silhouette (~3:4) regardless of which text rows show —
  // text overlays the art rather than pushing the cell taller. Cell
  // dimensions stay constant across selection so the lift doesn't
  // displace neighbouring cards in the fan; the translateY + border
  // swap + glow are enough to read selection.

  return (
    <div
      className={`box-border flex flex-col items-stretch rounded-[10px] border-[2px] bg-[rgba(8,12,20,0.85)] overflow-hidden relative shrink-0 w-[124px] h-[172px] transition-transform duration-150 ease-out ${disabled ? '' : 'hover:translate-y-[-4px]'} focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#34d399]`}
      style={{
        borderColor: borderColor,
        transform: isSelected ? 'translateY(-8px)' : undefined,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
      }}
      onClick={disabled ? undefined : onToggle}
      data-testid={`hand-card-${card.uid}`}
      data-card={card.id}
      data-role={role}
      data-selected={isSelected ? 'true' : 'false'}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      aria-label={name}
      aria-describedby={linkDescription ? descriptionId : undefined}
      onKeyDown={
        disabled
          ? undefined
          : (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
              }
            }
      }
    >
      <CardArt
        cardId={card.id}
        cardVariant={cardVariant}
        role={role}
        testId={`hand-card-art-${card.uid}`}
      />
      {(showName || showDescription) && (
        <div
          className="box-border flex flex-col items-stretch absolute left-0 right-0 bottom-0 px-8 pb-8 gap-2 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)',
          }}
          data-testid={`hand-card-overlay-${card.uid}`}
        >
          {showName && (
            <span
              className="box-border text-[11px] font-extrabold tracking-[0.4px] uppercase text-center line-clamp-1"
              style={{ color: borderColor }}
              data-testid={`hand-card-name-${card.uid}`}
            >
              {name}
            </span>
          )}
          {showDescription && (
            <span
              className="box-border text-[40px] leading-[12px] text-center line-clamp-2 text-[rgba(226,_232,_240,_0.88)]"
              id={descriptionId}
              data-testid={descriptionId}
            >
              {description}
            </span>
          )}
        </div>
      )}
      {!!count && count > 1 && (
        <div
          className="box-border flex flex-col absolute top-[4px] right-[4px] min-w-[20px] h-[20px] px-4 rounded-[9999px] bg-[rgba(0,0,0,0.75)] border items-center justify-center"
          style={{ borderColor: borderColor }}
          data-testid={`hand-card-count-${card.uid}`}
        >
          <span
            className="box-border text-[48px] font-extrabold"
            style={{ color: borderColor }}
          >
            ×{count}
          </span>
        </div>
      )}
    </div>
  );
}

interface CardArtProps {
  cardId: string;
  cardVariant?: string;
  role: CardRole;
  testId: string;
}

/**
 * Full-bleed art slot. Renders the variant's sprite when art is
 * available for `(variant, cardId)`; otherwise the role-keyed fallback
 * glyph. Never both — stacking them caused the glyph to bleed through
 * the sprite as a centre smudge.
 */
function CardArt({ cardId, cardVariant, role, testId }: CardArtProps) {
  const showArt = hasArtFor(cardVariant, cardId);
  return (
    <div
      className="box-border flex flex-col absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-[rgba(0,0,0,0.45)]"
      data-testid={testId}
    >
      {showArt ? (
        <CardImage variant={cardVariant ?? ''} cardType={cardId} />
      ) : (
        (() => {
          const FallbackIcon = ROLE_FALLBACK_ICON[role];
          return (
            <div
              className="box-border flex flex-col items-stretch opacity-[0.55]"
              data-testid={`hand-card-fallback-${role}`}
            >
              <FallbackIcon size={56} />
            </div>
          );
        })()
      )}
    </div>
  );
}
