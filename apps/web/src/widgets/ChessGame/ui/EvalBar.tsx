'use client';

import { useMemo } from 'react';
import { Text } from 'tamagui';
import { EvalBarContainer } from './styles';

interface EvalBarProps {
  evalScore: number | null;
}

export function EvalBar({ evalScore }: EvalBarProps) {
  const advantage = useMemo(() => {
    if (evalScore == null) return 50;
    const clamped = Math.max(-5, Math.min(5, evalScore));
    return 50 + (clamped / 5) * 40;
  }, [evalScore]);

  const barColor =
    advantage > 55
      ? 'rgba(34, 197, 94, 0.8)'
      : advantage < 45
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(148, 163, 184, 0.4)';

  return (
    <EvalBarContainer>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${advantage}%`,
          background: barColor,
          transition: 'height 0.5s ease, background 0.5s ease',
          borderRadius: '0 0 5px 5px',
        }}
      />
      <Text
        position="absolute"
        top={4}
        left={0}
        right={0}
        textAlign="center"
        fontSize={8}
        fontWeight="700"
        color="rgba(255, 255, 255, 0.5)"
      >
        ♔
      </Text>
      <Text
        position="absolute"
        bottom={4}
        left={0}
        right={0}
        textAlign="center"
        fontSize={8}
        fontWeight="700"
        color="rgba(255, 255, 255, 0.5)"
      >
        ♚
      </Text>
    </EvalBarContainer>
  );
}
