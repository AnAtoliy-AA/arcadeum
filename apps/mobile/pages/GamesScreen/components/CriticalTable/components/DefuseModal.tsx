import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/lib/i18n';

interface DefuseModalProps {
  visible: boolean;
  deckSize: number;
  onConfirm: (position: number) => void;
}

export function DefuseModal({
  visible,
  deckSize,
  onConfirm,
}: DefuseModalProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState(0);

  const getPositionLabel = () => {
    if (position === 0) return t('games.table.defuse.topOfDeck');
    if (position >= deckSize) return t('games.table.defuse.bottomOfDeck');
    return t('games.table.defuse.positionFromTop', { position: position + 1 });
  };

  const handleConfirm = () => {
    onConfirm(position);
    setPosition(0);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>
            🛡️ {t('games.table.defuse.title')}
          </ThemedText>
          <ThemedText style={styles.description}>
            {t('games.table.defuse.description')}
          </ThemedText>

          <View style={styles.sliderSection}>
            <View style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabel}>
                {t('games.table.defuse.topOfDeck')}
              </ThemedText>
              <ThemedText style={styles.sliderLabel}>
                {t('games.table.defuse.bottomOfDeck')}
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={Math.max(0, deckSize)}
              step={1}
              value={position}
              onValueChange={setPosition}
              minimumTrackTintColor="#10B981"
              maximumTrackTintColor="#4B5563"
              thumbTintColor="#10B981"
            />
            <View style={styles.positionDisplay}>
              <ThemedText style={styles.positionText}>
                {getPositionLabel()}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <ThemedText style={styles.confirmText}>
              {t('games.table.defuse.confirm')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  sliderSection: {
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  positionDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
