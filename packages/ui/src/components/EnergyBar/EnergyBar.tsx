import { View, Text, XStack, styled } from 'tamagui';

export type EnergyBarProps = {
  value: number;
  max: number;
  label?: string;
  height?: number;
  testID?: string;
};

const Track = styled(XStack, {
  name: 'EnergyBarTrack',
  position: 'relative',
  flex: 1,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'rgba(255,255,255,0.04)',
  overflow: 'hidden',
  alignItems: 'center',
});

export function EnergyBar({
  value,
  max,
  label,
  height = 22,
  testID,
}: EnergyBarProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <Track height={height} testID={testID}>
      <View
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        width={`${ratio * 100}%`}
        style={{
          background:
            'linear-gradient(90deg, rgba(236,72,153,0.15), rgba(236,72,153,0.85))',
        }}
      />
      <Text
        position="absolute"
        right={8}
        fontSize="$2"
        fontWeight="700"
        color="#ffffff"
        letterSpacing={1}
      >
        {label ?? value.toLocaleString()}
      </Text>
    </Track>
  );
}
