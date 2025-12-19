import React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { resolveGameName } from '@/utils/historyUtils';
import {
  ModalHeader,
  LoadingState,
  ErrorState,
  TimestampDisplay,
  RematchSection,
  ParticipantsSection,
  RemoveSection,
  LogsSection,
} from './HistoryDetailModal.components';
import { createStyles } from './HistoryDetailModal.styles';
import type { HistoryDetailModalProps } from './HistoryDetailModal.types';

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

  const gameName = selectedSummary
    ? (resolveGameName(selectedSummary.gameId) ?? t('history.unknownGame'))
    : '';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        style={styles.modalSafeArea}
        edges={['left', 'right', 'bottom']}
      >
        <View
          style={[styles.modalContainer, { paddingBottom: insetStyles.bottom }]}
        >
          <ModalHeader
            gameName={gameName}
            tintColor={tintColor}
            mutedTextColor={mutedTextColor}
            onClose={onClose}
            onSettingsPress={onSettingsPress}
            settingsDisabled={settingsDisabled}
            settingsActive={settingsActive}
            insetTop={insetStyles.top}
            styles={styles}
            t={t}
          />

          {detailLoading ? (
            <LoadingState styles={styles} t={t} />
          ) : detailError ? (
            <ErrorState
              error={detailError}
              needsRefresh={detailErrorNeedsRefresh}
              buttonTextColor={buttonTextColor}
              onRefresh={onRefreshHistoryAfterRemoval}
              styles={styles}
              t={t}
            />
          ) : detail?.summary ? (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              <TimestampDisplay
                lastActivityAt={detail.summary.lastActivityAt}
                styles={styles}
                t={t}
              />

              {isHost ? (
                <RematchSection
                  rematchError={rematchError}
                  rematchLoading={rematchLoading}
                  buttonTextColor={buttonTextColor}
                  onStartRematch={onStartRematch}
                  styles={styles}
                  t={t}
                />
              ) : null}

              <ParticipantsSection
                participants={detail.summary.participants}
                participantSelection={participantSelection}
                isHost={isHost}
                currentUserId={currentUserId}
                tintColor={tintColor}
                mutedTextColor={mutedTextColor}
                onToggleParticipant={onToggleParticipant}
                styles={styles}
                t={t}
              />

              <RemoveSection
                removeError={removeError}
                removeLoading={removeLoading}
                dangerColor={dangerColor}
                onRemoveRequest={onRemoveRequest}
                styles={styles}
                t={t}
              />

              <LogsSection logs={detail.logs} styles={styles} t={t} />
            </ScrollView>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
