import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { GameVariantSelector } from '@/features/games/ui/GameVariantSelector';

interface VariantSelectorProps {
  roomId: string;
  currentVariant: string;
  disabled?: boolean;
  onVariantChange?: (variant: string) => void;
}

export function VariantSelector({
  roomId,
  currentVariant,
  disabled = false,
  onVariantChange,
}: VariantSelectorProps) {
  return (
    <GameVariantSelector
      roomId={roomId}
      currentVariant={currentVariant}
      variants={SEA_BATTLE_VARIANTS}
      optionKey="variant"
      disabled={disabled}
      onVariantChange={onVariantChange}
    />
  );
}
