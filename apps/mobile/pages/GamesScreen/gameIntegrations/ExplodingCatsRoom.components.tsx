import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BACKGROUND_GRADIENT_COORDS } from './ExplodingCatsRoom.constants';
import type { ExplodingCatsRoomStyles } from './ExplodingCatsRoom.styles';

interface NeonBackdropProps {
  backgroundGradientColors: string[];
  styles: ExplodingCatsRoomStyles;
}

export function NeonBackdrop({ backgroundGradientColors, styles }: NeonBackdropProps) {
  return (
    <View style={styles.backgroundDecor} pointerEvents="none">
      <LinearGradient
        colors={backgroundGradientColors}
        start={BACKGROUND_GRADIENT_COORDS.start}
        end={BACKGROUND_GRADIENT_COORDS.end}
        style={styles.backgroundGradientLayer}
      />
      <View style={styles.backgroundGlowLayer} />
      <View style={styles.backgroundSparkTop} />
      <View style={styles.backgroundSparkBottom} />
    </View>
  );
}
