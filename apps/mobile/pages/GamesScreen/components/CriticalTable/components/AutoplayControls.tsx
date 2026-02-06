import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import type {
  CriticalCard,
  CriticalLogEntry,
  PendingAction,
  PendingFavor,
  CriticalActionCard,
} from '../types';
import { useAutoplay } from '../hooks/useAutoplay';

interface AutoplayControlsProps {
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  hand: CriticalCard[];
  logs: CriticalLogEntry[];
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  pendingDefuse: string | null;
  deckSize: number;
  playerOrder: string[];
  currentUserId: string | null;
  t: (key: string) => string;
  onDraw: () => void;
  onPlayActionCard: (card: CriticalActionCard) => void;
  onPlayNope: () => void;
  onGiveFavorCard: (card: CriticalCard) => void;
  onPlayDefuse: (position: number) => void;
  forceEnableAutoplay?: boolean;
  onAutoplayEnabledChange?: (enabled: boolean) => void;
}

export function AutoplayControls({
  isMyTurn,
  canAct,
  canPlayNope,
  hand,
  logs,
  pendingAction,
  pendingFavor,
  pendingDefuse,
  deckSize,
  playerOrder,
  currentUserId,
  t,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onGiveFavorCard,
  onPlayDefuse,
  forceEnableAutoplay,
  onAutoplayEnabledChange,
}: AutoplayControlsProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    allEnabled,
    autoDrawEnabled,
    autoSkipEnabled,
    autoShuffleAfterDefuseEnabled,
    autoDrawSkipAfterShuffleEnabled,
    autoNopeAttackEnabled,
    autoGiveFavorEnabled,
    autoDefuseEnabled,
    setAllEnabled,
    setAutoDrawEnabled,
    setAutoSkipEnabled,
    setAutoShuffleAfterDefuseEnabled,
    setAutoDrawSkipAfterShuffleEnabled,
    setAutoNopeAttackEnabled,
    setAutoGiveFavorEnabled,
    setAutoDefuseEnabled,
  } = useAutoplay({
    isMyTurn,
    canAct,
    canPlayNope,
    hand,
    logs,
    pendingAction,
    pendingFavor,
    pendingDefuse,
    deckSize,
    playerOrder,
    currentUserId,
    onDraw,
    onPlayActionCard,
    onPlayNope,
    onGiveFavorCard,
    onPlayDefuse,
  });

  // Handle external force enable from idle timer
  useEffect(() => {
    if (forceEnableAutoplay && !allEnabled) {
      setAllEnabled(true);
    }
  }, [forceEnableAutoplay, allEnabled, setAllEnabled]);

  // Notify parent when autoplay state changes
  useEffect(() => {
    onAutoplayEnabledChange?.(allEnabled);
  }, [allEnabled, onAutoplayEnabledChange]);

  const renderCheckbox = (
    checked: boolean,
    onToggle: (value: boolean) => void,
    label: string,
    secondary?: boolean,
  ) => (
    <TouchableOpacity
      style={[styles.checkboxRow, secondary && styles.checkboxRowSecondary]}
      onPress={() => onToggle(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <ThemedText style={styles.checkmark}>✓</ThemedText>}
      </View>
      <ThemedText style={styles.checkboxLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.headerText}>
          {t('games.table.autoplay.title')}
        </ThemedText>
        <ThemedText style={styles.toggle}>{expanded ? '▼' : '▶'}</ThemedText>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.options}>
          {renderCheckbox(
            allEnabled,
            setAllEnabled,
            t('games.table.autoplay.autoPlay'),
          )}
          {renderCheckbox(
            autoDrawEnabled,
            setAutoDrawEnabled,
            t('games.table.autoplay.autoDraw'),
            true,
          )}
          {renderCheckbox(
            autoSkipEnabled,
            setAutoSkipEnabled,
            t('games.table.autoplay.autoSkip'),
            true,
          )}
          {renderCheckbox(
            autoShuffleAfterDefuseEnabled,
            setAutoShuffleAfterDefuseEnabled,
            t('games.table.autoplay.autoShuffle'),
            true,
          )}
          {renderCheckbox(
            autoDrawSkipAfterShuffleEnabled,
            setAutoDrawSkipAfterShuffleEnabled,
            t('games.table.autoplay.autoDrawSkipAfterShuffle'),
            true,
          )}
          {renderCheckbox(
            autoNopeAttackEnabled,
            setAutoNopeAttackEnabled,
            t('games.table.autoplay.autoNopeAttack'),
            true,
          )}
          {renderCheckbox(
            autoGiveFavorEnabled,
            setAutoGiveFavorEnabled,
            t('games.table.autoplay.autoGiveFavor'),
            true,
          )}
          {renderCheckbox(
            autoDefuseEnabled,
            setAutoDefuseEnabled,
            t('games.table.autoplay.autoDefuse'),
            true,
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginVertical: 8,
    marginHorizontal: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  toggle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  options: {
    marginTop: 12,
    gap: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxRowSecondary: {
    marginLeft: 20,
    opacity: 0.9,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.6)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderColor: 'rgba(99, 102, 241, 0.9)',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    flex: 1,
  },
});
