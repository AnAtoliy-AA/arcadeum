import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getTopBarStyles = (palette: Palette) => {
  const { isLight, gameRoom: { border: borderColor, topBarSurface, topBarBorder, surfaceShadow, actionBackground, actionBorder } } = palette;

  return {
    topBar: {
      width: '100%',
      paddingHorizontal: 24,
      paddingTop: 4,
      paddingBottom: 4,
    },
    fullscreenTopBar: {
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    topBarCard: {
      width: '100%',
      backgroundColor: topBarSurface,
      borderRadius: 24,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: topBarBorder,
      gap: 16,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.9 : 0.7,
        radius: 14,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
    },
    topBarCardCollapsed: {
      gap: 12,
      paddingBottom: 12,
    },
    topBarHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'nowrap',
    },
    topBarTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      flexWrap: 'wrap',
    },
    topBarTitleIcon: {
      color: palette.tint,
    },
    topBarTitle: {
      color: palette.icon,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    topBarSubtitle: {
      color: palette.icon,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 2,
      flexShrink: 1,
      maxWidth: '100%',
    },
    controlsToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      flexShrink: 0,
      marginLeft: 'auto',
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.35 : 0.55,
        radius: 8,
        offset: { width: 0, height: 3 },
        elevation: 2,
      }),
    },
    controlsToggleIcon: {
      color: palette.tint,
    },
    controlsToggleText: {
      color: palette.tint,
      fontSize: 12,
      fontWeight: '600',
    },
  };
};
