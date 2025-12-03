import React from 'react';
import { Animated, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import type { ExplodingCatsTableStyles } from '../styles';

interface TableStatsProps {
  deckCount: number;
  pendingDraws: number | string;
  pendingDrawsCaption: string;
  deckPulseScale: Animated.Value;
  styles: ExplodingCatsTableStyles;
}

export function TableStats({
  deckCount,
  pendingDraws,
  pendingDrawsCaption,
  deckPulseScale,
  styles,
}: TableStatsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.tableStatsRow}>
      <Animated.View
        style={[
          styles.tableStatCard,
          { transform: [{ scale: deckPulseScale }] },
        ]}
      >
        <IconSymbol
          name="rectangle.stack"
          size={18}
          color={styles.tableStatIcon.color as string}
        />
        <View style={styles.tableStatTextGroup}>
          <ThemedText style={styles.tableStatTitle}>
            {deckCount}
          </ThemedText>
          <ThemedText style={styles.tableStatSubtitle}>
            {t('games.table.info.inDeck')}
          </ThemedText>
        </View>
      </Animated.View>
      <View style={styles.tableStatCard}>
        <IconSymbol
          name="hourglass"
          size={18}
          color={styles.tableStatIcon.color as string}
        />
        <View style={styles.tableStatTextGroup}>
          <ThemedText style={styles.tableStatTitle}>
            {pendingDraws}
          </ThemedText>
          <ThemedText style={styles.tableStatSubtitle}>
            {pendingDrawsCaption}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
