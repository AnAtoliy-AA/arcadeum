import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { getLayoutStyles } from './layout';
import { getBackgroundStyles } from './background';
import { getTopBarStyles } from './topBar';
import { getActionsStyles } from './actions';
import { getHeroStyles } from './hero';
import { getStatusStyles } from './status';
import { getMetaStyles } from './meta';
import { getBodyStyles } from './body';
import { getTableStyles } from './table';

export function createStyles(palette: Palette) {
  const styles = {
    ...getLayoutStyles(palette),
    ...getBackgroundStyles(palette),
    ...getTopBarStyles(palette),
    ...getActionsStyles(palette),
    ...getHeroStyles(palette),
    ...getStatusStyles(palette),
    ...getMetaStyles(palette),
    ...getBodyStyles(palette),
    ...getTableStyles(palette),
  };

  return StyleSheet.create(styles as any) as unknown as Record<keyof typeof styles, ViewStyle & TextStyle & ImageStyle>;
}

export type ExplodingCatsRoomStyles = ReturnType<typeof createStyles>;
