'use client';

import { YStack } from 'tamagui';

/**
 * Center column of the Arena. ARC-633 fills this with the turn pill, combo
 * intent card, threat strip, and absolutely-positioned flash banner.
 * For ARC-632 it's a sized placeholder so the three-column grid keeps its
 * shape when the strip is empty.
 */
export function ArenaCenter() {
  return (
    <YStack
      data-testid="arena-center"
      flex={1}
      minHeight={120}
      alignItems="center"
      justifyContent="center"
    />
  );
}
