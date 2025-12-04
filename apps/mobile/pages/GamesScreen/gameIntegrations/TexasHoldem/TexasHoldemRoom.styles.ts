import { StyleSheet } from 'react-native';
import { platformShadow } from '@/lib/platformShadow';
import type { Palette } from '@/hooks/useThemedStyles';

export function createStyles(palette: Palette) {
  const isLight = palette.isLight;
  const gameRoom = palette.gameRoom || {};
  const surfaceShadow = gameRoom.surfaceShadow || '#000';
  const topBarSurface = gameRoom.topBarSurface || palette.cardBackground;
  const topBarBorder = gameRoom.topBarBorder || palette.icon + '20';
  const actionBackground = gameRoom.actionBackground || palette.cardBackground;
  const actionBorder = gameRoom.actionBorder || palette.icon + '20';
  const leaveBackground = gameRoom.leaveBackground || '#f59e0b';
  const leaveDisabledBackground = gameRoom.leaveDisabledBackground || '#9ca3af';
  const leaveTint = gameRoom.leaveTint || '#ffffff';
  const deleteBackground = gameRoom.deleteBackground || '#ef4444';
  const deleteDisabledBackground = gameRoom.deleteDisabledBackground || '#9ca3af';
  const deleteTint = gameRoom.deleteTint || '#ffffff';

  // Colors for gradients and high-contrast text
  const contrastText = isLight ? '#000000' : '#ffffff';
  const backgroundGradientStart = isLight ? '#f1f5f9' : '#0f172a';
  const backgroundGradientEnd = isLight ? '#e2e8f0' : '#1e293b';
  const heroGradientStart = isLight ? '#cbd5e1' : '#334155';
  const heroGradientEnd = isLight ? '#94a3b8' : '#475569';

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: palette.icon,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 16,
    },
    errorText: {
      fontSize: 16,
      color: palette.error,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: palette.tint,
      borderRadius: 8,
    },
    retryText: {
      color: contrastText,
      fontWeight: '600',
    },
    heroCard: {
      margin: 16,
      padding: 20,
      borderRadius: 16,
      gap: 16,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.9 : 0.65,
        radius: 20,
        offset: { width: 0, height: 8 },
        elevation: 4,
      }),
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusLobby: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    statusInProgress: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    statusCompleted: {
      backgroundColor: 'rgba(107, 114, 128, 0.2)',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: contrastText,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: '45%',
      padding: 12,
      borderRadius: 16,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.3 : 0.5,
        radius: 8,
        offset: { width: 0, height: 3 },
        elevation: 2,
      }),
    },
    metaItemIcon: {
      color: palette.tint,
    },
    metaItemCopy: {
      gap: 2,
    },
    metaItemLabel: {
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
    },
    metaItemValue: {
      color: palette.text,
      fontWeight: '600',
    },
    gameContainer: {
      flex: 1,
    },
    // ExplodingCatsRoomTopBar styles
    topBar: {
      width: '100%',
      paddingHorizontal: 24,
      paddingTop: 4,
      paddingBottom: 4,
    },
    fullscreenTopBar: {
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: topBarBorder,
    },
    topBarCard: {
      width: '100%',
      backgroundColor: topBarSurface,
      borderRadius: 24,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: topBarBorder,
      gap: 16,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.9 : 0.7,
        radius: 14,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
    },
    topBarCardCollapsed: {
      gap: 12,
      paddingBottom: 12,
    },
    topBarHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'nowrap',
    },
    topBarTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      flexWrap: 'wrap',
    },
    topBarTitleIcon: {
      color: palette.tint,
    },
    topBarTitle: {
      color: palette.icon,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    topBarSubtitle: {
      color: palette.icon,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 2,
      flexShrink: 1,
      maxWidth: '100%',
    },
    controlsToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      flexShrink: 0,
      marginLeft: 'auto',
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.35 : 0.55,
        radius: 8,
        offset: { width: 0, height: 3 },
        elevation: 2,
      }),
    },
    controlsToggleIcon: {
      color: palette.tint,
    },
    controlsToggleText: {
      color: palette.tint,
      fontSize: 12,
      fontWeight: '600',
    },
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
    // Gradient colors (not actual styles, but exported for component use)
    backgroundGradientStart: {
      color: backgroundGradientStart,
    },
    backgroundGradientEnd: {
      color: backgroundGradientEnd,
    },
    heroGradientStart: {
      color: heroGradientStart,
    },
    heroGradientEnd: {
      color: heroGradientEnd,
    },
  });
}

export type TexasHoldemRoomStyles = ReturnType<typeof createStyles>;
