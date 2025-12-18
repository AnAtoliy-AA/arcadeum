import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getHeroStyles = (palette: Palette) => {
  const {
    isLight,
    cardBackground,
    cardBorder: borderColor,
    gameRoom: { surfaceShadow },
    gameDetail: {
      raisedBackground,
      statusPrototype: statusPrototypeBg,
      statusDesign: statusDesignBg,
      statusRoadmap: statusRoadmapBg,
    },
  } = palette;

  return {
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
  };
};
