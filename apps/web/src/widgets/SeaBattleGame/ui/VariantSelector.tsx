import { useMemo } from 'react';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { GameVariantSelector } from '@/features/games/ui/GameVariantSelector';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

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
  const { t } = useTranslation();

  const translatedVariants = useMemo(() => {
    return SEA_BATTLE_VARIANTS.map((v) => ({
      ...v,
      name: t(v.name as TranslationKey),
      description: t(v.description as TranslationKey),
    }));
  }, [t]);

  return (
    <GameVariantSelector
      roomId={roomId}
      currentVariant={currentVariant}
      variants={translatedVariants}
      optionKey="variant"
      disabled={disabled}
    />
  );
}
