import React, { memo } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n/messages';
import type { GameRoomSummary } from '../../api/gamesApi';
import type { ExplodingCatsRoomStyles } from '../ExplodingCatsRoom';
import type { TexasHoldemRoomStyles } from '../TexasHoldemRoom';

type Props = {
  variant: 'lobby' | 'table';
  controlsCollapsed: boolean;
  onToggleControls: () => void;
  hasSessionSnapshot: boolean;
  tableFullScreen: boolean;
  onEnterFullScreen: () => void;
  onViewGame: () => void;
  onDeleteRoom: () => void;
  onLeaveRoom: () => void;
  deleting: boolean;
  leaving: boolean;
  isHost: boolean;
  room: GameRoomSummary | null;
  gameId?: string;
  styles: ExplodingCatsRoomStyles | TexasHoldemRoomStyles;
};

export const ExplodingCatsRoomTopBar = memo(
  ({
    variant,
    controlsCollapsed,
    onToggleControls,
    hasSessionSnapshot,
    tableFullScreen,
    onEnterFullScreen,
    onViewGame,
    onDeleteRoom,
    onLeaveRoom,
    deleting,
    leaving,
    isHost,
    room,
    gameId,
    styles,
  }: Props) => {
    const { t } = useTranslation();
    const toggleLabelKey = controlsCollapsed
      ? 'games.room.buttons.showControls'
      : 'games.room.buttons.hideControls';
    const toggleLabel = t(toggleLabelKey as TranslationKey);
    const toggleIcon = controlsCollapsed ? 'chevron.down' : 'chevron.up';

    return (
      <View style={variant === 'table' ? styles.fullscreenTopBar : styles.topBar}>
        <View
          style={[
            styles.topBarCard,
            controlsCollapsed ? styles.topBarCardCollapsed : null,
          ]}
        >
          <View style={styles.topBarHeaderRow}>
            <View style={styles.topBarTitleRow}>
              <IconSymbol
                name={variant === 'table' ? 'sparkles' : 'rectangle.grid.2x2'}
                size={18}
                color={styles.topBarTitleIcon.color as string}
              />
              <ThemedText style={styles.topBarTitle}>
                {t('games.room.controlsTitle')}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.controlsToggleButton}
              onPress={onToggleControls}
              accessibilityRole="button"
              accessibilityLabel={toggleLabel}
              accessibilityState={{ expanded: !controlsCollapsed }}
            >
              <IconSymbol
                name={toggleIcon}
                size={14}
                color={styles.controlsToggleIcon.color as string}
              />
              <ThemedText style={styles.controlsToggleText}>{toggleLabel}</ThemedText>
            </TouchableOpacity>
          </View>
          {!controlsCollapsed ? (
            <ThemedText style={styles.topBarSubtitle} numberOfLines={2}>
              {t('games.room.controlsSubtitle')}
            </ThemedText>
          ) : null}
          {!controlsCollapsed ? (
            <View style={styles.actionGroup}>
              {hasSessionSnapshot ? (
                <TouchableOpacity
                  style={[styles.gameButton, tableFullScreen ? styles.buttonDisabled : null]}
                  onPress={onEnterFullScreen}
                  disabled={tableFullScreen}
                  accessibilityRole="button"
                  accessibilityLabel={t('games.room.buttons.enterFullscreen')}
                >
                  <IconSymbol
                    name="arrow.up.left.and.arrow.down.right"
                    size={16}
                    color={styles.gameButtonText.color as string}
                  />
                  <ThemedText style={styles.gameButtonText}>
                    {t('games.room.buttons.enterFullscreen')}
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.gameButton} onPress={onViewGame} disabled={!room && !gameId}>
                <IconSymbol
                  name="book"
                  size={16}
                  color={styles.gameButtonText.color as string}
                />
                <ThemedText style={styles.gameButtonText}>
                  {t('games.room.buttons.viewGame')}
                </ThemedText>
              </TouchableOpacity>
              {isHost ? (
                <>
                  <TouchableOpacity
                    style={[styles.deleteButton, deleting ? styles.deleteButtonDisabled : null]}
                    onPress={onDeleteRoom}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color={styles.deleteSpinner.color as string} />
                    ) : (
                      <>
                        <IconSymbol
                          name="trash"
                          size={16}
                          color={styles.deleteButtonText.color as string}
                        />
                        <ThemedText style={styles.deleteButtonText}>
                          {t('games.room.buttons.deleteRoom')}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.leaveButton, leaving ? styles.leaveButtonDisabled : null]}
                    onPress={onLeaveRoom}
                    disabled={leaving}
                  >
                    {leaving ? (
                      <ActivityIndicator size="small" color={styles.leaveSpinner.color as string} />
                    ) : (
                      <>
                        <IconSymbol
                          name="rectangle.portrait.and.arrow.right"
                          size={16}
                          color={styles.leaveButtonText.color as string}
                        />
                        <ThemedText style={styles.leaveButtonText}>
                          {t('common.actions.leave')}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.leaveButton, leaving ? styles.leaveButtonDisabled : null]}
                  onPress={onLeaveRoom}
                  disabled={leaving}
                >
                  {leaving ? (
                    <ActivityIndicator size="small" color={styles.leaveSpinner.color as string} />
                  ) : (
                    <>
                      <IconSymbol
                        name="rectangle.portrait.and.arrow.right"
                        size={16}
                        color={styles.leaveButtonText.color as string}
                      />
                      <ThemedText style={styles.leaveButtonText}>
                        {t('common.actions.leave')}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);

ExplodingCatsRoomTopBar.displayName = 'ExplodingCatsRoomTopBar';
