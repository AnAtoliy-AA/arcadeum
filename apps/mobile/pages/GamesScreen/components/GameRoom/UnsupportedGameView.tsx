import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

import { formatRoomGame } from '../../roomUtils';

interface UnsupportedGameViewProps {
  gameId?: string;
  fallbackName?: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onLeaveRoom: () => void;
  onDeleteRoom?: () => void;
  isHost: boolean;
  deleting: boolean;
  leaving: boolean;
}

export function UnsupportedGameView({
  gameId,
  fallbackName,
  loading,
  refreshing,
  error,
  onRefresh,
  onLeaveRoom,
  onDeleteRoom,
  isHost,
  deleting,
  leaving,
}: UnsupportedGameViewProps) {
  const styles = useThemedStyles(createFallbackStyles);
  const { t } = useTranslation();

  const displayName = fallbackName ?? t('games.room.defaultName');
  const displayGame = gameId
    ? formatRoomGame(gameId)
    : t('games.rooms.unknownGame');
  const subtitle = displayGame
    ? `${displayGame} is not available in this version yet.`
    : 'This game is not available in this version yet.';

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <IconSymbol
          name="questionmark.circle"
          size={42}
          color={styles.icon.color as string}
        />
        <ThemedText type="title" style={styles.title} numberOfLines={2}>
          {displayName}
        </ThemedText>
        <ThemedText style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </ThemedText>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              refreshing || loading ? styles.disabled : null,
            ]}
            onPress={onRefresh}
            disabled={refreshing || loading}
          >
            <ThemedText style={styles.primaryButtonText}>
              {t('common.retry')}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, leaving ? styles.disabled : null]}
            onPress={onLeaveRoom}
            disabled={leaving}
          >
            <ThemedText style={styles.secondaryButtonText}>
              {t('common.actions.leave')}
            </ThemedText>
          </TouchableOpacity>
          {isHost && onDeleteRoom ? (
            <TouchableOpacity
              style={[
                styles.destructiveButton,
                deleting ? styles.disabled : null,
              ]}
              onPress={onDeleteRoom}
              disabled={deleting}
            >
              <ThemedText style={styles.destructiveButtonText}>
                {t('games.room.buttons.deleteRoom')}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

function createFallbackStyles(palette: Palette) {
  const isLight = palette.isLight;

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: palette.background,
    },
    card: {
      width: '100%',
      alignItems: 'center',
      gap: 16,
      borderRadius: 24,
      paddingVertical: 48,
      paddingHorizontal: 24,
      backgroundColor: palette.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      ...platformShadow({
        color: palette.gameRoom.surfaceShadow,
        opacity: isLight ? 0.35 : 0.55,
        radius: 14,
        offset: { width: 0, height: 6 },
        elevation: 2,
      }),
    },
    icon: {
      color: palette.tint,
    },
    title: {
      textAlign: 'center',
      fontSize: 26,
      fontWeight: '700',
    },
    subtitle: {
      textAlign: 'center',
      color: palette.icon,
      fontSize: 16,
    },
    error: {
      marginTop: 12,
      textAlign: 'center',
      color: palette.error,
    },
    actions: {
      marginTop: 24,
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: palette.tint,
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    secondaryButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: palette.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
    },
    secondaryButtonText: {
      color: palette.text,
      fontWeight: '600',
    },
    destructiveButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: palette.destructive,
    },
    destructiveButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
