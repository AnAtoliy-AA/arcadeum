import { StyleSheet } from 'react-native';

import { platformShadow } from '@/lib/platformShadow';
import { type Palette } from '@/hooks/useThemedStyles';

export function createStyles(palette: Palette) {
  const isLight = palette.isLight;
  const cardBackground = palette.cardBackground;
  const raisedBackground = palette.gameDetail.raisedBackground;
  const borderColor = palette.cardBorder;
  const surfaceShadow = palette.gameRoom.surfaceShadow;
  const disabledText = palette.icon;

  const styles = {
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 20,
      paddingBottom: 120,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    alertFallback: {
      alignItems: 'center',
      gap: 12,
    },
    alertFallbackSpinner: {
      color: palette.tint,
    },
    alertFallbackIcon: {
      color: palette.tint,
    },
    alertFallbackText: {
      color: palette.icon,
    },
    visibilityToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: raisedBackground,
    },
    visibilityTogglePublic: {
      backgroundColor: `${palette.tint}33`,
      borderColor: `${palette.tint}66`,
    },
    visibilityTogglePrivate: {
      backgroundColor: palette.gameRoom.statusCompleted,
      borderColor: `${palette.tint}66`,
    },
    visibilityToggleIcon: {
      color: palette.tint,
    },
    visibilityToggleText: {
      color: palette.tint,
      fontWeight: '600',
    },
    section: {
      gap: 12,
    },
    sectionSubtitle: {
      color: palette.icon,
      lineHeight: 20,
    },
    gameSelector: {
      gap: 12,
    },
    gameTile: {
      padding: 16,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: palette.background,
      gap: 6,
    },
    gameTileActive: {
      backgroundColor: cardBackground,
      borderColor: palette.tint,
    },
    gameTileDisabled: {
      opacity: 0.6,
      borderStyle: 'dashed',
      borderColor: disabledText,
    },
    gameTileName: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 16,
    },
    gameTileNameActive: {
      color: palette.tint,
    },
    gameTileNameDisabled: {
      color: disabledText,
    },
    gameTileSummary: {
      color: palette.icon,
      lineHeight: 18,
    },
    gameTileSummaryActive: {
      color: palette.text,
    },
    gameTileSummaryDisabled: {
      color: disabledText,
    },
    gameTileBadge: {
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: raisedBackground,
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    formGroup: {
      gap: 16,
    },
    formField: {
      gap: 8,
    },
    formFieldRow: {
      flexDirection: 'row',
      gap: 16,
    },
    formFieldHalf: {
      flex: 1,
      gap: 8,
    },
    inputLabel: {
      color: palette.icon,
      fontWeight: '600',
    },
    textInput: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: palette.text,
      backgroundColor: palette.background,
    },
    textInputMultiline: {
      height: 100,
    },
    textInputPlaceholder: {
      color: palette.icon,
    },
    previewCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 20,
      gap: 12,
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
    previewTitle: {
      color: palette.text,
    },
    previewSummary: {
      color: palette.icon,
      lineHeight: 20,
    },
    previewMetaRow: {
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
    submitButton: {
      margin: 24,
      borderRadius: 16,
      backgroundColor: palette.tint,
      alignItems: 'center',
      paddingVertical: 16,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 17,
    },
  };

  return StyleSheet.create(styles as any) as { [K in keyof typeof styles]: any };
}

export type CreateGameRoomStyles = ReturnType<typeof createStyles>;

