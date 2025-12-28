import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import type { StyleThemeContext } from './theme';
import type { ShadowPresets } from './shadows';

/**
 * Hand section and hand card styles.
 */
export function createHandStyles(
  ctx: StyleThemeContext,
  shadows: ShadowPresets,
) {
  const {
    surface,
    raised,
    titleText,
    heroBadgeText,
    decorCheck,
    decorPlay,
    statusLobby,
    errorBackground,
    errorText,
  } = ctx;
  const {
    handCardShadow,
    handCardPlayableShadow,
    handCardOverlayShadow,
    handCardCountBadgeShadow,
    handCardTitleShadow,
    handCardDescriptionShadow,
  } = shadows;

  const handScrollBase: ViewStyle =
    Platform.OS === 'web'
      ? ({
          width: '100%',
          maxWidth: '100%',
          flexGrow: 0,
          flexShrink: 1,
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as ViewStyle)
      : {
          width: '100%',
          flexGrow: 0,
          flexShrink: 1,
          minWidth: 0,
        };

  return StyleSheet.create({
    handSection: {
      gap: 12,
    },
    handScroll: handScrollBase,
    handHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    handHeaderControls: {
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    handTitleIcon: {
      color: decorCheck,
    },
    handTitle: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
    },
    handStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    handStatusAlive: {
      backgroundColor: statusLobby,
      borderColor: `${decorCheck}66`,
    },
    handStatusOut: {
      backgroundColor: errorBackground,
      borderColor: `${errorText}5c`,
    },
    handStatusText: {
      color: decorCheck,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    handStatusTextOut: {
      color: errorText,
    },
    handScrollContent: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    handCard: {
      ...handCardShadow,
      width: 148,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 4,
      paddingVertical: 4,
      gap: 4,
      backgroundColor: surface,
      flexShrink: 0,
    },
    handCardArt: {
      width: '100%',
      aspectRatio: 0.68,
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: raised,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    handCardOverlay: {
      ...handCardOverlayShadow,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 6,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    handCardOverlayTitle: {
      color: titleText,
      fontWeight: '800',
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
      letterSpacing: 0.8,
      ...handCardTitleShadow,
    },
    handCardOverlayDescription: {
      color: heroBadgeText,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      ...handCardDescriptionShadow,
    },
    handCardCountBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: `${decorPlay}f0`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: titleText,
      ...handCardCountBadgeShadow,
    },
    handCardCountText: {
      color: heroBadgeText,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 14,
    },
    handCardMeta: {
      width: '100%',
      alignItems: 'center',
      gap: 4,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    handCardPlayable: {
      ...handCardPlayableShadow,
      borderColor: decorCheck,
    },
    handCardGrid: {
      ...handCardShadow,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 5,
      paddingVertical: 5,
      gap: 4,
      backgroundColor: surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}33`,
      flexShrink: 0,
      overflow: 'hidden',
    },
    handCardDisabled: {
      opacity: 0.65,
    },
    handCardBusy: {
      justifyContent: 'center',
    },
    handCardBusySpinner: {
      color: decorCheck,
    },
    handCardLabel: {
      color: heroBadgeText,
      fontSize: 11,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: 0.4,
    },
    handCardHint: {
      color: decorCheck,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    handViewButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}35`,
    },
    handViewButtonActive: {
      backgroundColor: decorCheck,
      borderColor: decorCheck,
    },
    handViewButtonIconActive: {
      color: heroBadgeText,
    },
    handSizeControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      width: 72,
      justifyContent: 'center',
      marginRight: 6,
    },
    handSizeControlsHidden: {
      opacity: 0,
    },
    handSizeButton: {
      width: 28,
      height: 28,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}35`,
    },
    handSizeButtonDisabled: {
      opacity: 0.45,
    },
    handGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingVertical: 6,
      paddingHorizontal: 4,
      justifyContent: 'flex-start',
      alignContent: 'flex-start',
    },
    handEmpty: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}40`,
      backgroundColor: raised,
      alignItems: 'center',
    },
    handEmptyText: {
      color: heroBadgeText,
      fontSize: 13,
    },
    handActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      alignItems: 'center',
    },
  });
}

export type HandStyles = ReturnType<typeof createHandStyles>;
