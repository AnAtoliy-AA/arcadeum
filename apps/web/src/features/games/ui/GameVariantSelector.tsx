import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Select } from '@/shared/ui/Select/Select';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '../api';

export interface GameVariantOption {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
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
    onError: (err) => {
      console.error('Failed to update variant:', err);
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
      {displayVariants.map((v) => (
        <option key={v.id} value={v.id} disabled={!!v.disabled}>
          {v.emoji ? `${v.emoji} ` : ''}
          {v.name}
        </option>
      ))}
    </Select>
  );
}
