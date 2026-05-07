import { XStack, View, Text, styled } from 'tamagui';

export type LiveChipProps = {
  label?: string;
  testID?: string;
};

const PULSE_STYLE_ID = '__arcadeum-live-pulse';
const PULSE_KEYFRAMES = `
@keyframes arcadeum-live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById(PULSE_STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = PULSE_STYLE_ID;
  styleEl.textContent = PULSE_KEYFRAMES;
  document.head.appendChild(styleEl);
}

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
  return (
    <Root testID={testID}>
      <Dot
        style={{ animation: 'arcadeum-live-pulse 1.6s ease-in-out infinite' }}
      />
      <Text fontSize="$1" fontWeight="700" letterSpacing={1} color="#ef4444">
        {label.toUpperCase()}
      </Text>
    </Root>
  );
}
