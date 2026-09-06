'use client';

import { useState } from 'react';
import { GlassCard, Typography, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface SpectatorOverlayProps {
  viewerCount: number;
  isSpectating: boolean;
  engineEval?: string;
  onJoinGame?: () => void;
}

export function SpectatorOverlay({
  viewerCount,
  isSpectating,
  engineEval,
  onJoinGame,
}: SpectatorOverlayProps) {
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState(false);

  if (!isSpectating) return null;

  return (
    <div className="flex flex-col gap-2">
      <GlassCard className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <Typography variant="caption" uiSize="xs">
            {viewerCount} {t('games.chess_v1.spectator.viewers')}
          </Typography>
        </div>
        {engineEval && (
          <Typography variant="caption" uiSize="xs" className="text-[var(--primary)]">
            {engineEval}
          </Typography>
        )}
        {onJoinGame && (
          <Button variant="secondary" size="sm" onClick={onJoinGame}>
            {t('games.chess_v1.spectator.joinGame')}
          </Button>
        )}
      </GlassCard>
    </div>
  );
}
