import { GAME_VARIANT, CRITICAL_VARIANTS } from '../lib/constants';
import { GameVariantSelector } from '@/features/games/ui/GameVariantSelector';

interface VariantSelectorProps {
  roomId: string;
  hostId?: string;
  currentVariant: string;
  disabled?: boolean;
}

export function VariantSelector({
  roomId,
  hostId,
  currentVariant,
  disabled = false,
}: VariantSelectorProps) {
  const safeVariant = currentVariant || GAME_VARIANT.CYBERPUNK;

  return (
    <GameVariantSelector
      roomId={roomId}
      hostId={hostId}
      currentVariant={safeVariant}
      variants={CRITICAL_VARIANTS}
      optionKey="cardVariant"
      disabled={disabled}
    />
  );
}
