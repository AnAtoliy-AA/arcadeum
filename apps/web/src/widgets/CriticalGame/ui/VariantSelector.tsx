import { GAME_VARIANT, CRITICAL_VARIANTS } from '../lib/constants';
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
  const safeVariant = currentVariant || GAME_VARIANT.CYBERPUNK;

  return (
    <GameVariantSelector
      roomId={roomId}
      currentVariant={safeVariant}
      variants={CRITICAL_VARIANTS}
      optionKey="cardVariant"
      disabled={disabled}
    />
  );
}
