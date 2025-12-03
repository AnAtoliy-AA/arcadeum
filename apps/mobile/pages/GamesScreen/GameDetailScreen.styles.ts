import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export function createStyles(palette: Palette) {
  const isLight = palette.isLight;
  const cardBackground = palette.cardBackground;
  const raisedBackground = palette.gameDetail.raisedBackground;
  const borderColor = palette.cardBorder;
  const statusPrototypeBg = palette.gameDetail.statusPrototype;
  const statusDesignBg = palette.gameDetail.statusDesign;
  const statusRoadmapBg = palette.gameDetail.statusRoadmap;
  const surfaceShadow = palette.gameRoom.surfaceShadow;
  const roomStatusLobbyBg = palette.gameRoom.statusLobby;
  const roomStatusInProgressBg = palette.gameRoom.statusInProgress;
  const roomStatusCompletedBg = palette.gameRoom.statusCompleted;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 16,
      paddingBottom: 80,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    refreshControlTint: {
      color: palette.tint,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 4,
    },
    inviteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
    },
    inviteText: {
      color: palette.tint,
      fontWeight: '600',
    },
    heroCard: {
      backgroundColor: cardBackground,
      borderRadius: 20,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 14,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    heroTitleBlock: {
      flex: 1,
      gap: 8,
    },
    title: {
      flexShrink: 1,
    },
    tagline: {
      color: palette.icon,
      fontSize: 16,
      lineHeight: 22,
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    statusPrototype: {
      backgroundColor: statusPrototypeBg,
    },
    statusDesign: {
      backgroundColor: statusDesignBg,
    },
    statusRoadmap: {
      backgroundColor: statusRoadmapBg,
    },
    statusText: {
      fontWeight: '600',
      fontSize: 12,
      color: palette.text,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: raisedBackground,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    metaChipIcon: {
      color: palette.tint,
    },
    metaChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    overview: {
      color: palette.text,
      lineHeight: 20,
    },
    tagGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagChip: {
      backgroundColor: raisedBackground,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tagText: {
      color: palette.icon,
      fontWeight: '600',
      fontSize: 12,
    },
    primaryButton: {
      marginTop: 4,
      borderRadius: 14,
      backgroundColor: palette.tint,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryButtonDisabled: {
      opacity: 0.45,
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 16,
    },
    primaryButtonTextDisabled: {
      opacity: 0.75,
    },
    comingSoonHint: {
      marginTop: 6,
      color: palette.icon,
      fontSize: 12,
      fontStyle: 'italic',
    },
    roomsCard: {
      backgroundColor: cardBackground,
      borderRadius: 20,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    roomsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    roomsRefreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    roomsRefreshText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    roomsCaption: {
      color: palette.icon,
      lineHeight: 20,
    },
    roomsSkeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    roomsSkeletonSpinner: {
      color: palette.tint,
    },
    roomsSkeletonText: {
      color: palette.icon,
    },
    roomsErrorCard: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      borderRadius: 16,
      padding: 16,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    roomsErrorIcon: {
      color: '#F97316',
    },
    roomsErrorCopy: {
      flex: 1,
      gap: 4,
    },
    roomsErrorTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomsErrorText: {
      color: palette.icon,
    },
    roomsRetryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: cardBackground,
    },
    roomsRetryText: {
      color: palette.tint,
      fontWeight: '600',
    },
    roomsEmptyState: {
      borderRadius: 18,
      padding: 20,
      alignItems: 'center',
      gap: 12,
      backgroundColor: raisedBackground,
    },
    roomsEmptyIcon: {
      color: palette.tint,
    },
    roomsEmptyTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomsEmptyText: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
    roomsEmptyButton: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    roomsEmptyButtonDisabled: {
      opacity: 0.45,
    },
    roomsEmptyButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    roomsEmptyButtonTextDisabled: {
      opacity: 0.75,
    },
    roomCard: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 18,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 10,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    roomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    roomTitle: {
      color: palette.text,
      fontSize: 16,
    },
    roomStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    roomStatusLobby: {
      backgroundColor: roomStatusLobbyBg,
    },
    roomStatusInProgress: {
      backgroundColor: roomStatusInProgressBg,
    },
    roomStatusCompleted: {
      backgroundColor: roomStatusCompletedBg,
    },
    roomStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    roomMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roomMetaIcon: {
      color: palette.tint,
    },
    roomMetaText: {
      color: palette.text,
      fontSize: 13,
    },
    roomFooter: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    roomBadgeRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    roomVisibilityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    roomVisibilityChipPrivate: {
      backgroundColor: '#bf5af233',
    },
    roomVisibilityChipPublic: {
      backgroundColor: '#22c55e33',
    },
    roomVisibilityChipIcon: {
      color: palette.tint,
    },
    roomVisibilityChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    roomTimestamp: {
      color: palette.icon,
      fontSize: 11,
    },
    roomJoinButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    roomJoinButtonDisabled: {
      opacity: 0.7,
    },
    roomJoinButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 13,
    },
    sectionCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    sectionTitle: {
      color: palette.text,
    },
    sectionDescription: {
      color: palette.icon,
      lineHeight: 20,
    },
    sectionContent: {
      gap: 16,
    },
    listItem: {
      flexDirection: 'row',
      gap: 12,
    },
    listIcon: {
      color: palette.tint,
    },
    listCopy: {
      flex: 1,
      gap: 4,
    },
    listTitle: {
      color: palette.text,
    },
    listBody: {
      color: palette.icon,
      lineHeight: 20,
    },
    stepItem: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    stepBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: raisedBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBadgeText: {
      color: palette.tint,
      fontWeight: '700',
    },
    stepCopy: {
      flex: 1,
      gap: 4,
    },
    emptyCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 24,
      alignItems: 'center',
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    emptyIcon: {
      color: palette.tint,
    },
    emptyTitle: {
      textAlign: 'center',
    },
    emptyCopy: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}

export type GameDetailScreenStyles = ReturnType<typeof createStyles>;
