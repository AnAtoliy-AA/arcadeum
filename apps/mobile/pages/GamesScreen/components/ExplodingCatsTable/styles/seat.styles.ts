import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';
import { PLAYER_SEAT_SIZE } from '../constants';

/**
 * Player seat and avatar styles.
 */
export function createSeatStyles(ctx: StyleThemeContext) {
  const {
    surface,
    raised,
    heroBadgeText,
    decorCheck,
    decorPlay,
    decorAlert,
    playerCurrent,
    playerIcon,
  } = ctx;

  return StyleSheet.create({
    tableSeatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: `${playerCurrent}18`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}26`,
    },
    tableSeatAnchor: {
      position: 'absolute',
      width: PLAYER_SEAT_SIZE,
      height: PLAYER_SEAT_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tableSeatRowCurrent: {
      opacity: 1,
      borderColor: `${decorCheck}8f`,
      backgroundColor: `${playerCurrent}66`,
    },
    tableSeatRowOut: {
      opacity: 0.45,
    },
    seatAvatarColumn: {
      alignItems: 'center',
      gap: 6,
      minWidth: 52,
    },
    seatAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: `${decorCheck}14`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}55`,
    },
    seatAvatarIcon: {
      color: playerIcon,
    },
    seatStatusDot: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
      bottom: 2,
      right: 2,
      borderWidth: 1.5,
      borderColor: surface,
    },
    seatStatusDotAlive: {
      backgroundColor: decorCheck,
    },
    seatStatusDotOut: {
      backgroundColor: decorAlert,
    },
    seatName: {
      color: heroBadgeText,
      fontWeight: '600',
      fontSize: 13,
      marginTop: 2,
      textAlign: 'center',
      maxWidth: 80,
    },
    seatCardStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'center',
    },
    seatCardBack: {
      width: 18,
      height: 26,
      borderRadius: 4,
      backgroundColor: `${decorCheck}24`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}50`,
      marginHorizontal: 2,
    },
    seatCardBackStacked: {
      marginLeft: 0,
    },
    seatCardCount: {
      color: heroBadgeText,
      fontSize: 11,
      marginLeft: 6,
      fontWeight: '600',
    },
    placeholder: {
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}33`,
    },
    placeholderText: {
      color: heroBadgeText,
    },
  });
}

export type SeatStyles = ReturnType<typeof createSeatStyles>;
