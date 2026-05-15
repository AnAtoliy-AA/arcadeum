import { YStack } from 'tamagui';

export function AuthPageBackground() {
  return (
    <>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        style={{
          background: [
            'radial-gradient(42% 42% at 14% 18%, color-mix(in srgb, var(--accent, #38bdf8) 28%, transparent), transparent 70%)',
            'radial-gradient(40% 40% at 86% 84%, color-mix(in srgb, #ff6af7 22%, transparent), transparent 70%)',
          ].join(', '),
        }}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          WebkitMaskImage:
            'radial-gradient(72% 72% at 50% 50%, black 30%, transparent 100%)',
          maskImage:
            'radial-gradient(72% 72% at 50% 50%, black 30%, transparent 100%)',
        }}
      />
    </>
  );
}
