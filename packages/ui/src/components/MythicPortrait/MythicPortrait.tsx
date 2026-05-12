import { View, Text, styled } from 'tamagui';

export type MythicPortraitProps = {
  monogram: string;
  size?: number;
  testID?: string;
};

const Frame = styled(View, {
  name: 'MythicPortraitFrame',
  position: 'relative',
});

const Disk = styled(View, {
  name: 'MythicPortraitDisk',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

const Arc = styled(View, {
  name: 'MythicPortraitArc',
  position: 'absolute',
  borderWidth: 2,
  borderColor: '$mythicAccent',
});

export function MythicPortrait({
  monogram,
  size = 96,
  testID,
}: MythicPortraitProps) {
  const frameSize = size + 16;
  return (
    <Frame width={frameSize} height={frameSize} testID={testID}>
      <Arc
        top={0}
        left={0}
        width={frameSize}
        height={frameSize}
        borderRadius={frameSize / 2}
        style={{ clipPath: 'inset(0 50% 50% 0)' }}
      />
      <Arc
        top={0}
        left={0}
        width={frameSize}
        height={frameSize}
        borderRadius={frameSize / 2}
        style={{ clipPath: 'inset(50% 0 0 50%)' }}
      />
      <Disk
        position="absolute"
        top={8}
        left={8}
        width={size}
        height={size}
        borderRadius={size / 2}
        style={{
          background: 'linear-gradient(180deg, #22d3ee, #6366f1)',
        }}
      >
        <Text
          fontSize={Math.round(size * 0.55)}
          fontWeight="700"
          color="#ffffff"
        >
          {monogram.slice(0, 2).toUpperCase()}
        </Text>
      </Disk>
      <Text
        position="absolute"
        top={-4}
        right={-4}
        fontSize={28}
        color="#fbbf24"
        aria-label="Crown"
      >
        ♛
      </Text>
    </Frame>
  );
}
