import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';
import type {
  PublicTournamentItem,
  EffectiveTournamentStatus,
} from '../api/tournamentApi';

export interface TournamentCardLabels {
  registered: string;
  prize: string;
  entryFee: string;
  prizePool: string;
  registerCta: string;
  unregisterCta: string;
  signInToRegister: string;
  full: string;
  registrationClosed: string;
  errors: { insufficientFunds: string };
  effectiveStatus: Record<EffectiveTournamentStatus, string>;
  gameType: Record<string, string>;
}

export interface TournamentCardProps {
  item: PublicTournamentItem;
  isAuthenticated: boolean;
  isPending?: boolean;
  onRegister: (id: string) => void;
  onUnregister: (id: string) => void;
  labels: TournamentCardLabels;
}

const STATUS_BG_DARK: Record<EffectiveTournamentStatus, string> = {
  scheduled: '#1E293B',
  registration_open: '#1E3A5F',
  registration_closed: '#1A1F2E',
  live: '#14532D',
  awaiting_results: '#3F3010',
  completed: '#1A1F2E',
  cancelled: '#450A0A',
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function TournamentCard({
  item,
  isAuthenticated,
  isPending,
  onRegister,
  onUnregister,
  labels,
}: TournamentCardProps) {
  const styles = useThemedStyles(createStyles);

  const canRegister = item.effectiveStatus === 'registration_open';
  const isFull = item.registeredCount >= item.maxPlayers;

  const registeredLabel = labels.registered
    .replace('{count}', String(item.registeredCount))
    .replace('{max}', String(item.maxPlayers));

  return (
    <ThemedView style={styles.card} testID={`tournament-card-${item.id}`}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <ThemedText type="defaultSemiBold" style={styles.name}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.meta}>
            {labels.gameType[item.gameType] ?? item.gameType}
            {' · '}
            {formatDateTime(item.scheduledAt)}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: STATUS_BG_DARK[item.effectiveStatus] },
          ]}
        >
          <ThemedText style={styles.statusText}>
            {labels.effectiveStatus[item.effectiveStatus]}
          </ThemedText>
        </View>
      </View>

      {/* Description */}
      {Boolean(item.description) && (
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      )}

      {/* Prize description */}
      {Boolean(item.prizeDescription) && (
        <ThemedText style={styles.prizeLine}>
          <ThemedText type="defaultSemiBold">{labels.prize}: </ThemedText>
          {item.prizeDescription}
        </ThemedText>
      )}

      {/* Entry fee + prize pool */}
      {(item.entryFeeCoins > 0 || item.prizePoolCoins > 0) && (
        <View style={styles.coinsRow}>
          {item.entryFeeCoins > 0 && (
            <View
              style={styles.coinChip}
              testID={`entry-fee-${item.id}`}
              accessible
              accessibilityLabel={`${labels.entryFee}: ${item.entryFeeCoins}`}
            >
              <IconSymbol
                name="dollarsign.circle.fill"
                size={14}
                color="#eab308"
              />
              <ThemedText style={styles.coinChipText}>
                {labels.entryFee}: {item.entryFeeCoins.toLocaleString()}
              </ThemedText>
            </View>
          )}
          {item.prizePoolCoins > 0 && (
            <View
              style={styles.coinChip}
              testID={`prize-pool-${item.id}`}
              accessible
              accessibilityLabel={`${labels.prizePool}: ${item.prizePoolCoins}`}
            >
              <IconSymbol name="trophy.fill" size={14} color="#22c55e" />
              <ThemedText style={styles.coinChipText}>
                {labels.prizePool}: {item.prizePoolCoins.toLocaleString()}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Footer: registered count + CTA */}
      <View style={styles.footer}>
        <ThemedText style={styles.registeredLabel}>
          {registeredLabel}
          {item.waitlistCount > 0 ? ` (+${item.waitlistCount})` : ''}
        </ThemedText>

        {!isAuthenticated &&
          item.effectiveStatus !== 'cancelled' &&
          item.effectiveStatus !== 'completed' && (
            <ThemedText style={styles.hint}>
              {labels.signInToRegister}
            </ThemedText>
          )}

        {isAuthenticated && item.isRegistered && (
          <ThemedText
            style={styles.unregisterBtn}
            onPress={() => !isPending && onUnregister(item.id)}
            testID={`unregister-${item.id}`}
          >
            {labels.unregisterCta}
          </ThemedText>
        )}

        {isAuthenticated && !item.isRegistered && canRegister && (
          <ThemedText
            style={styles.registerBtn}
            onPress={() => !isPending && onRegister(item.id)}
            testID={`register-${item.id}`}
          >
            {isFull ? labels.full : labels.registerCta}
          </ThemedText>
        )}

        {isAuthenticated &&
          !item.isRegistered &&
          !canRegister &&
          item.effectiveStatus !== 'cancelled' &&
          item.effectiveStatus !== 'completed' && (
            <ThemedText style={styles.hint}>
              {labels.registrationClosed}
            </ThemedText>
          )}
      </View>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      padding: 16,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      ...platformShadow({
        color: '#000',
        opacity: 0.08,
        radius: 8,
        offset: { width: 0, height: 2 },
        elevation: 2,
      }),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    headerLeft: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: 15,
      color: palette.text,
    },
    meta: {
      fontSize: 12,
      color: palette.icon,
    },
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      color: palette.text,
    },
    description: {
      fontSize: 13,
      color: palette.text,
      opacity: 0.85,
    },
    prizeLine: {
      fontSize: 13,
      color: palette.text,
    },
    coinsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    coinChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: 'rgba(148,163,184,0.12)',
    },
    coinChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
      gap: 12,
    },
    registeredLabel: {
      fontSize: 12,
      color: palette.icon,
      flex: 1,
    },
    registerBtn: {
      fontSize: 13,
      fontWeight: '700',
      color: palette.tint,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    unregisterBtn: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.icon,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    hint: {
      fontSize: 12,
      color: palette.icon,
    },
  });
}
