import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';
import type { ShadowPresets } from './shadows';
import { TABLE_DIAMETER, PLAYER_SEAT_SIZE } from '../constants';

/**
 * Table ring, center, and stats styles.
 */
export function createTableStyles(
  ctx: StyleThemeContext,
  shadows: ShadowPresets,
) {
  const {
    surface,
    raised,
    border,
    titleText,
    heroBadgeText,
    decorCheck,
    decorPlay,
  } = ctx;
  const { tableRingShadow, tableStatShadow } = shadows;

  const innerDiameter = Math.max(TABLE_DIAMETER - PLAYER_SEAT_SIZE - 20, 180);

  return StyleSheet.create({
    tableSection: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingTop: PLAYER_SEAT_SIZE * 0.9,
    },
    tableRing: {
      ...tableRingShadow,
      width: TABLE_DIAMETER,
      height: TABLE_DIAMETER,
      borderRadius: TABLE_DIAMETER / 2,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 16,
    },
    tableCenter: {
      width: innerDiameter,
      height: innerDiameter,
      borderRadius: innerDiameter / 2,
      backgroundColor: surface,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 12,
    },
    tableStatsRow: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 12,
      marginTop: 16,
    },
    tableStatCard: {
      ...tableStatShadow,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 18,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}40`,
      minWidth: 132,
    },
    tableStatIcon: {
      color: decorCheck,
    },
    tableStatTextGroup: {
      gap: 2,
    },
    tableStatTitle: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
    },
    tableStatSubtitle: {
      color: heroBadgeText,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    tableInfoCard: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}40`,
      minWidth: 110,
    },
    tableInfoCardWithArtwork: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      minWidth: 136,
      gap: 8,
    },
    tableInfoIcon: {
      color: decorCheck,
    },
    tableInfoArtwork: {
      width: 62,
      aspectRatio: 0.68,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}55`,
    },
    tableInfoTitle: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
    },
    tableInfoSubtitle: {
      color: heroBadgeText,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
  });
}

export type TableStyles = ReturnType<typeof createTableStyles>;
