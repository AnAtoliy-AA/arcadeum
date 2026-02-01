import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';
import type { ShadowPresets } from './shadows';

/**
 * Combo modal styles.
 */
export function createComboStyles(
  ctx: StyleThemeContext,
  shadows: ShadowPresets,
) {
  const {
    surface,
    raised,
    titleText,
    heroBadgeText,
    decorPlay,
    primaryBgColor,
    primaryTextColor,
  } = ctx;
  const { comboModalShadow } = shadows;

  return StyleSheet.create({
    comboModalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    comboModalCard: {
      ...comboModalShadow,
      width: '100%',
      maxWidth: 360,
      borderRadius: 18,
      backgroundColor: surface,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}55`,
    },
    comboModalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: titleText,
    },
    comboModalDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: heroBadgeText,
    },
    comboModeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    comboModeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}40`,
      alignItems: 'center',
    },
    comboModeButtonSelected: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    comboModeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: heroBadgeText,
    },
    comboModeButtonTextSelected: {
      color: primaryTextColor,
    },
    comboSection: {
      gap: 8,
    },
    comboSectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: titleText,
    },
    comboOptionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    comboOptionButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}40`,
    },
    comboOptionButtonSelected: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    comboOptionLabel: {
      fontSize: 14,
      color: heroBadgeText,
    },
    comboOptionLabelSelected: {
      color: primaryTextColor,
    },
    comboEmptyText: {
      fontSize: 14,
      color: heroBadgeText,
    },
    comboActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    comboCancelButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    comboCancelText: {
      fontSize: 14,
      color: heroBadgeText,
    },
    comboConfirmButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: primaryBgColor,
      gap: 8,
    },
    comboConfirmButtonDisabled: {
      opacity: 0.6,
    },
    comboConfirmText: {
      fontSize: 14,
      fontWeight: '600',
      color: primaryTextColor,
    },
  });
}

export type ComboStyles = ReturnType<typeof createComboStyles>;
