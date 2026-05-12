import { YStack, View, styled } from 'tamagui';
import type { ReactNode } from 'react';

export type HeroBackdropProps = {
  children?: ReactNode;
  testID?: string;
};

const ORB_KEYFRAMES = `
@keyframes arcadeum-orb-drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -20px) scale(1.05); }
}
@keyframes arcadeum-orb-drift-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.08); }
}
`;

const STYLE_ID = '__arcadeum-hero-orbs';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = ORB_KEYFRAMES;
  document.head.appendChild(styleEl);
}

const Root = styled(YStack, {
  name: 'HeroBackdrop',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: '$borderColor',
  paddingHorizontal: '$6',
  paddingVertical: '$8',
  minHeight: 240,
  gap: '$4',
});

const Layer = styled(View, {
  name: 'HeroLayer',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
});

export function HeroBackdrop({ children, testID }: HeroBackdropProps) {
  return (
    <Root testID={testID}>
      <Layer
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at top, black 30%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at top, black 30%, transparent 70%)',
          opacity: 0.35,
        }}
      />
      <Layer
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <Layer
        style={{
          top: -40,
          left: -40,
          width: 320,
          height: 320,
          background:
            'radial-gradient(closest-side, rgba(167,139,250,0.45), transparent)',
          filter: 'blur(60px)',
          animation: 'arcadeum-orb-drift-a 14s ease-in-out infinite',
        }}
      />
      <Layer
        style={{
          top: 40,
          right: -60,
          left: 'auto',
          bottom: 'auto',
          width: 280,
          height: 280,
          background:
            'radial-gradient(closest-side, rgba(34,211,238,0.35), transparent)',
          filter: 'blur(70px)',
          animation: 'arcadeum-orb-drift-b 16s ease-in-out infinite',
        }}
      />
      <YStack zIndex={1} gap="$4" position="relative">
        {children}
      </YStack>
    </Root>
  );
}
