import { useEffect, useState } from 'react';
import { XStack, YStack, Text, styled } from 'tamagui';

export type CountdownClockProps = {
  targetIso: string;
  variant?: 'compact' | 'full';
  onComplete?: () => void;
  testID?: string;
};

const Box = styled(YStack, {
  name: 'CountdownBox',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'rgba(255,255,255,0.04)',
  alignItems: 'center',
  minWidth: 56,
});

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export function CountdownClock({
  targetIso,
  variant = 'full',
  onComplete,
  testID,
}: CountdownClockProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetIso).getTime();
  const remaining = Math.max(0, target - now);

  useEffect(() => {
    if (remaining === 0) onComplete?.();
  }, [remaining, onComplete]);

  const d = Math.floor(remaining / 86_400_000);
  const h = Math.floor((remaining / 3_600_000) % 24);
  const m = Math.floor((remaining / 60_000) % 60);
  const s = Math.floor((remaining / 1000) % 60);

  if (variant === 'compact') {
    return (
      <Text
        fontSize="$5"
        fontWeight="700"
        letterSpacing={1}
        testID={testID}
        accessibilityLabel={`${d} days ${h} hours ${m} minutes`}
      >
        {`${pad(h + d * 24)}:${pad(m)}:${pad(s)}`}
      </Text>
    );
  }

  return (
    <XStack gap="$2" testID={testID}>
      {(
        [
          ['D', d],
          ['H', h],
          ['M', m],
          ['S', s],
        ] as const
      ).map(([k, v]) => (
        <Box key={k}>
          <Text fontSize="$7" fontWeight="700" letterSpacing={1}>
            {pad(v)}
          </Text>
          <Text fontSize="$1" opacity={0.7}>
            {k}
          </Text>
        </Box>
      ))}
    </XStack>
  );
}
