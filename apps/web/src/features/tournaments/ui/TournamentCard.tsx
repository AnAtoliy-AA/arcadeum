'use client';
import { Button, GlassCard, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import {
  type EffectiveTournamentStatus,
  type PublicTournamentItem,
} from '../api';
import type { TournamentGameType } from '@/features/admin-tournaments/api';

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
  confirmRegister: {
    title: string;
    body: string;
    confirm: string;
    cancel: string;
  };
  confirmUnregister: {
    refund: string;
    title: string;
    body: string;
    confirm: string;
    cancelButton: string;
  };
  errors: { insufficientFunds: string };
  effectiveStatus: Record<EffectiveTournamentStatus, string>;
  gameType: Record<TournamentGameType, string>;
}

export interface TournamentCardProps {
  item: PublicTournamentItem;
  isAuthenticated: boolean;
  isPending?: boolean;
  onRegister: (id: string) => void;
  onUnregister: (id: string) => void;
  labels: TournamentCardLabels;
}

const STATUS_BG: Record<EffectiveTournamentStatus, string> = {
  scheduled: '$gray3',
  registration_open: '$infoBgSoft',
  registration_closed: '$gray4',
  live: '$successBgSoft',
  awaiting_results: '$warningBgSoft',
  completed: '$gray4',
  cancelled: '$errorBgSoft',
};

function formatDateTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
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
  const { locale } = useLanguage();
  const isFull = item.registeredCount >= item.maxPlayers;
  const canRegister = item.effectiveStatus === 'registration_open';

  let cta: React.ReactNode = null;
  if (
    item.effectiveStatus === 'cancelled' ||
    item.effectiveStatus === 'completed'
  ) {
    cta = null;
  } else if (!isAuthenticated) {
    cta = (
      <Text fontSize="$1" opacity={0.7}>
        {labels.signInToRegister}
      </Text>
    );
  } else if (item.isRegistered) {
    cta = (
      <Button
        variant="outline"
        size="sm"
        onPress={() => onUnregister(item.id)}
        disabled={isPending}
        data-testid={`unregister-${item.id}`}
      >
        {labels.unregisterCta}
      </Button>
    );
  } else if (canRegister) {
    cta = (
      <Button
        size="sm"
        onPress={() => onRegister(item.id)}
        disabled={isPending}
        data-testid={`register-${item.id}`}
      >
        {isFull ? labels.full : labels.registerCta}
      </Button>
    );
  } else {
    cta = (
      <Text fontSize="$1" opacity={0.7}>
        {labels.registrationClosed}
      </Text>
    );
  }

  return (
    <GlassCard p="$4" gap="$3" data-testid={`tournament-card-${item.id}`}>
      <XStack alignItems="flex-start" justifyContent="space-between" gap="$2">
        <YStack flex={1} gap="$1">
          <Text fontSize="$5" fontWeight="700">
            {item.name}
          </Text>
          <Text fontSize="$1" opacity={0.7}>
            {labels.gameType[item.gameType]} ·{' '}
            {formatDateTime(item.scheduledAt, locale)}
          </Text>
        </YStack>
        <XStack
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
          backgroundColor={STATUS_BG[item.effectiveStatus]}
        >
          <Text fontSize="$1" fontWeight="700">
            {labels.effectiveStatus[item.effectiveStatus]}
          </Text>
        </XStack>
      </XStack>

      {item.description && (
        <Text fontSize="$2" opacity={0.85}>
          {item.description}
        </Text>
      )}

      {item.prizeDescription && (
        <Text fontSize="$2">
          <Text fontWeight="700">{labels.prize}:</Text> {item.prizeDescription}
        </Text>
      )}

      {(item.entryFeeCoins > 0 || item.prizePoolCoins > 0) && (
        <XStack gap="$3" flexWrap="wrap">
          {item.entryFeeCoins > 0 && (
            <Text fontSize="$2" data-testid={`entry-fee-${item.id}`}>
              <Text fontWeight="700">{labels.entryFee}:</Text>{' '}
              {item.entryFeeCoins.toLocaleString()}
            </Text>
          )}
          {item.prizePoolCoins > 0 && (
            <Text fontSize="$2" data-testid={`prize-pool-${item.id}`}>
              <Text fontWeight="700">{labels.prizePool}:</Text>{' '}
              {item.prizePoolCoins.toLocaleString()}
            </Text>
          )}
        </XStack>
      )}

      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize="$1" opacity={0.7}>
          {labels.registered
            .replace('{count}', String(item.registeredCount))
            .replace('{max}', String(item.maxPlayers))}
          {item.waitlistCount > 0 ? ` (+${item.waitlistCount})` : ''}
        </Text>
        {cta}
      </XStack>
    </GlassCard>
  );
}
