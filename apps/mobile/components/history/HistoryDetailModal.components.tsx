import React from 'react';
import { ActivityIndicator, Switch, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { formatParticipantDisplayName } from '@/utils/historyUtils';
import type {
  ModalHeaderProps,
  LoadingStateProps,
  ErrorStateProps,
  TimestampDisplayProps,
  RematchSectionProps,
  ParticipantsSectionProps,
  RemoveSectionProps,
  LogsSectionProps,
} from './HistoryDetailModal.types';

export function ModalHeader({
  gameName,
  tintColor,
  mutedTextColor,
  onClose,
  onSettingsPress,
  settingsDisabled,
  settingsActive,
  insetTop,
  styles,
  t,
}: ModalHeaderProps): React.JSX.Element {
  return (
    <View style={[styles.modalHeader, { paddingTop: insetTop + 12 }]}>
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
        {gameName}
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
  );
}

export function LoadingState({
  styles,
  t,
}: LoadingStateProps): React.JSX.Element {
  return (
    <View style={styles.modalLoading}>
      <ActivityIndicator size="small" />
      <ThemedText style={styles.placeholderText}>
        {t('common.loading')}
      </ThemedText>
    </View>
  );
}

export function ErrorState({
  error,
  needsRefresh,
  buttonTextColor,
  onRefresh,
  styles,
  t,
}: ErrorStateProps): React.JSX.Element {
  return (
    <View style={styles.modalLoading}>
      <ThemedText style={styles.errorText}>{error}</ThemedText>
      {needsRefresh ? (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
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
  );
}

export function TimestampDisplay({
  lastActivityAt,
  styles,
  t,
}: TimestampDisplayProps): React.JSX.Element {
  const timestamp = (() => {
    if (!lastActivityAt) return '-';
    const date = new Date(lastActivityAt);
    return !isNaN(date.getTime()) ? date.toLocaleString() : '-';
  })();

  return (
    <ThemedText style={styles.detailTimestamp}>
      {t('history.detail.lastActivity', { timestamp })}
    </ThemedText>
  );
}

export function RematchSection({
  rematchError,
  rematchLoading,
  buttonTextColor,
  onStartRematch,
  styles,
  t,
}: RematchSectionProps): React.JSX.Element {
  return (
    <View style={styles.modalSection}>
      <ThemedText style={styles.sectionTitle}>
        {t('history.detail.rematchTitle')}
      </ThemedText>
      <ThemedText style={styles.sectionDescription}>
        {t('history.detail.rematchDescription')}
      </ThemedText>
      {rematchError ? (
        <ThemedText style={styles.errorText}>{rematchError}</ThemedText>
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
          <ActivityIndicator size="small" color={buttonTextColor} />
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
  );
}

export function ParticipantsSection({
  participants,
  participantSelection,
  isHost,
  currentUserId,
  tintColor,
  mutedTextColor,
  onToggleParticipant,
  styles,
  t,
}: ParticipantsSectionProps): React.JSX.Element {
  return (
    <View style={styles.modalSection}>
      <ThemedText style={styles.sectionTitle}>
        {t('history.detail.participantsTitle')}
      </ThemedText>
      {participants.map((participant) => {
        const name = formatParticipantDisplayName(
          participant.id,
          participant.username,
          participant.email,
        );
        const hostBadge = participant.isHost
          ? t('history.detail.hostLabel')
          : null;
        const canToggle = isHost && participant.id !== currentUserId;

        return (
          <View style={styles.participantRow} key={participant.id}>
            <View style={styles.participantInfo}>
              <IconSymbol
                name={participant.isHost ? 'crown.fill' : 'person.fill'}
                size={18}
                color={participant.isHost ? tintColor : mutedTextColor}
              />
              <ThemedText style={styles.participantName} numberOfLines={1}>
                {name}
              </ThemedText>
              {hostBadge ? (
                <ThemedText style={styles.hostBadge}>{hostBadge}</ThemedText>
              ) : null}
            </View>
            {canToggle ? (
              <Switch
                value={participantSelection[participant.id] ?? false}
                onValueChange={(value) =>
                  onToggleParticipant(participant.id, value)
                }
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function RemoveSection({
  removeError,
  removeLoading,
  dangerColor,
  onRemoveRequest,
  styles,
  t,
}: RemoveSectionProps): React.JSX.Element {
  return (
    <View style={styles.modalSection}>
      <ThemedText style={styles.sectionTitle}>
        {t('history.detail.removeTitle')}
      </ThemedText>
      <ThemedText style={styles.sectionDescription}>
        {t('history.detail.removeDescription')}
      </ThemedText>
      {removeError ? (
        <ThemedText style={styles.errorText}>{removeError}</ThemedText>
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
            <IconSymbol name="trash" size={16} color={dangerColor} />
            <ThemedText
              style={[styles.removeButtonText, { color: dangerColor }]}
            >
              {t('history.detail.removeAction')}
            </ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function LogsSection({
  logs,
  styles,
  t,
}: LogsSectionProps): React.JSX.Element {
  return (
    <View style={styles.modalSection}>
      <ThemedText style={styles.sectionTitle}>
        {t('history.detail.logsTitle')}
      </ThemedText>
      {!logs || logs.length === 0 ? (
        <ThemedText style={styles.placeholderText}>
          {t('history.detail.noLogs')}
        </ThemedText>
      ) : (
        logs.map((log) => (
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
            <ThemedText style={styles.logMessage}>{log.message}</ThemedText>
          </View>
        ))
      )}
    </View>
  );
}
