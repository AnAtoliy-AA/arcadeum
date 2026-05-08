import { XStack, Text, styled } from 'tamagui';

export type TrendPillProps = {
  rank: number;
  prevRank?: number;
  testID?: string;
};

const Pill = styled(XStack, {
  name: 'TrendPill',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 999,
  borderWidth: 1,
  variants: {
    direction: {
      up: {
        borderColor: 'rgba(52,211,153,0.3)',
        backgroundColor: 'rgba(52,211,153,0.15)',
      },
      down: {
        borderColor: 'rgba(239,68,68,0.3)',
        backgroundColor: 'rgba(239,68,68,0.15)',
      },
      same: {
        borderColor: '$borderColor',
        backgroundColor: 'rgba(255,255,255,0.04)',
      },
    },
  } as const,
});

export function TrendPill({ rank, prevRank, testID }: TrendPillProps) {
  const diff = prevRank == null ? 0 : prevRank - rank;
  const direction: 'up' | 'down' | 'same' =
    diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
  const glyph = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '–';
  const color =
    direction === 'up'
      ? ('$success' as const)
      : direction === 'down'
        ? ('$danger' as const)
        : ('$textSecondary' as const);
  return (
    <Pill direction={direction as never} testID={testID}>
      <Text fontSize="$1" fontWeight="700" color={color as never}>
        {glyph}
      </Text>
      {direction !== 'same' ? (
        <Text fontSize="$1" fontWeight="700" color={color as never}>
          {Math.abs(diff)}
        </Text>
      ) : null}
    </Pill>
  );
}
