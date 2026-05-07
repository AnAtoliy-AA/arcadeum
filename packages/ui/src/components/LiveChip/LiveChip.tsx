import { XStack, View, Text, styled } from 'tamagui';
import { useEffect, useState } from 'react';

export type LiveChipProps = {
  label?: string;
  testID?: string;
};

const Root = styled(XStack, {
  name: 'LiveChip',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: 'rgba(239,68,68,0.5)',
  backgroundColor: 'rgba(239,68,68,0.12)',
});

const Dot = styled(View, {
  name: 'LiveDot',
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#ef4444',
});

export function LiveChip({ label = 'Live', testID }: LiveChipProps) {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 800);
    return () => clearInterval(id);
  }, []);
  return (
    <Root testID={testID}>
      <Dot opacity={pulse ? 1 : 0.35} />
      <Text fontSize="$1" fontWeight="700" letterSpacing={1} color="#ef4444">
        {label.toUpperCase()}
      </Text>
    </Root>
  );
}
