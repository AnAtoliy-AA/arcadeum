import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CriticalTableStyles } from '../styles';

interface CardDecorProps {
  gradientColors: string[];
  gradientCoords: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  styles: CriticalTableStyles;
}

export function CardDecor({
  gradientColors,
  gradientCoords,
  styles,
}: CardDecorProps) {
  return (
    <View style={styles.cardBackdrop} pointerEvents="none">
      <LinearGradient
        colors={gradientColors}
        start={gradientCoords.start}
        end={gradientCoords.end}
        style={styles.cardGradientLayer}
      />
      <View style={styles.cardGlowPrimary} />
      <View style={styles.cardGlowSecondary} />
      <View style={styles.cardAccentTop} />
      <View style={styles.cardAccentBottom} />
    </View>
  );
}
