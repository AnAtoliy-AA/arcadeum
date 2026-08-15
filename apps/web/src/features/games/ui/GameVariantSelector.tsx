import React, { useMemo, useState } from 'react';
import { Select } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export interface GameVariantOption {
  id: string;
  name: string | TranslationKey;
  emoji?: string;
  description?: string | TranslationKey;
  disabled?: boolean;
}

export interface GameVariantSelectorProps {
  roomId: string;
  hostId?: string;
  currentUserId?: string; // Add if needed, but not required for now
  currentVariant: string;
  variants: ReadonlyArray<GameVariantOption>;
  optionKey?: string; // e.g., 'variant' or 'cardVariant'
  disabled?: boolean;
  className?: string;
  onVariantChange?: (variant: string) => void;
}

export function GameVariantSelector({
  roomId,
  hostId,
  currentVariant,
  variants,
  optionKey = 'variant',
  disabled = false,
  className,
  onVariantChange,
}: GameVariantSelectorProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId: hostId ?? '' });

  // Local state for optimistic updates
  const [internalVariant, setInternalVariant] = useState<string | null>(null);

  const handleVariantChange = (e: { target: { value: string } }) => {
    const newVariant = e.target.value;
    // Optimistic update
    setInternalVariant(newVariant);
    onVariantChange?.(newVariant);
    setOption({ [optionKey]: newVariant });
  };

  // Use currentVariant as the effective value for display logic
  const effectiveVariant = internalVariant ?? currentVariant;

  // Check if effectiveVariant exists in the list
  const displayVariants = useMemo(() => {
    if (!effectiveVariant) return variants;

    const isVariantValid = variants.some((v) => v.id === effectiveVariant);

    if (isVariantValid) return variants;

    return [
      {
        id: effectiveVariant,
        name: `Unknown Variant (${effectiveVariant})`,
        emoji: '❓',
        disabled: true,
      },
      ...variants,
    ];
  }, [effectiveVariant, variants]);

  // Translate variant names and descriptions
  const translatedVariants = useMemo(() => {
    return variants.map((v) => ({
      ...v,
      name:
        typeof v.name === 'string' && v.name.startsWith('games.')
          ? t(v.name as TranslationKey)
          : v.name,
      description:
        typeof v.description === 'string' && v.description.startsWith('games.')
          ? t(v.description as TranslationKey)
          : v.description,
    }));
  }, [variants, t]);

  const selectId = `variant-select-${roomId}`;

  return (
    <Select
      className={className}
      id={selectId}
      name={optionKey}
      value={internalVariant ?? currentVariant ?? ''}
      onChange={handleVariantChange}
      disabled={disabled}
      style={{ minWidth: '200px' }}
      aria-label="Select Game Variant"
      options={displayVariants.map((v) => {
        const translatedVariant =
          translatedVariants.find((tv) => tv.id === v.id) || v;
        return {
          value: translatedVariant.id,
          label: `${translatedVariant.emoji ? `${translatedVariant.emoji} ` : ''}${
            typeof translatedVariant.name === 'string'
              ? translatedVariant.name
              : ''
          }`,
          disabled: !!translatedVariant.disabled,
        };
      })}
    />
  );
}
