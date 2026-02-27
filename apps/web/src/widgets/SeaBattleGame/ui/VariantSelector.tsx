import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { GameVariantSelector } from '@/features/games/ui/GameVariantSelector';

interface VariantSelectorProps {
  roomId: string;
  currentVariant: string;
  disabled?: boolean;
}

export function VariantSelector({
  roomId,
  currentVariant,
  disabled = false,
}: VariantSelectorProps) {
  return (
    <GameVariantSelector
      roomId={roomId}
      currentVariant={currentVariant}
      variants={SEA_BATTLE_VARIANTS}
      optionKey="variant"
      disabled={disabled}
    />
  );
}
