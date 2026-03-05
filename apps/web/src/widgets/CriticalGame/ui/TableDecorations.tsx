import React from 'react';
import {
  SonarSweep,
  FloatingDots,
  CircuitLines,
  Snowflake,
  IceCrystal,
  FrostyVignette,
} from './styles';
import { GAME_VARIANT } from '../lib/constants';

interface TableDecorationsProps {
  variant?: string;
}

const ICE_CRYSTAL_CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

const SNOWFLAKES = [...Array(20)].map((_, i) => ({
  id: i,
  left: (i * 137) % 100,
  delay: (i * 31) % 10,
  duration: 5 + ((i * 17) % 5),
  size: 2 + ((i * 7) % 4),
}));

export function TableDecorations({ variant }: TableDecorationsProps) {
  const snowflakes =
    variant === GAME_VARIANT.HIGH_ALTITUDE_HIKE ? SNOWFLAKES : [];

  if (variant === GAME_VARIANT.UNDERWATER) {
    return (
      <>
        <SonarSweep />
        <FloatingDots />
        <CircuitLines />
      </>
    );
  }

  if (variant === GAME_VARIANT.HIGH_ALTITUDE_HIKE) {
    return (
      <>
        <FrostyVignette />
        {ICE_CRYSTAL_CORNERS.map((corner) => (
          <IceCrystal key={corner} $corner={corner} />
        ))}
        {snowflakes.map((snowflake) => (
          <Snowflake
            key={snowflake.id}
            $left={snowflake.left}
            $delay={snowflake.delay}
            $duration={snowflake.duration}
            $size={snowflake.size}
          />
        ))}
      </>
    );
  }

  return null;
}
