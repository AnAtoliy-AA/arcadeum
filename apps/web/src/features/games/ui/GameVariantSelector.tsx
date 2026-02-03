import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Select } from '@/shared/ui/Select/Select';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '../api';

export interface GameVariantOption {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
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
    },
  });

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVariant = e.target.value;
    mutate(newVariant);
  };

  return (
    <Select
      value={currentVariant}
      onChange={handleVariantChange}
      disabled={disabled || isPending}
      style={{ minWidth: '200px' }}
      className={className}
    >
      {variants.map((v) => (
        <option key={v.id} value={v.id}>
          {v.emoji ? `${v.emoji} ` : ''}
          {v.name}
        </option>
      ))}
    </Select>
  );
}
