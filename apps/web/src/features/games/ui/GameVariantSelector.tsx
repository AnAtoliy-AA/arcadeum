import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Select } from '@/shared/ui/Select/Select';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '../api';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

export interface GameVariantOption {
  id: string;
  name: string | TranslationKey;
  emoji?: string;
  description?: string | TranslationKey;
  disabled?: boolean;
}

export interface GameVariantSelectorProps {
  roomId: string;
  currentVariant: string;
  variants: ReadonlyArray<GameVariantOption>;
  optionKey?: string; // e.g., 'variant' or 'cardVariant'
  disabled?: boolean;
  className?: string;
}

export function GameVariantSelector({
  roomId,
  currentVariant,
  variants,
  optionKey = 'variant',
  disabled = false,
  className,
}: GameVariantSelectorProps) {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();

  // Local state for optimistic updates
  const [internalVariant, setInternalVariant] = useState(currentVariant);

  // Sync internal state when prop changes
  useEffect(() => {
    setInternalVariant(currentVariant);
  }, [currentVariant]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (newVariant: string) => {
      await gamesApi.updateRoomOptions(
        roomId,
        { [optionKey]: newVariant },
        { token: snapshot.accessToken ?? undefined },
      );
    },
    onError: (_err) => {
      // Revert to prop value on error
      setInternalVariant(currentVariant);
    },
  });

  const handleVariantChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newVariant = e.target.value;
    // Optimistic update
    setInternalVariant(newVariant);
    mutate(newVariant);
  };

  // Check if internalVariant exists in the list
  const displayVariants = useMemo(() => {
    // If internalVariant is falsy, we don't need to add a fallback
    if (!internalVariant) return variants;

    const isVariantValid = variants.some((v) => v.id === internalVariant);

    // If valid, just return original variants
    if (isVariantValid) return variants;

    // If invalid, prepend the unknown option
    return [
      {
        id: internalVariant,
        name: `Unknown Variant (${internalVariant})`,
        emoji: '❓',
        disabled: true,
      },
      ...variants,
    ];
  }, [internalVariant, variants]);

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
      id={selectId}
      name={optionKey}
      value={internalVariant || ''}
      onChange={handleVariantChange}
      disabled={disabled || isPending}
      style={{ minWidth: '200px' }}
      className={className}
      aria-label="Select Game Variant"
    >
      {displayVariants.map((v) => {
        const translatedVariant =
          translatedVariants.find((tv) => tv.id === v.id) || v;
        return (
          <option
            key={translatedVariant.id}
            value={translatedVariant.id}
            disabled={!!translatedVariant.disabled}
          >
            {translatedVariant.emoji ? `${translatedVariant.emoji} ` : ''}
            {typeof translatedVariant.name === 'string'
              ? translatedVariant.name
              : ''}
          </option>
        );
      })}
    </Select>
  );
}
