import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface GamePlaceholderProps {
  placeholderText: string;
  canStart: boolean;
  startBusy: boolean;
  onStart: () => void;
  t: (key: string) => string;
  styles: {
    placeholder: object;
    placeholderText: object;
    primaryButton: object;
    primaryButtonDisabled: object | null;
    primaryButtonText: { color?: string };
  };
}

export function GamePlaceholder({
  placeholderText,
  canStart,
  startBusy,
  onStart,
  t,
  styles,
}: GamePlaceholderProps) {
  return (
    <View style={styles.placeholder}>
      <ThemedText style={styles.placeholderText}>{placeholderText}</ThemedText>
      {canStart ? (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            startBusy ? styles.primaryButtonDisabled : null,
          ]}
          onPress={onStart}
          disabled={startBusy}
        >
          {startBusy ? (
            <ActivityIndicator
              size="small"
              color={styles.primaryButtonText.color as string}
            />
          ) : (
            <>
              <IconSymbol
                name="play.fill"
                size={16}
                color={styles.primaryButtonText.color as string}
              />
              <ThemedText style={styles.primaryButtonText}>
                {t('games.table.actions.start')}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
