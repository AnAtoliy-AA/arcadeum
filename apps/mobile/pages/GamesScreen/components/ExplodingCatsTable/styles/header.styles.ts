import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';

/**
 * Header row styles.
 */
export function createHeaderStyles(ctx: StyleThemeContext) {
  const {
    titleText,
    decorCheck,
    decorAlert,
    heroBadgeText,
    heroBadgeBackground,
    heroBadgeBorder,
  } = ctx;

  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIcon: {
      color: decorCheck,
    },
    headerText: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.3,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: heroBadgeBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: heroBadgeBorder,
    },
    statusText: {
      color: heroBadgeText,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    messageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 16,
      backgroundColor: `${decorAlert}1f`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorAlert}55`,
    },
    messageText: {
      color: heroBadgeText,
      fontWeight: '600',
    },
  });
}

export type HeaderStyles = ReturnType<typeof createHeaderStyles>;
