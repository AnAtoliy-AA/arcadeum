import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from '@/lib/i18n';
import type { CriticalCard, ProcessedPlayer } from '../types';
import type { CriticalTableStyles } from '../styles';

interface PlayerSelectionModalProps {
  visible: boolean;
  card: CriticalCard | null;
  aliveOpponents: ProcessedPlayer[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (targetPlayerId: string) => void;
  translateCardName: (card: CriticalCard) => string;
  styles: CriticalTableStyles;
}

export function PlayerSelectionModal({
  visible,
  card,
  aliveOpponents,
  busy,
  onClose,
  onConfirm,
  translateCardName,
  styles,
}: PlayerSelectionModalProps) {
  const { t } = useTranslation();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!visible || !card) {
    return null;
  }

  const handleConfirm = () => {
    if (selectedPlayerId) {
      onConfirm(selectedPlayerId);
      setSelectedPlayerId(null);
    }
  };

  const handleClose = () => {
    setSelectedPlayerId(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.comboModalBackdrop}>
        <ThemedView style={styles.comboModalCard}>
          <ThemedText style={styles.comboModalTitle}>
            {translateCardName(card)}
          </ThemedText>
          <ThemedText style={styles.comboModalDescription}>
            {t('games.table.actions.selectTargetDescription')}
          </ThemedText>

          <View style={styles.comboSection}>
            <ThemedText style={styles.comboSectionLabel}>
              {t('games.table.catCombo.targetLabel')}
            </ThemedText>
            {aliveOpponents.length ? (
              <View style={styles.comboOptionGroup}>
                {aliveOpponents.map((player) => (
                  <TouchableOpacity
                    key={player.playerId}
                    style={[
                      styles.comboOptionButton,
                      selectedPlayerId === player.playerId
                        ? styles.comboOptionButtonSelected
                        : null,
                    ]}
                    onPress={() => setSelectedPlayerId(player.playerId)}
                  >
                    <ThemedText
                      style={[
                        styles.comboOptionLabel,
                        selectedPlayerId === player.playerId
                          ? styles.comboOptionLabelSelected
                          : null,
                      ]}
                      numberOfLines={1}
                    >
                      {player.displayName}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.comboEmptyText}>
                {t('games.table.catCombo.noTargets')}
              </ThemedText>
            )}
          </View>

          <View style={styles.comboActions}>
            <TouchableOpacity
              style={styles.comboCancelButton}
              onPress={handleClose}
              disabled={busy}
            >
              <ThemedText style={styles.comboCancelText}>
                {t('games.table.catCombo.cancel')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.comboConfirmButton,
                !selectedPlayerId ? styles.comboConfirmButtonDisabled : null,
              ]}
              onPress={handleConfirm}
              disabled={!selectedPlayerId || busy}
            >
              {busy ? (
                <ActivityIndicator
                  size="small"
                  color={styles.comboConfirmText.color as string}
                />
              ) : (
                <ThemedText style={styles.comboConfirmText}>
                  {t('games.table.catCombo.confirm')}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}
