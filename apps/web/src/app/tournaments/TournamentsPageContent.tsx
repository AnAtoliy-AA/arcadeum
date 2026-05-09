'use client';
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

  const items = data?.items ?? [];
  const showEmpty = !isLoading && items.length === 0;

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
                  onRegister={(id) => registerMut.mutate({ id })}
                  onUnregister={(id) => unregisterMut.mutate({ id })}
                  labels={listT.card}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
