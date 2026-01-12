import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';

/**
 * Primary, secondary, and destructive button styles.
 */
export function createButtonStyles(ctx: StyleThemeContext) {
  const {
    raised,
    heroBadgeText,
    decorCheck,
    primaryBgColor,
    primaryTextColor,
    destructiveBg,
    destructiveText,
  } = ctx;

  return StyleSheet.create({
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: primaryBgColor,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: primaryTextColor,
      fontWeight: '700',
      fontSize: 13,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: raised,
    },
    secondaryButtonDisabled: {
      opacity: 0.6,
    },
    secondaryButtonText: {
      color: decorCheck,
      fontWeight: '700',
      fontSize: 13,
    },
    destructiveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: destructiveBg,
    },
    destructiveButtonDisabled: {
      opacity: 0.6,
    },
    destructiveButtonText: {
      color: destructiveText,
      fontWeight: '700',
      fontSize: 13,
    },
    eliminatedNote: {
      color: heroBadgeText,
      fontSize: 12,
      fontStyle: 'italic',
    },
  });
}

export type ButtonStyles = ReturnType<typeof createButtonStyles>;
