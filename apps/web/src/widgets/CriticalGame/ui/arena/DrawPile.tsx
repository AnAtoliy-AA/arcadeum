'use client';

import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../../types';
import { DeckDisplay } from '../DeckDisplay';

interface DrawPileProps {
  deck: CriticalCard[];
  count: number;
  disabled: boolean;
  onDraw: () => void;
  cardVariant?: string;
}

export function DrawPile({
  deck,
  count,
  disabled,
  onDraw,
  cardVariant,
}: DrawPileProps) {
  const { t } = useTranslation();
  // DeckDisplay's `t` prop accepts the unparameterised string form used by
  // the existing layout — cast through to keep the typed namespace inside
  // the new components without forking DeckDisplay just for ARC-632.
  const tCompat = t as unknown as (key: string) => string;

  return (
    <YStack
      data-testid="arena-draw-pile"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={t('games.table.arena.drawAria')}
      onPress={disabled ? undefined : onDraw}
      onKeyDown={
        disabled
          ? undefined
          : (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDraw();
              }
            }
      }
      alignItems="center"
      gap="$1"
      opacity={disabled ? 0.55 : 1}
      cursor={disabled ? 'default' : 'pointer'}
      hoverStyle={disabled ? undefined : { scale: 1.02 }}
      pressStyle={disabled ? undefined : { scale: 0.98 }}
    >
      <DeckDisplay deck={deck} t={tCompat} cardVariant={cardVariant} />
      <Text
        data-testid="arena-draw-pile-count"
        fontSize={12}
        fontWeight="800"
        letterSpacing={0.4}
        opacity={0.85}
      >
        {t('games.table.state.deck')} · {count}
      </Text>
      <Text
        data-testid="arena-draw-pile-hint"
        fontSize={10}
        fontWeight="600"
        letterSpacing={0.4}
        textTransform="uppercase"
        opacity={0.6}
      >
        {t('games.table.arena.drawHint')}
      </Text>
    </YStack>
  );
}
