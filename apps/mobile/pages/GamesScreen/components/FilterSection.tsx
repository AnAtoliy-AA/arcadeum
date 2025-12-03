import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import type {
  StatusFilterValue,
  ParticipationFilterValue,
  FilterOption,
  ParticipationFilterOption,
} from '../types';

type FilterSectionProps = {
  statusFilter: StatusFilterValue;
  setStatusFilter: (value: StatusFilterValue) => void;
  participationFilter: ParticipationFilterValue;
  setParticipationFilter: (value: ParticipationFilterValue) => void;
  statusOptions: FilterOption<StatusFilterValue>[];
  participationOptions: ParticipationFilterOption[];
  isAuthenticated: boolean;
};

export function FilterSection({
  statusFilter,
  setStatusFilter,
  participationFilter,
  setParticipationFilter,
  statusOptions,
  participationOptions,
  isAuthenticated,
}: FilterSectionProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <ThemedText style={styles.label}>
          {t('games.lounge.filters.statusLabel')}
        </ThemedText>
        <View style={styles.chipsRow}>
          {statusOptions.map((option) => {
            const selected = option.value === statusFilter;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => {
                  setStatusFilter(option.value);
                }}
                disabled={selected}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    selected && styles.chipTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <ThemedText style={styles.label}>
          {t('games.lounge.filters.participationLabel')}
        </ThemedText>
        <View style={styles.chipsRow}>
          {participationOptions.map((option) => {
            const selected = option.value === participationFilter;
            const disabled = option.requiresAuth && !isAuthenticated;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  selected && styles.chipActive,
                  disabled && styles.chipDisabled,
                ]}
                onPress={() => {
                  if (disabled) {
                    return;
                  }
                  setParticipationFilter(option.value);
                }}
                disabled={disabled || selected}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    selected && styles.chipTextActive,
                    disabled && styles.chipTextDisabled,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
        {!isAuthenticated && (
          <ThemedText style={styles.helperText}>
            {t('games.lounge.filters.participationSignedOut')}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      marginTop: 8,
      gap: 16,
    },
    group: {
      gap: 8,
    },
    label: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.gameRoom.border,
      backgroundColor: palette.gameRoom.raisedBackground,
    },
    chipActive: {
      backgroundColor: palette.tint,
      borderColor: palette.tint,
    },
    chipDisabled: {
      opacity: 0.6,
    },
    chipText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '500',
    },
    chipTextActive: {
      color: palette.background,
    },
    chipTextDisabled: {
      color: palette.icon,
    },
    helperText: {
      color: palette.icon,
      fontSize: 12,
      lineHeight: 16,
    },
  });
}
