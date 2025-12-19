import React from 'react';
import { Modal, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from '@/lib/i18n';
import type {
  CatComboPromptState,
  ExplodingCatsCard,
  ProcessedPlayer,
} from '../types';
import type { ExplodingCatsTableStyles } from '../styles';
import { DESIRED_CARD_OPTIONS } from '../constants';

interface CatComboModalProps {
  catComboPrompt: CatComboPromptState | null;
  aliveOpponents: ProcessedPlayer[];
  catComboBusy: boolean;
  comboConfirmDisabled: boolean;
  onClose: () => void;
  onModeChange: (mode: 'pair' | 'trio') => void;
  onTargetChange: (playerId: string) => void;
  onDesiredCardChange: (card: ExplodingCatsCard) => void;
  onConfirm: () => void;
  translateCardName: (card: ExplodingCatsCard) => string;
  styles: ExplodingCatsTableStyles;
}

export function CatComboModal({
  catComboPrompt,
  aliveOpponents,
  catComboBusy,
  comboConfirmDisabled,
  onClose,
  onModeChange,
  onTargetChange,
  onDesiredCardChange,
  onConfirm,
  translateCardName,
  styles,
}: CatComboModalProps) {
  const { t } = useTranslation();

  if (!catComboPrompt) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.comboModalBackdrop}>
        <ThemedView style={styles.comboModalCard}>
          <ThemedText style={styles.comboModalTitle}>
            {t('games.table.catCombo.title', {
              card: translateCardName(catComboPrompt.cat),
            })}
          </ThemedText>
          <ThemedText style={styles.comboModalDescription}>
            {t('games.table.catCombo.description')}
          </ThemedText>
          <View style={styles.comboModeRow}>
            {catComboPrompt.available.pair ? (
              <TouchableOpacity
                style={[
                  styles.comboModeButton,
                  catComboPrompt.mode === 'pair'
                    ? styles.comboModeButtonSelected
                    : null,
                ]}
                onPress={() => onModeChange('pair')}
              >
                <ThemedText
                  style={[
                    styles.comboModeButtonText,
                    catComboPrompt.mode === 'pair'
                      ? styles.comboModeButtonTextSelected
                      : null,
                  ]}
                >
                  {t('games.table.catCombo.modePair')}
                </ThemedText>
              </TouchableOpacity>
            ) : null}
            {catComboPrompt.available.trio ? (
              <TouchableOpacity
                style={[
                  styles.comboModeButton,
                  catComboPrompt.mode === 'trio'
                    ? styles.comboModeButtonSelected
                    : null,
                ]}
                onPress={() => onModeChange('trio')}
              >
                <ThemedText
                  style={[
                    styles.comboModeButtonText,
                    catComboPrompt.mode === 'trio'
                      ? styles.comboModeButtonTextSelected
                      : null,
                  ]}
                >
                  {t('games.table.catCombo.modeTrio')}
                </ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>
          {catComboPrompt.mode ? (
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
                        catComboPrompt.targetPlayerId === player.playerId
                          ? styles.comboOptionButtonSelected
                          : null,
                      ]}
                      onPress={() => onTargetChange(player.playerId)}
                    >
                      <ThemedText
                        style={[
                          styles.comboOptionLabel,
                          catComboPrompt.targetPlayerId === player.playerId
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
          ) : null}
          {catComboPrompt.mode === 'trio' ? (
            <View style={styles.comboSection}>
              <ThemedText style={styles.comboSectionLabel}>
                {t('games.table.catCombo.desiredCardLabel')}
              </ThemedText>
              <View style={styles.comboOptionGroup}>
                {DESIRED_CARD_OPTIONS.map((cardOption) => (
                  <TouchableOpacity
                    key={cardOption}
                    style={[
                      styles.comboOptionButton,
                      catComboPrompt.desiredCard === cardOption
                        ? styles.comboOptionButtonSelected
                        : null,
                    ]}
                    onPress={() => onDesiredCardChange(cardOption)}
                  >
                    <ThemedText
                      style={[
                        styles.comboOptionLabel,
                        catComboPrompt.desiredCard === cardOption
                          ? styles.comboOptionLabelSelected
                          : null,
                      ]}
                      numberOfLines={1}
                    >
                      {translateCardName(cardOption)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
          <View style={styles.comboActions}>
            <TouchableOpacity
              style={styles.comboCancelButton}
              onPress={onClose}
              disabled={catComboBusy}
            >
              <ThemedText style={styles.comboCancelText}>
                {t('games.table.catCombo.cancel')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.comboConfirmButton,
                comboConfirmDisabled ? styles.comboConfirmButtonDisabled : null,
              ]}
              onPress={onConfirm}
              disabled={comboConfirmDisabled}
            >
              {catComboBusy ? (
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
