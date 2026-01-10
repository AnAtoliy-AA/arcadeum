import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getBodyStyles = (palette: Palette) => {
  const {
    isLight,
    gameRoom: {
      errorBackground,
      errorBorder,
      errorText,
      raisedBackground,
      border: borderColor,
      surfaceShadow,
      decorCheck,
      decorAlert,
    },
  } = palette;

  return {
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadingText: {
      color: palette.icon,
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor: errorBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: errorBorder,
    },
    errorText: {
      color: errorText,
      fontWeight: '600',
    },
    bodyCard: {
      padding: 20,
      borderRadius: 22,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      gap: 14,
      ...platformShadow({
        color: surfaceShadow,
        radius: 12,
        opacity: isLight ? 1 : 0.6,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    bodyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    bodyHeaderAccent: {
      width: 6,
      height: 28,
      borderRadius: 999,
      backgroundColor: decorCheck,
    },
    bodyHeaderText: {
      color: palette.text,
      fontWeight: '600',
    },
    bodyCopy: {
      color: palette.icon,
      lineHeight: 20,
    },
    footerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 20,
      borderRadius: 22,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.35 : 0.55,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    footerAccent: {
      width: 8,
      height: 32,
      borderRadius: 999,
      backgroundColor: decorAlert,
    },
    footerIcon: {
      color: palette.tint,
    },
    footerCopy: {
      flex: 1,
      gap: 4,
    },
    footerTitle: {
      color: palette.text,
    },
    footerText: {
      color: palette.icon,
      lineHeight: 19,
    },
    ruleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      // Using generic border color since gameRoom.border is available in scope
      borderBottomColor: borderColor,
    },
    ruleInfo: {
      flex: 1,
      gap: 4,
    },
    ruleTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    ruleDescription: {
      fontSize: 13,
      color: palette.icon,
      lineHeight: 18,
    },
  };
};
