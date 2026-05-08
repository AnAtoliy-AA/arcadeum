import { XStack, Text, styled } from 'tamagui';

export type DeltaChipProps = {
  from: number;
  to: number;
  testID?: string;
};

const Chip = styled(XStack, {
  name: 'DeltaChip',
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
      flat: {
        borderColor: '$borderColor',
        backgroundColor: 'rgba(255,255,255,0.04)',
      },
    },
  } as const,
});

export function DeltaChip({ from, to, testID }: DeltaChipProps) {
  const diff = from - to;
  const direction: 'up' | 'down' | 'flat' =
    diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  const color =
    direction === 'up'
      ? ('$success' as const)
      : direction === 'down'
        ? ('$danger' as const)
        : ('$textSecondary' as const);
  const sign = diff > 0 ? '+' : diff < 0 ? '' : '±';
  return (
    <Chip direction={direction as never} testID={testID}>
      <Text fontSize="$1" opacity={0.7} letterSpacing={1}>
        #{from}
      </Text>
      <Text fontSize="$1" opacity={0.5}>
        →
      </Text>
      <Text fontSize="$1" opacity={0.95} letterSpacing={1}>
        #{to}
      </Text>
      <Text fontSize="$1" fontWeight="700" color={color as never}>
        {sign}
        {Math.abs(diff)}
      </Text>
    </Chip>
  );
}
