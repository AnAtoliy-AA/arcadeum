'use client';

import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import { CURRENCY_COLOR, CURRENCY_GLYPH } from '../lib/currency';
import type { NextGemPackView, WalletBalanceView } from '../server/shop.types';

const { coins: COIN_GLYPH, gems: GEM_GLYPH } = CURRENCY_GLYPH;
const { coins: COIN_COLOR, gems: GEM_COLOR } = CURRENCY_COLOR;

export interface WalletRailLabels {
  nextPack: string;
  ofTarget: string;
}

export interface WalletRailProps {
  balance: WalletBalanceView;
  nextGemPack: NextGemPackView | null;
  labels: WalletRailLabels;
}

const Tile = styled(Stack, {
  name: 'ShopWalletRailTile',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$3',
  borderWidth: 1,
});

export function WalletRail({ balance, nextGemPack, labels }: WalletRailProps) {
  const { coins, gems } = balance;
  const pct = nextGemPack
    ? Math.min(100, Math.round((gems / nextGemPack.target) * 100))
    : 0;

  return (
    <YStack
      gap="$3"
      padding="$3"
      borderRadius="$4"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.06)"
      backgroundColor="rgba(255,255,255,0.02)"
      data-testid="shop-wallet-rail"
    >
      <XStack gap="$2">
        <Tile
          flex={1}
          backgroundColor="rgba(251,191,36,0.08)"
          borderColor="rgba(251,191,36,0.25)"
        >
          <Text fontSize={16}>{COIN_GLYPH}</Text>
          <Text fontSize="$4" fontWeight="800" color={COIN_COLOR}>
            {coins.toLocaleString()}
          </Text>
        </Tile>
        <Tile
          flex={1}
          backgroundColor="rgba(167,139,250,0.08)"
          borderColor="rgba(167,139,250,0.25)"
        >
          <Text fontSize={16}>{GEM_GLYPH}</Text>
          <Text fontSize="$4" fontWeight="800" color={GEM_COLOR}>
            {gems.toLocaleString()}
          </Text>
        </Tile>
      </XStack>

      {nextGemPack ? (
        <YStack gap={6}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text
              fontSize={10}
              letterSpacing={1.4}
              textTransform="uppercase"
              fontWeight="800"
              color="$gray11"
            >
              {labels.nextPack.replace('{label}', nextGemPack.label)}
            </Text>
            <Text fontSize={11} fontWeight="700" color="$white">
              {labels.ofTarget
                .replace('{current}', gems.toLocaleString())
                .replace('{target}', nextGemPack.target.toLocaleString())}
            </Text>
          </XStack>
          <Stack
            height={6}
            borderRadius={3}
            backgroundColor="rgba(255,255,255,0.06)"
            overflow="hidden"
            data-testid="shop-wallet-progress"
            data-progress={pct}
          >
            <Stack
              width={`${pct}%` as unknown as number}
              height={6}
              backgroundColor={GEM_COLOR}
            />
          </Stack>
        </YStack>
      ) : null}
    </YStack>
  );
}
