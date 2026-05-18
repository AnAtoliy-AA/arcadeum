'use client';
import { useState } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import {
  PageLayout,
  Container,
  PageTitle,
  Typography,
  YStack,
} from '@arcadeum/ui';
import { Spinner } from 'tamagui';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  usePublicTournaments,
  useRegisterTournament,
  useUnregisterTournament,
} from '@/features/tournaments/hooks';
import {
  TournamentCard,
  type TournamentCardLabels,
} from '@/features/tournaments/ui/TournamentCard';
import { RegisterConfirm } from '@/features/tournaments/ui/RegisterConfirm';
import { UnregisterConfirm } from '@/features/tournaments/ui/UnregisterConfirm';
import type { PublicTournamentItem } from '@/features/tournaments/api';

interface TournamentsListI18n {
  loading: string;
  empty: string;
  card: TournamentCardLabels;
}

interface TournamentsTopMessages {
  title?: string;
  subtitle?: string;
  comingSoon?: string;
  list?: TournamentsListI18n;
}

export default function TournamentsPageContent() {
  const { messages } = useLanguage();
  const t = messages.pages?.tournaments as TournamentsTopMessages | undefined;
  const listT = t?.list;

  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const isAuthenticated = !!accessToken;
  const { data, isLoading } = usePublicTournaments();
  const registerMut = useRegisterTournament();
  const unregisterMut = useUnregisterTournament();

  const [pendingRegister, setPendingRegister] =
    useState<PublicTournamentItem | null>(null);
  const [pendingUnregister, setPendingUnregister] =
    useState<PublicTournamentItem | null>(null);

  const items = data?.items ?? [];
  const showEmpty = !isLoading && items.length === 0;

  const handleRegisterClick = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    if (item.entryFeeCoins > 0) {
      setPendingRegister(item);
    } else {
      registerMut.mutate({ id });
    }
  };

  const handleUnregisterClick = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    setPendingUnregister(item);
  };

  const confirmRegister = async (id: string) => {
    await registerMut.mutateAsync({ id });
  };

  const confirmUnregister = async (id: string) => {
    await unregisterMut.mutateAsync({ id });
  };

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$4">
          <YStack gap="$1">
            <PageTitle size="xl" gradient>
              {t?.title}
            </PageTitle>
            {t?.subtitle && (
              <Typography variant="caption" alpha="medium">
                {t.subtitle}
              </Typography>
            )}
          </YStack>

          {isLoading && (
            <YStack alignItems="center" padding="$5">
              <Spinner />
            </YStack>
          )}

          {showEmpty && (
            <YStack alignItems="center" padding="$5">
              <Typography variant="body" alpha="medium">
                {listT?.empty ?? t?.comingSoon ?? 'No tournaments yet.'}
              </Typography>
            </YStack>
          )}

          {listT && items.length > 0 && (
            <YStack gap="$3">
              {items.map((item) => (
                <TournamentCard
                  key={item.id}
                  item={item}
                  isAuthenticated={isAuthenticated}
                  isPending={registerMut.isPending || unregisterMut.isPending}
                  onRegister={handleRegisterClick}
                  onUnregister={handleUnregisterClick}
                  labels={listT.card}
                />
              ))}
            </YStack>
          )}

          {pendingRegister && listT && (
            <RegisterConfirm
              tournamentId={pendingRegister.id}
              entryFeeCoins={pendingRegister.entryFeeCoins}
              currentBalanceCoins={null}
              open={true}
              onClose={() => setPendingRegister(null)}
              onSuccess={() => setPendingRegister(null)}
              onRegister={confirmRegister}
              labels={{
                ...listT.card.confirmRegister,
                errors: listT.card.errors,
              }}
            />
          )}

          {pendingUnregister && listT && (
            <UnregisterConfirm
              tournamentId={pendingUnregister.id}
              entryFeeCoins={pendingUnregister.entryFeeCoins}
              status={pendingUnregister.status}
              open={true}
              onClose={() => setPendingUnregister(null)}
              onSuccess={() => setPendingUnregister(null)}
              onUnregister={confirmUnregister}
              labels={listT.card.confirmUnregister}
            />
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
