import { CARD_VARIANTS, RANDOM_VARIANT, GAME_VARIANT } from '../lib/constants';
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
  const combinedVariants = [...CARD_VARIANTS, RANDOM_VARIANT];
  const safeVariant = currentVariant || GAME_VARIANT.CYBERPUNK;

  return (
    <GameVariantSelector
      roomId={roomId}
      currentVariant={safeVariant}
      variants={combinedVariants}
      optionKey="cardVariant"
      disabled={disabled}
    />
  );
}
