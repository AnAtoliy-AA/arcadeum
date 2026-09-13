'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';

export interface BotPersonalityOption {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  style: string;
}

interface BotSelectorProps {
  personalities: BotPersonalityOption[];
  selectedId: string | null;
  onSelect: (personalityId: string) => void;
  disabled?: boolean;
}

const STYLE_COLORS: Record<string, string> = {
  aggressive: '#ef4444',
  positional: '#3b82f6',
  tactical: '#f59e0b',
  defensive: '#22c55e',
  solid: '#8b5cf6',
  balanced: '#6366f1',
  greedy: '#eab308',
  gambit: '#f97316',
  fortress: '#06b6d4',
  trickster: '#a855f7',
};

export function BotSelector({
  personalities,
  selectedId,
  onSelect,
  disabled,
}: BotSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = personalities.find(
    (p) => p.id === (hoveredId ?? selectedId),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPersonality = personalities.find((p) => p.id === selectedId);

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
            open
              ? 'border-[rgba(99,102,241,0.5)] bg-[rgba(99,102,241,0.08)]'
              : 'border-[var(--glassBorder)] bg-[var(--glassBg)] hover:bg-[var(--glassBgHover)]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {selectedPersonality ? (
            <>
              <span className="text-lg">{selectedPersonality.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--color)] truncate">
                  {selectedPersonality.name}
                </div>
                <div className="text-[10px] text-[var(--textSecondary)]">
                  {selectedPersonality.rating} ELO — {selectedPersonality.style}
                </div>
              </div>
            </>
          ) : (
            <span className="text-sm text-[var(--textSecondary)]">
              {t('games.chess_v1.lobby.selectBot')}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[var(--textSecondary)] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full max-h-[320px] overflow-y-auto rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] backdrop-blur-xl shadow-lg">
            {personalities.map((p) => {
              const isActive = p.id === selectedId;
              const styleColor = STYLE_COLORS[p.style] ?? '#6366f1';
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'bg-[rgba(99,102,241,0.12)]'
                      : 'hover:bg-[var(--glassBgHover)]'
                  }`}
                >
                  <span className="text-lg shrink-0">{p.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--color)] truncate">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--textSecondary)]">
                        {p.rating} ELO
                      </span>
                      <span
                        className="rounded-full px-1.5 py-px text-[9px] font-medium text-white"
                        style={{ backgroundColor: styleColor }}
                      >
                        {p.style}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[var(--primary)] text-sm shrink-0">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          <span className="text-lg">{selected.avatar}</span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[var(--color)] truncate">
              {selected.name}
            </div>
            <div className="text-[10px] text-[var(--textSecondary)]">
              {selected.rating} ELO — {selected.style}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
