import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface IdleTimerDisplayProps {
  secondsRemaining: number;
  isActive: boolean;
  autoplayTriggered: boolean;
  onStop: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

/**
 * Displays the idle timer countdown and autoplay status.
 * Shows countdown when timer is active.
 * Shows "Autoplay Active" badge with stop button when autoplay was triggered by timer.
 */
export function IdleTimerDisplay({
  secondsRemaining,
  isActive,
  autoplayTriggered,
  onStop,
  t,
}: IdleTimerDisplayProps) {
  if (!isActive && !autoplayTriggered) {
    return null;
  }

  if (autoplayTriggered) {
    return (
      <View style={styles.container}>
        <View style={styles.activeContainer}>
          <View style={styles.activeBadge}>
            <ThemedText style={styles.robotEmoji}>🤖</ThemedText>
            <ThemedText style={styles.activeText}>
              {t('games.table.idleTimer.active')}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={onStop}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.stopButtonText}>
              {t('games.table.idleTimer.stop')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.countdownContainer}>
        <ThemedText style={styles.timerEmoji}>⏱️</ThemedText>
        <ThemedText style={styles.countdownText}>
          {t('games.table.idleTimer.countdown', { seconds: secondsRemaining })}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  timerEmoji: {
    fontSize: 18,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(251, 191, 36, 1)',
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  robotEmoji: {
    fontSize: 18,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(34, 197, 94, 1)',
  },
  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  stopButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
