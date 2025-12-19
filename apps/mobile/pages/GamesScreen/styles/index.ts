import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { getLayoutStyles } from './layout';
import { getHeroStyles } from './hero';
import { getRoomsStyles } from './rooms';
import { getRoomItemStyles } from './roomItem';
import { getSectionsStyles } from './sections';

export function createStyles(palette: Palette) {
  const styles = {
    ...getLayoutStyles(palette),
    ...getHeroStyles(palette),
    ...getRoomsStyles(palette),
    ...getRoomItemStyles(palette),
    ...getSectionsStyles(palette),
  };

  return StyleSheet.create(styles as any) as unknown as Record<keyof typeof styles, ViewStyle & TextStyle & ImageStyle>;
}

export type GameDetailScreenStyles = ReturnType<typeof createStyles>;
