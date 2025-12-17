import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';

/**
 * Checkbox and form control styles.
 */
export function createFormStyles(ctx: StyleThemeContext) {
  const {
    surface,
    border,
    titleText,
    heroBadgeText,
    primaryBgColor,
    primaryTextColor,
  } = ctx;

  return StyleSheet.create({
    checkboxBox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surface,
    },
    checkboxBoxChecked: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    checkboxCheck: {
      color: primaryTextColor,
    },
    checkboxCopy: {
      flex: 1,
      gap: 2,
    },
    checkboxLabel: {
      color: titleText,
      fontWeight: '600',
      fontSize: 12,
    },
    checkboxHint: {
      color: heroBadgeText,
      fontSize: 11,
    },
  });
}

export type FormStyles = ReturnType<typeof createFormStyles>;
