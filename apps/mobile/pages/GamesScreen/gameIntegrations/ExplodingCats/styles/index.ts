import { StyleSheet } from 'react-native';
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
  return StyleSheet.create({
    ...getLayoutStyles(palette),
    ...getBackgroundStyles(palette),
    ...getTopBarStyles(palette),
    ...getActionsStyles(palette),
    ...getHeroStyles(palette),
    ...getStatusStyles(palette),
    ...getMetaStyles(palette),
    ...getBodyStyles(palette),
    ...getTableStyles(palette),
  } as any);
}

export type ExplodingCatsRoomStyles = ReturnType<typeof createStyles>;
