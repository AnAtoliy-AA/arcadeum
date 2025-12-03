import { Platform, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';
import { TABLE_DIAMETER, PLAYER_SEAT_SIZE } from './constants';

export function createStyles(palette: Palette) {
  const isLight = palette.isLight;
  const tableTheme = palette.gameTable;
  const { shadow, destructiveBg, destructiveText, playerCurrent, playerIcon } =
    tableTheme;
  const {
    heroBackground: cardBackground,
    raisedBackground: ringSurface,
    border: cardBorder,
    actionBackground: panelSurface,
    actionBorder: panelBorder,
    heroGlowPrimary,
    heroGlowSecondary,
    backgroundGlow: roomGlow,
    decorPlay,
    decorCheck,
    decorAlert,
    heroBadgeBackground,
    heroBadgeBorder,
    heroBadgeText,
    statusLobby,
    errorBackground,
    errorText,
    titleText,
  } = palette.gameRoom;
  const surface = cardBackground;
  const raised = panelSurface;
  const border = panelBorder;
  const primaryBgColor = decorCheck;
  const primaryTextColor = heroBadgeText;

  const innerDiameter = Math.max(TABLE_DIAMETER - PLAYER_SEAT_SIZE - 20, 180);
  const overlayShadow = isLight
    ? 'rgba(15, 23, 42, 0.45)'
    : 'rgba(15, 23, 42, 0.65)';
  const cardShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 1 : 0.6,
    radius: 12,
  });
  const tableRingShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.25 : 0.45,
    radius: 18,
    offset: { width: 0, height: 6 },
    elevation: 4,
  });
  const tableStatShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.25 : 0.45,
    radius: 12,
    offset: { width: 0, height: 4 },
    elevation: 3,
  });
  const handCardShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.24 : 0.42,
    radius: 10,
    offset: { width: 0, height: 4 },
    elevation: 3,
  });
  const handCardPlayableShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.35 : 0.6,
    radius: 10,
    offset: { width: 0, height: 4 },
    elevation: 3,
  });
  const handCardOverlayShadow = platformShadow({
    color: overlayShadow,
    opacity: isLight ? 0.9 : 0.8,
    radius: 12,
    offset: { width: 0, height: 8 },
  });
  const comboModalShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.4 : 0.8,
    radius: 10,
    offset: { width: 0, height: 6 },
    elevation: 3,
  });
  const handCardTitleShadow: TextStyle =
    Platform.OS === 'web'
      ? {}
      : {
          textShadowColor: 'rgba(15, 23, 42, 0.55)',
          textShadowOffset: { width: 0, height: 4 },
          textShadowRadius: 8,
        };
  const handCardDescriptionShadow: TextStyle =
    Platform.OS === 'web'
      ? {}
      : {
          textShadowColor: 'rgba(15, 23, 42, 0.45)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 6,
        };
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
    card: {
      ...cardShadow,
      borderRadius: 28,
      backgroundColor: surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      position: 'relative',
      overflow: 'hidden',
    },
    cardFullScreen: {
      ...platformShadow({
        color: shadow,
        opacity: 0,
        radius: 0,
        offset: { width: 0, height: 0 },
        elevation: 0,
      }),
      flex: 1,
      borderRadius: 28,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      backgroundColor: surface,
    },
    cardScroll: {
      width: '100%',
      flexGrow: 0,
      flexShrink: 0,
    },
    cardScrollContent: {
      paddingBottom: 32,
    },
    fullScreenScroll: {
      flexGrow: 1,
    },
    fullScreenInner: {
      gap: 24,
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingBottom: 40,
    },
    cardBackdrop: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    cardGradientLayer: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.85,
    },
    cardGlowPrimary: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 180,
      backgroundColor: `${heroGlowPrimary}33`,
      top: -140,
      right: -100,
    },
    cardGlowSecondary: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 160,
      backgroundColor: `${heroGlowSecondary}29`,
      bottom: -140,
      left: -120,
    },
    cardAccentTop: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 140,
      top: -80,
      left: -70,
      backgroundColor: `${decorPlay}20`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}60`,
    },
    cardAccentBottom: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 150,
      bottom: -90,
      right: -60,
      backgroundColor: `${decorAlert}1f`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorAlert}55`,
    },
    cardGradientSwatchA: {
      backgroundColor: `${heroGlowSecondary}29`,
    },
    cardGradientSwatchB: {
      backgroundColor: surface,
    },
    cardGradientSwatchC: {
      backgroundColor: `${heroGlowPrimary}2f`,
    },
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
      backgroundColor: ringSurface,
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
    // Action effect overlay (center of table)
    effectOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 6,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    effectCircle: {
      width: 110,
      height: 110,
      borderRadius: 64,
      backgroundColor: 'transparent',
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isLight ? 0.18 : 0.32,
      shadowRadius: 14,
      elevation: 6,
    },
    effectCircleDefault: {
      backgroundColor: roomGlow,
    },
    effectCircleDraw: {
      backgroundColor: `${decorCheck}33`,
    },
    effectCircleAttack: {
      backgroundColor: `${destructiveBg}cc`,
    },
    effectCircleSkip: {
      backgroundColor: `${decorPlay}33`,
    },
    effectCircleCombo: {
      backgroundColor: `${heroGlowSecondary}33`,
    },
    effectIconWrap: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    effectIcon: {
      color: primaryTextColor,
    },
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
    logsList: {
      maxHeight: 260,
      marginTop: 12,
    },
    logsListContent: {
      gap: 12,
      paddingBottom: 8,
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
      height: 228,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
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
      ...platformShadow({
        color: shadow,
        opacity: 0.6,
        radius: 4,
        offset: { width: 0, height: 2 },
        elevation: 3,
      }),
    },
    handCardCountText: {
      color: primaryTextColor,
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
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
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
      color: primaryTextColor,
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
    logsSection: {
      gap: 12,
    },
    logsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logsHeaderText: {
      color: heroBadgeText,
      fontWeight: '600',
    },
    logsEmptyText: {
      color: heroBadgeText,
      fontSize: 12,
      fontStyle: 'italic',
    },
    logRow: {
      flexDirection: 'row',
      gap: 10,
    },
    logTimestamp: {
      color: heroBadgeText,
      fontSize: 11,
      width: 52,
      fontVariant: ['tabular-nums'],
    },
    logMessage: {
      flex: 1,
      color: titleText,
      fontSize: 12,
    },
    logMessageColumn: {
      flex: 1,
      gap: 4,
    },
    logMessageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logMessageSender: {
      color: titleText,
      fontWeight: '600',
      fontSize: 12,
    },
    logScopeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}44`,
    },
    logScopeBadgeText: {
      color: heroBadgeText,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    logMessageText: {
      color: heroBadgeText,
      fontSize: 12,
      lineHeight: 16,
    },
    logsComposer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    logsInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 96,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: raised,
      color: titleText,
      fontSize: 13,
    },
    logsInputPlaceholder: {
      color: heroBadgeText,
    },
    logsSendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: primaryBgColor,
    },
    logsSendButtonDisabled: {
      opacity: 0.5,
    },
    logsSendButtonText: {
      color: primaryTextColor,
      fontWeight: '700',
      fontSize: 13,
    },
    logsCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
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
export type ExplodingCatsTableStyles = ReturnType<typeof createStyles>;
