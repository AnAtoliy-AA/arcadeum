'use client';

import { useState } from 'react';
import { GlassCard, Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

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
};

export function BotSelector({
  personalities,
  selectedId,
  onSelect,
  disabled,
}: BotSelectorProps) {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const displayId = hoveredId ?? selectedId;
  const selected = personalities.find((p) => p.id === displayId);

  return (
    <div className="flex flex-col gap-3">
      <Typography variant="label" uiSize="sm">
        {t('games.chess_v1.lobby.botPersonality')}
      </Typography>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {personalities.map((p) => {
          const isActive = p.id === selectedId;
          const styleColor = STYLE_COLORS[p.style] ?? '#6366f1';
          return (
            <button
              key={p.id}
              disabled={disabled}
              onClick={() => onSelect(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                isActive
                  ? 'border-[rgba(99,102,241,0.5)] bg-[rgba(99,102,241,0.15)]'
                  : 'border-[var(--glassBorder)] bg-[var(--glassBg)] hover:bg-[var(--glassBgHover)]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-2xl">{p.avatar}</span>
              <span className="text-xs font-semibold text-[var(--color)]">
                {p.name}
              </span>
              <span className="text-[10px] text-[var(--textMuted)]">
                {p.rating} ELO
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: styleColor }}
              >
                {p.style}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selected.avatar}</span>
            <div>
              <Typography variant="body" uiSize="sm">
                {selected.name}
              </Typography>
              <Typography variant="caption" uiSize="xs">
                {selected.rating} ELO — {selected.style}
              </Typography>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
