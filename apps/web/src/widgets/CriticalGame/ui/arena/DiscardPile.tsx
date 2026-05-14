'use client';

import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../../types';
import { LastPlayedCardDisplay } from '../LastPlayedCardDisplay';
import { CardSlot } from '../styles';
import { getCardDescriptionKey } from '../../lib/cardUtils';

interface DiscardPileProps {
  pile: CriticalCard[];
  cardVariant?: string;
  /** Phones use a shrunk 80×112 slot so the three-column row fits. */
  isNarrow?: boolean;
}

export function DiscardPile({
  pile,
  cardVariant,
  isNarrow = false,
}: DiscardPileProps) {
  const { t } = useTranslation();
  const count = pile.length;
  const tCompat = t as unknown as (key: string) => string;
  const lastCard = pile.length > 0 ? pile[pile.length - 1] : null;
  const description = lastCard ? t(getCardDescriptionKey(lastCard)) : '';

  return (
    <YStack
      data-testid="arena-discard-pile"
      alignItems="center"
      gap="$1"
      flexShrink={0}
    >
      {/* `LastPlayedCardDisplay` renders `LastPlayedCard`, which is
          `position: absolute` with width/height 100%. Without a sized,
          positioned slot it expands to fill the nearest positioned
          ancestor and dominates the arena. `CardSlot` is what the legacy
          table layout uses for the same component. */}
      <CardSlot
        $role="lastPlayed"
        width={isNarrow ? 80 : 140}
        height={isNarrow ? 112 : 196}
      >
        <LastPlayedCardDisplay
          discardPile={pile}
          t={tCompat}
          cardVariant={cardVariant}
        />
        {/* Description overlay so the played card carries the same
            context the hand cards do (name lives in CardNameContainer
            inside LastPlayedCardDisplay already). Bottom-anchored scrim
            so the artwork's top half stays visible. Hidden on phones
            where the 80×112 slot can't accommodate readable text.

            `zIndex: 20` deliberately sits above `LastPlayedCard`'s
            `zIndex: 10` — without this the card painted on top of the
            scrim and the description never showed.

            `borderRadius` matches the card's so the scrim bottom
            follows the rounded card edge instead of extending past it
            with square corners. */}
        {!isNarrow && lastCard && description && (
          <div
            data-testid="arena-discard-pile-description"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '14px 8px 8px',
              pointerEvents: 'none',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)',
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
              zIndex: 20,
            }}
          >
            <span
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: 10,
                lineHeight: '13px',
                textAlign: 'center',
                color: 'rgba(226, 232, 240, 0.92)',
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
              title={description}
            >
              {description}
            </span>
          </div>
        )}
      </CardSlot>
      <Text
        data-testid="arena-discard-pile-count"
        fontSize={12}
        fontWeight="800"
        letterSpacing={0.4}
        opacity={0.85}
      >
        {t('games.table.state.discard')} · {count}
      </Text>
    </YStack>
  );
}
