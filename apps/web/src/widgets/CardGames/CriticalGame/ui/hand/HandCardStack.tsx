'use client';

import React, { useCallback, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
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
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../../lib/cardUtils';
import { getCardRole, type CardRole } from '../../lib/cardRoles';
import { CardImage, hasArtFor } from '../styles/card-image';
import type { HandCardInstance } from '../../lib/combo';

const TAP_THRESHOLD = 10;
const DOUBLE_TAP_MS = 300;

interface HandCardStackProps {
  card: HandCardInstance;
  instances: HandCardInstance[];
  selectedCount: number;
  disabled?: boolean;
  cardVariant?: string;
  showName?: boolean;
  showDescription?: boolean;
  onSelectCount: (count: number) => void;
  onDoubleClick?: () => void;
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

const ROLE_FALLBACK_ICON: Record<CardRole, React.FC<{ size?: number }>> = {
  attack: SwordsIcon,
  defuse: ShieldIcon,
  skip: FootprintsIcon,
  nope: HandIcon,
  favor: HandshakeIcon,
  see: EyeIcon,
  combo: CardsIcon,
  special: SparklesIcon,
};

export function HandCardStack({
  card,
  instances,
  selectedCount,
  disabled = false,
  cardVariant,
  showName = true,
  showDescription = true,
  onSelectCount,
  onDoubleClick,
}: HandCardStackProps) {
  const { t } = useTranslation();
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const totalCount = instances.length;
  const isSelected = selectedCount > 0;
  const role = getCardRole(card.id);
  const borderColor = ROLE_BORDER[role] ?? '#94a3b8';

  const nameKey = getCardTranslationKey(card.id, cardVariant);
  const descKey = getCardDescriptionKey(card.id);
  const name = t(nameKey as Parameters<typeof t>[0]);
  const description = t(descKey as Parameters<typeof t>[0]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
    },
    [disabled],
  );

  const handleCycleSelection = useCallback(() => {
    if (disabled) return;
    if (totalCount === 1) {
      onSelectCount(selectedCount > 0 ? 0 : 1);
      return;
    }
    if (selectedCount === 0) {
      onSelectCount(1);
    } else if (selectedCount === 1) {
      onSelectCount(2);
    } else if (selectedCount === 2 && totalCount >= 3) {
      onSelectCount(3);
    } else {
      onSelectCount(0);
    }
  }, [disabled, totalCount, selectedCount, onSelectCount]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start) return;

      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx > TAP_THRESHOLD || dy > TAP_THRESHOLD) return;

      const now = Date.now();
      const isDoubleTap = now - lastTapTimeRef.current < DOUBLE_TAP_MS;
      lastTapTimeRef.current = now;

      if (isDoubleTap && onDoubleClick) {
        onDoubleClick();
        return;
      }

      handleCycleSelection();
    },
    [disabled, onDoubleClick, handleCycleSelection],
  );

  const handleDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedCount > 0) {
        onSelectCount(selectedCount - 1);
      }
    },
    [selectedCount, onSelectCount],
  );

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedCount < totalCount) {
        onSelectCount(selectedCount + 1);
      }
    },
    [selectedCount, totalCount, onSelectCount],
  );

  const roleFallback = ROLE_FALLBACK_ICON[role];
  const FallbackIcon = roleFallback ?? CardsIcon;

  return (
    <div className="relative group/stack select-none">
      {/* Visual Stack Layers for Duplicates */}
      {totalCount >= 3 && (
        <div
          className="absolute inset-0 translate-x-2.5 -translate-y-2.5 rounded-xl border border-white/10 bg-slate-950/80 pointer-events-none shadow-md"
          data-testid={`stack-layer-3-${card.id}`}
        />
      )}
      {totalCount >= 2 && (
        <div
          className="absolute inset-0 translate-x-1.5 -translate-y-1.5 rounded-xl border border-white/15 bg-slate-900/80 pointer-events-none shadow-md"
          data-testid={`stack-layer-2-${card.id}`}
        />
      )}

      {/* Main Front Card */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-pressed={isSelected}
        aria-disabled={disabled}
        data-testid={`hand-card-${card.id}`}
        data-role={role}
        data-selected={isSelected ? 'true' : 'false'}
        data-stack-count={totalCount}
        data-selected-count={selectedCount}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={cx(
          'relative flex flex-col items-stretch w-[124px] h-[172px] rounded-xl overflow-hidden cursor-pointer transition-all duration-150 select-none outline-none max-[800px]:w-[92px] max-[800px]:h-[128px] max-[480px]:w-[80px] max-[480px]:h-[112px] bg-slate-900 border-2',
          isSelected
            ? 'border-[#34d399] -translate-y-3.5 shadow-[0_0_16px_rgba(52,211,153,0.5)] z-20'
            : 'border-white/20 hover:-translate-y-2 hover:border-white/50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)]',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
      >
        {/* Full Bleed Card Artwork or Fallback */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          {hasArtFor(cardVariant, card.id) ? (
            <CardImage variant={cardVariant ?? ''} cardType={card.id} />
          ) : (
            <FallbackIcon size={44} />
          )}
        </div>

        {/* Name & Description Scrim */}
        {(showName || showDescription) && (
          <div className="flex flex-col items-stretch absolute left-0 right-0 bottom-0 px-1.5 pb-1.5 pt-4 gap-0.5 pointer-events-none bg-gradient-to-t from-black/95 via-black/75 to-transparent">
            {showName && (
              <span
                className="text-[9px] font-extrabold tracking-[0.3px] uppercase text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-1"
                style={{ color: borderColor }}
              >
                {name}
              </span>
            )}
            {showDescription && (
              <span className="text-[8px] leading-[10px] font-semibold text-center text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-2">
                {description}
              </span>
            )}
          </div>
        )}

        {/* Selection Indicator with Count */}
        {isSelected && (
          <div
            className="flex items-center justify-center absolute top-1 left-1 h-[18px] min-w-[18px] px-1 rounded-full bg-[#34d399] text-[#062317] text-[10px] font-extrabold shadow-[0_0_8px_rgba(52,211,153,0.8)] z-10"
            data-testid={`hand-card-selected-${card.id}`}
          >
            ✓{selectedCount > 1 && ` ${selectedCount}`}
          </div>
        )}

        {/* Total Stack Count Badge */}
        {totalCount > 1 && (
          <div
            className="flex items-center justify-center absolute top-1 right-1 min-w-[18px] h-[18px] px-1.5 rounded-full bg-black/80 border text-[10px] font-extrabold z-10"
            style={{ borderColor, color: borderColor }}
            data-testid={`hand-card-count-${card.id}`}
          >
            ×{totalCount}
          </div>
        )}
      </div>

      {/* Stepper Controls when Stack is Active */}
      {totalCount > 1 && isSelected && !disabled && (
        <div
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1 py-0.5 rounded-full bg-slate-950/95 border border-white/30 shadow-lg z-30"
          data-testid={`stack-stepper-${card.id}`}
        >
          <button
            type="button"
            onClick={handleDecrement}
            aria-label="Decrease selection"
            data-testid={`stack-dec-${card.id}`}
            className="w-4 h-4 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/30 text-white text-[10px] font-bold cursor-pointer transition-colors"
          >
            −
          </button>
          <span className="text-[10px] font-extrabold text-amber-300 px-1">
            {selectedCount}/{totalCount}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={selectedCount >= totalCount}
            aria-label="Increase selection"
            data-testid={`stack-inc-${card.id}`}
            className={cx(
              'w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors',
              selectedCount >= totalCount
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/30 text-white cursor-pointer',
            )}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
