'use client';

import { TIC_TAC_TOE_VARIANTS } from '../lib/constants';
import { GameVariantSelector } from '@/features/games/ui/GameVariantSelector';

interface VariantSelectorProps {
  roomId: string;
  hostId?: string;
  currentVariant: string;
  disabled?: boolean;
  onVariantChange?: (variant: string) => void;
}

export function VariantSelector({
  roomId,
  hostId,
  currentVariant,
  disabled = false,
  onVariantChange,
}: VariantSelectorProps) {
  return (
    <GameVariantSelector
      roomId={roomId}
      hostId={hostId}
      currentVariant={currentVariant}
      variants={TIC_TAC_TOE_VARIANTS}
      optionKey="variant"
      disabled={disabled}
      onVariantChange={onVariantChange}
    />
  );
}
