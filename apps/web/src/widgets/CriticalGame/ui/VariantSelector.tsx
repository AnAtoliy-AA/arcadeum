import { useState } from 'react';
import { Select } from '@/shared/ui/Select/Select';
import { CARD_VARIANTS, RANDOM_VARIANT, GAME_VARIANT } from '../lib/constants';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

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
  const { snapshot } = useSessionTokens();
  const [loading, setLoading] = useState(false);

  const handleVariantChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newVariant = e.target.value;
    setLoading(true);
    try {
      const url = resolveApiUrl(`/games/rooms/${roomId}/options`);
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
        body: JSON.stringify({
          options: { cardVariant: newVariant },
        }),
      });
    } catch (err) {
      console.error('Failed to update variant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={currentVariant || GAME_VARIANT.CYBERPUNK}
      onChange={handleVariantChange}
      disabled={disabled || loading}
      style={{ minWidth: '200px' }}
    >
      {[...CARD_VARIANTS, RANDOM_VARIANT].map((v) => (
        <option key={v.id} value={v.id}>
          {v.emoji} {v.name}
        </option>
      ))}
    </Select>
  );
}
