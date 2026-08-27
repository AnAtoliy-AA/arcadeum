'use client';
import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/context';
import { Container, PageLayout, PageTitle, Typography } from '@arcadeum/ui';
import { Spinner } from '@/shared/ui/CSSSpinner';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  usePublicTournaments,
  useTournamentBracket,
} from '@/features/tournaments/hooks';
import { STATUS_BG } from '@/features/tournaments/ui/TournamentCard';
import { BracketView } from '@/features/tournaments/ui/BracketView';
import type {
  EffectiveTournamentStatus,
  PublicTournamentItem,
  TournamentBracketResponse,
} from '@/features/tournaments/api';

interface BracketI18n {
  title: string;
  loading: string;
  empty: string;
  tbd: string;
  winner: string;
  backToList: string;
  errors: { locked: string; notEnoughPlayers: string };
}

interface CardI18n {
  registered: string;
  prize: string;
  effectiveStatus: Record<EffectiveTournamentStatus, string>;
}

interface TournamentsTopMessages {
  title?: string;
  comingSoon?: string;
  list?: { card?: CardI18n };
  bracket?: BracketI18n;
}

interface TournamentDetailContentProps {
  id: string;
  initialBracket: TournamentBracketResponse | null;
}

export default function TournamentDetailContent({
  id,
  initialBracket,
}: TournamentDetailContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const t = messages.pages?.tournaments as TournamentsTopMessages | undefined;
  const bracketT = t?.bracket;

  // There is no public single-tournament endpoint yet — the summary row
  // (name / registeredCount / prize) comes from the public list query,
  // while status + format come from the bracket response itself.
  const { data: listData, isLoading: isListLoading } = usePublicTournaments();
  const summary: PublicTournamentItem | null =
    listData?.items.find((item) => item.id === id) ?? null;

  const { data, isLoading, error } = useTournamentBracket(id);
  // Show the server-fetched bracket while the client query warms up.
  const bracket =
    data?.bracket ?? (isLoading ? (initialBracket?.bracket ?? null) : null);
  const showEmpty = !isLoading && !error && bracket === null;

  // Prefer the derived effective status; fall back to the raw status
  // carried by the bracket response.
  const chipKey: EffectiveTournamentStatus | undefined =
    summary?.effectiveStatus ?? bracket?.status ?? undefined;
  const chipLabel = chipKey
    ? (t?.list?.card?.effectiveStatus?.[chipKey] ?? chipKey)
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col items-stretch gap-4">
          <Link
            href={routes.tournaments}
            className="self-start text-[13px] font-bold text-[var(--primary)] underline-offset-2 hover:underline"
            data-testid="back-to-tournaments"
          >
            ← {bracketT?.backToList}
          </Link>

          <div className="flex flex-row items-start justify-between gap-2">
            <PageTitle size="xl" gradient>
              {summary?.name ?? t?.title}
            </PageTitle>
            {chipKey && chipLabel && (
              <div
                className="box-border flex flex-row items-stretch px-2 py-1 rounded-lg"
                style={{ backgroundColor: STATUS_BG[chipKey] }}
                data-testid="tournament-status-chip"
              >
                <span className="text-[12px] font-bold">{chipLabel}</span>
              </div>
            )}
          </div>

          {summary && (
            <div className="flex flex-row items-center gap-3 flex-wrap text-[14px]">
              <span className="opacity-[0.7]" data-testid="registered-count">
                {(t?.list?.card?.registered ?? '{count} / {max}')
                  .replace('{count}', String(summary.registeredCount))
                  .replace('{max}', String(summary.maxPlayers))}
              </span>
              {summary.prizeDescription && (
                <span>
                  <span className="font-bold">{t?.list?.card?.prize}:</span>{' '}
                  {summary.prizeDescription}
                </span>
              )}
            </div>
          )}

          {(isLoading || (isListLoading && !bracket)) && (
            <div
              className="flex flex-col items-center p-5"
              data-testid="bracket-loading"
            >
              <Spinner />
            </div>
          )}

          {!isLoading && error && (
            <div
              className="flex flex-col items-start gap-2 p-5"
              data-testid="bracket-error"
            >
              <Typography variant="body" alpha="medium">
                {error.message}
              </Typography>
            </div>
          )}

          {showEmpty && (
            <div
              className="flex flex-col items-center p-5"
              data-testid="bracket-empty"
            >
              <Typography variant="body" alpha="medium">
                {bracketT?.empty ?? t?.comingSoon}
              </Typography>
            </div>
          )}

          {bracket && bracketT && (
            <BracketView
              bracket={bracket}
              labels={{
                tbd: bracketT.tbd,
                winner: bracketT.winner,
              }}
            />
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
