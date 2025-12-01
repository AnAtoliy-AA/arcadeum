import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import type { TranslationKey } from '@/lib/i18n/messages';
import type { Replacements } from '@/lib/i18n/types';
import {
  formatParticipantDisplayName,
  resolveGameName,
} from '@/utils/historyUtils';
import type { HistoryDetail, HistorySummary } from '@/pages/History/api/historyApi';

type ParticipantsSelection = Record<string, boolean>;

type HistoryDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedSummary: HistorySummary | null;
  detail: HistoryDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  detailErrorNeedsRefresh: boolean;
  onRefreshHistoryAfterRemoval: () => void;
  isHost: boolean;
  rematchError: string | null;
  rematchLoading: boolean;
  onStartRematch: () => void;
  participantSelection: ParticipantsSelection;
  onToggleParticipant: (id: string, value: boolean) => void;
  removeError: string | null;
  removeLoading: boolean;
  onRemoveRequest: () => void;
  currentUserId: string;
  mutedTextColor: string;
  tintColor: string;
  buttonTextColor: string;
  dangerColor: string;
  t: (key: TranslationKey, replacements?: Replacements) => string;
  onSettingsPress: () => void;
  settingsDisabled?: boolean;
  settingsActive?: boolean;
};

export function HistoryDetailModal({
  visible,
  onClose,
  selectedSummary,
  detail,
  detailLoading,
  detailError,
  detailErrorNeedsRefresh,
  onRefreshHistoryAfterRemoval,
  isHost,
  rematchError,
  rematchLoading,
  onStartRematch,
  participantSelection,
  onToggleParticipant,
  removeError,
  removeLoading,
  onRemoveRequest,
  currentUserId,
  mutedTextColor,
  tintColor,
  buttonTextColor,
  dangerColor,
  t,
  onSettingsPress,
  settingsDisabled = false,
  settingsActive = false,
}: HistoryDetailModalProps) {
  const styles = useThemedStyles(createStyles);
  const insetStyles = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={styles.modalSafeArea}
        edges={['left', 'right', 'bottom']}
      >
        <View
          style={[
            styles.modalContainer,
            { paddingBottom: insetStyles.bottom },
          ]}
        >
          <View style={[styles.modalHeader, { paddingTop: insetStyles.top + 12 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={onClose}
              accessibilityHint={t('navigation.backButtonHint')}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
            >
              <IconSymbol name="chevron.left" size={18} color={tintColor} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle} numberOfLines={1}>
              {selectedSummary
                ? (resolveGameName(selectedSummary.gameId) ??
                  t('history.unknownGame'))
                : ''}
            </ThemedText>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={onSettingsPress}
              disabled={settingsDisabled}
              accessibilityHint={t(
                settingsActive
                  ? 'navigation.closeSettingsHint'
                  : 'navigation.openSettingsHint',
              )}
              accessibilityLabel={t('navigation.settingsTitle')}
              accessibilityRole="button"
              accessibilityState={{
                disabled: settingsDisabled,
                selected: settingsActive,
              }}
            >
              <IconSymbol
                name={settingsActive ? 'xmark' : 'gearshape.fill'}
                size={18}
                color={settingsDisabled ? mutedTextColor : tintColor}
              />
            </TouchableOpacity>
          </View>
          {detailLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="small" />
              <ThemedText style={styles.placeholderText}>
                {t('common.loading')}
              </ThemedText>
            </View>
          ) : detailError ? (
            <View style={styles.modalLoading}>
              <ThemedText style={styles.errorText}>{detailError}</ThemedText>
              {detailErrorNeedsRefresh ? (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={onRefreshHistoryAfterRemoval}
                >
                  <IconSymbol
                    name="arrow.clockwise"
                    size={16}
                    color={buttonTextColor}
                  />
                  <ThemedText style={styles.refreshButtonText}>
                    {t('history.actions.refresh')}
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : detail?.summary ? (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              <ThemedText style={styles.detailTimestamp}>
                {t('history.detail.lastActivity', {
                  timestamp: (() => {
                    if (!detail.summary.lastActivityAt) return '-';
                    const date = new Date(detail.summary.lastActivityAt);
                    return !isNaN(date.getTime()) ? date.toLocaleString() : '-';
                  })(),
                })}
              </ThemedText>

              {isHost ? (
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>
                    {t('history.detail.rematchTitle')}
                  </ThemedText>
                  <ThemedText style={styles.sectionDescription}>
                    {t('history.detail.rematchDescription')}
                  </ThemedText>
                  {rematchError ? (
                    <ThemedText style={styles.errorText}>
                      {rematchError}
                    </ThemedText>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.rematchButton,
                      rematchLoading && styles.rematchButtonDisabled,
                    ]}
                    onPress={onStartRematch}
                    disabled={rematchLoading}
                  >
                    {rematchLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={buttonTextColor}
                      />
                    ) : (
                      <>
                        <IconSymbol
                          name="arrow.counterclockwise"
                          size={16}
                          color={buttonTextColor}
                        />
                        <ThemedText style={styles.rematchButtonText}>
                          {t('history.detail.rematchAction')}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.modalSection}>
                <ThemedText style={styles.sectionTitle}>
                  {t('history.detail.participantsTitle')}
                </ThemedText>
                {detail.summary.participants.map((participant) => {
                  const name = formatParticipantDisplayName(
                    participant.id,
                    participant.username,
                    participant.email,
                  );
                  const hostBadge = participant.isHost
                    ? t('history.detail.hostLabel')
                    : null;
                  const canToggle =
                    isHost && participant.id !== currentUserId;

                  return (
                    <View style={styles.participantRow} key={participant.id}>
                      <View style={styles.participantInfo}>
                        <IconSymbol
                          name={
                            participant.isHost ? 'crown.fill' : 'person.fill'
                          }
                          size={18}
                          color={
                            participant.isHost ? tintColor : mutedTextColor
                          }
                        />
                        <ThemedText
                          style={styles.participantName}
                          numberOfLines={1}
                        >
                          {name}
                        </ThemedText>
                        {hostBadge ? (
                          <ThemedText style={styles.hostBadge}>
                            {hostBadge}
                          </ThemedText>
                        ) : null}
                      </View>
                      {canToggle ? (
                        <Switch
                          value={
                            participantSelection[participant.id] ?? false
                          }
                          onValueChange={(value) =>
                            onToggleParticipant(participant.id, value)
                          }
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View style={styles.modalSection}>
                <ThemedText style={styles.sectionTitle}>
                  {t('history.detail.removeTitle')}
                </ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  {t('history.detail.removeDescription')}
                </ThemedText>
                {removeError ? (
                  <ThemedText style={styles.errorText}>
                    {removeError}
                  </ThemedText>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.removeButton,
                    { borderColor: dangerColor },
                    removeLoading && styles.removeButtonDisabled,
                  ]}
                  onPress={onRemoveRequest}
                  disabled={removeLoading}
                >
                  {removeLoading ? (
                    <ActivityIndicator size="small" color={dangerColor} />
                  ) : (
                    <>
                      <IconSymbol
                        name="trash"
                        size={16}
                        color={dangerColor}
                      />
                      <ThemedText
                        style={[
                          styles.removeButtonText,
                          { color: dangerColor },
                        ]}
                      >
                        {t('history.detail.removeAction')}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.modalSection}>
                <ThemedText style={styles.sectionTitle}>
                  {t('history.detail.logsTitle')}
                </ThemedText>
                {!detail.logs || detail.logs.length === 0 ? (
                  <ThemedText style={styles.placeholderText}>
                    {t('history.detail.noLogs')}
                  </ThemedText>
                ) : (
                  detail.logs?.map((log) => (
                    <View style={styles.logItem} key={log.id}>
                      <View style={styles.logHeader}>
                        <ThemedText style={styles.logTimestamp}>
                          {new Date(log.createdAt).toLocaleString()}
                        </ThemedText>
                        <ThemedText style={styles.logScope}>
                          {log.scope === 'players'
                            ? t('history.detail.scopePlayers')
                            : t('history.detail.scopeAll')}
                        </ThemedText>
                      </View>
                      {log.sender ? (
                        <ThemedText style={styles.logSender}>
                          {t('history.detail.sender', {
                            name: formatParticipantDisplayName(
                              log.sender.id,
                              log.sender.username,
                              log.sender.email,
                            ),
                          })}
                        </ThemedText>
                      ) : null}
                      <ThemedText style={styles.logMessage}>
                        {log.message}
                      </ThemedText>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    modalSafeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: palette.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
      gap: 12,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    modalTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '600',
      textAlign: 'center',
    },
    modalLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    placeholderText: {
      fontSize: 14,
      color: palette.icon,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: palette.error,
      textAlign: 'center',
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: palette.tint,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    refreshButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    modalScroll: {
      flex: 1,
    },
    modalScrollContent: {
      padding: 16,
      gap: 24,
    },
    detailTimestamp: {
      fontSize: 13,
      color: palette.icon,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalSection: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    sectionDescription: {
      fontSize: 14,
      color: palette.icon,
      lineHeight: 20,
    },
    rematchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: palette.tint,
      paddingVertical: 12,
      borderRadius: 12,
    },
    rematchButtonDisabled: {
      opacity: 0.6,
    },
    rematchButtonText: {
      color: palette.background,
      fontSize: 16,
      fontWeight: '600',
    },
    participantRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
    },
    participantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    participantName: {
      fontSize: 16,
      flex: 1,
    },
    hostBadge: {
      fontSize: 12,
      color: palette.tint,
      fontWeight: '600',
      backgroundColor: palette.background,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 8,
    },
    removeButtonDisabled: {
      opacity: 0.6,
    },
    removeButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    logItem: {
      padding: 12,
      backgroundColor: palette.background,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      gap: 4,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    logTimestamp: {
      fontSize: 12,
      color: palette.icon,
    },
    logScope: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.tint,
    },
    logSender: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    logMessage: {
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
