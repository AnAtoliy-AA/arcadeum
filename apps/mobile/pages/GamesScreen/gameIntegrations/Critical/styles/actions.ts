import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getActionsStyles = (palette: Palette) => {
  const {
    isLight,
    gameRoom: {
      actionBackground,
      actionBorder,
      surfaceShadow,
      leaveBackground,
      leaveDisabledBackground,
      leaveTint,
      deleteBackground,
      deleteDisabledBackground,
      deleteTint,
    },
  } = palette;

  return {
    actionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 10,
      alignSelf: 'stretch',
      marginTop: 4,
    },
    gameButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.4 : 0.6,
        radius: 10,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    gameButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    leaveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: leaveBackground,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.5 : 0.7,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    leaveButtonDisabled: {
      backgroundColor: leaveDisabledBackground,
      opacity: 0.7,
    },
    leaveButtonText: {
      color: leaveTint,
      fontWeight: '600',
      fontSize: 13,
    },
    leaveSpinner: {
      color: leaveTint,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: deleteBackground,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.45 : 0.65,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    deleteButtonDisabled: {
      backgroundColor: deleteDisabledBackground,
      opacity: 0.7,
    },
    deleteButtonText: {
      color: deleteTint,
      fontWeight: '600',
      fontSize: 13,
    },
    deleteSpinner: {
      color: deleteTint,
    },
  };
};
