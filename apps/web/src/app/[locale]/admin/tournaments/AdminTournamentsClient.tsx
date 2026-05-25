'use client';
import { useState } from 'react';
import {
  Container,
  PageLayout,
  PageTitle,
  YStack,
  XStack,
  Button,
} from '@arcadeum/ui';
import { Text } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import {
  useAdminTournaments,
  useCreateTournament,
  useUpdateTournament,
  useDeleteTournament,
  useTransitionTournament,
} from '@/features/admin-tournaments/hooks';
import type {
  AdminTournamentItem,
  AdminTournamentStatusFilter,
  CreateTournamentBody,
  TournamentGameType,
  TournamentStatus,
} from '@/features/admin-tournaments/api';
import { AdminTournamentsFilters } from '@/features/admin-tournaments/ui/AdminTournamentsFilters';
import { AdminTournamentsTable } from '@/features/admin-tournaments/ui/AdminTournamentsTable';
import { AdminTournamentForm } from '@/features/admin-tournaments/ui/AdminTournamentForm';
import { MarkCompleteDialog } from '@/features/admin-tournaments/ui/MarkCompleteDialog';
import { nextStatuses } from '@/features/admin-tournaments/lib/transitions';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { ADMIN_TOURNAMENTS_REFRESH_KEY } from '@/features/admin-tournaments/hooks';

interface TournamentsI18n {
  title: string;
  actions: {
    new: string;
    edit: string;
    delete: string;
    cancel: string;
    save: string;
    transition: string;
  };
  filters: {
    searchPlaceholder: string;
    status: { label: string };
    gameType: { label: string; all: string };
  };
  table: {
    name: string;
    gameType: string;
    scheduled: string;
    status: string;
    registered: string;
    createdBy: string;
    actions: string;
  };
  status: Record<TournamentStatus, string>;
  gameType: Record<TournamentGameType, string>;
  form: {
    sections: { settings: string; content: string };
    gameType: string;
    scheduledAt: string;
    registrationOpensAt: string;
    registrationClosesAt: string;
    optional: string;
    maxPlayers: string;
    prizeDescription: string;
    entryFeeLabel: string;
    prizePoolLabel: string;
    tabs: { en: string; ru: string; es: string; fr: string; by: string };
    name: string;
    description: string;
    errors: {
      nameRequired: string;
      capacityRange: string;
      windowOrder: string;
    };
  };
  markComplete: {
    button: string;
    dialog: { title: string; body: string; confirm: string; cancel: string };
    errors: { notRegistered: string; notLive: string; generic: string };
  };
  transitionPrompt: {
    title: string;
    resultLabel: string;
    confirm: string;
    cancel: string;
  };
  confirm: { delete: string };
  empty: { noResults: string; noTournaments: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
}

const PAGE_SIZE = 25;

interface ModalState {
  mode: 'create' | 'edit';
  initial: AdminTournamentItem | null;
}

interface TransitionState {
  item: AdminTournamentItem;
  to: TournamentStatus;
}

export default function AdminTournamentsClient() {
  const { messages } = useLanguage();
  const adminMessages = messages.pages?.admin as
    | (Record<string, unknown> & { tournaments?: TournamentsI18n })
    | undefined;
  const t = adminMessages?.tournaments;

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<AdminTournamentStatusFilter>('all');
  const [gameType, setGameType] = useState<TournamentGameType | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<AdminTournamentItem | null>(null);
  const [pendingTransition, setPendingTransition] =
    useState<TransitionState | null>(null);
  const [resultText, setResultText] = useState('');
  const [markCompleteItem, setMarkCompleteItem] =
    useState<AdminTournamentItem | null>(null);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);

  const { data, isLoading } = useAdminTournaments({
    page,
    pageSize: PAGE_SIZE,
    q,
    status,
    gameType,
  });

  const createMut = useCreateTournament();
  const updateMut = useUpdateTournament();
  const deleteMut = useDeleteTournament();
  const transitionMut = useTransitionTournament();

  if (!t) {
    return (
      <PageLayout>
        <Container size="lg">
          <PageTitle size="lg">Tournaments</PageTitle>
        </Container>
      </PageLayout>
    );
  }

  const filtersLabels = {
    searchPlaceholder: t.filters.searchPlaceholder,
    statusLabels: {
      all: t.filters.status.label,
      ...t.status,
    },
    gameTypeFilterAll: t.filters.gameType.all,
    gameTypeLabels: t.gameType,
    newButton: t.actions.new,
  };

  const tableLabels = {
    empty: t.empty,
    pagination: t.pagination,
    totalLabel: t.totalLabel,
    table: t.table,
    statusLabels: t.status,
    gameTypeLabels: t.gameType,
    edit: t.actions.edit,
    delete: t.actions.delete,
    transition: t.actions.transition,
    markComplete: t.markComplete.button,
  };

  const formLabels = {
    sections: t.form.sections,
    gameType: t.form.gameType,
    gameTypeLabels: t.gameType,
    scheduledAt: t.form.scheduledAt,
    registrationOpensAt: t.form.registrationOpensAt,
    registrationClosesAt: t.form.registrationClosesAt,
    optional: t.form.optional,
    maxPlayers: t.form.maxPlayers,
    prizeDescription: t.form.prizeDescription,
    entryFeeLabel: t.form.entryFeeLabel,
    prizePoolLabel: t.form.prizePoolLabel,
    tabs: t.form.tabs,
    name: t.form.name,
    description: t.form.description,
    errors: t.form.errors,
    cancel: t.actions.cancel,
    save: t.actions.save,
  };

  const onFilterChange = (next: {
    q: string;
    status: AdminTournamentStatusFilter;
    gameType: TournamentGameType | null;
  }) => {
    setQ(next.q);
    setStatus(next.status);
    setGameType(next.gameType);
    setPage(1);
  };

  const handleSubmit = async (body: CreateTournamentBody) => {
    if (!modal) return;
    if (modal.mode === 'create') {
      await createMut.mutateAsync(body);
    } else if (modal.initial) {
      await updateMut.mutateAsync({ id: modal.initial.id, body });
    }
    setModal(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteMut.mutateAsync({ id: pendingDelete.id });
    setPendingDelete(null);
  };

  const confirmTransition = async () => {
    if (!pendingTransition) return;
    await transitionMut.mutateAsync({
      id: pendingTransition.item.id,
      body: {
        to: pendingTransition.to,
        resultText:
          pendingTransition.to === 'completed' ? resultText : undefined,
      },
    });
    setPendingTransition(null);
    setResultText('');
  };

  const onTransition = (item: AdminTournamentItem) => {
    const next = nextStatuses(item.status);
    if (next.length === 0) return;
    // Default to the first next state — the dialog renders all options.
    setPendingTransition({ item, to: next[0]! });
  };

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$3">
          <PageTitle size="lg">{t.title}</PageTitle>

          <AdminTournamentsFilters
            q={q}
            status={status}
            gameType={gameType}
            onChange={onFilterChange}
            onNewClick={() => setModal({ mode: 'create', initial: null })}
            labels={filtersLabels}
          />

          <AdminTournamentsTable
            items={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            isLoading={isLoading}
            hasFilter={!!q || status !== 'all' || gameType !== null}
            onPageChange={setPage}
            onEdit={(item) => setModal({ mode: 'edit', initial: item })}
            onDelete={(item) => setPendingDelete(item)}
            onTransition={onTransition}
            onMarkComplete={(item) => setMarkCompleteItem(item)}
            labels={tableLabels}
          />

          {modal && (
            <AdminTournamentForm
              initial={modal.initial}
              isSubmitting={createMut.isPending || updateMut.isPending}
              onSubmit={handleSubmit}
              onCancel={() => setModal(null)}
              labels={formLabels}
            />
          )}

          {pendingDelete && (
            <YStack
              padding="$3"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
              backgroundColor="$background"
              data-testid="delete-confirm"
              gap="$3"
            >
              <Text>
                {t.confirm.delete.replace(
                  '{name}',
                  pendingDelete.content.en.name,
                )}
              </Text>
              <XStack gap="$3" justifyContent="flex-end">
                <Button
                  variant="outline"
                  onPress={() => setPendingDelete(null)}
                >
                  {t.actions.cancel}
                </Button>
                <Button onPress={confirmDelete}>{t.actions.delete}</Button>
              </XStack>
            </YStack>
          )}

          {markCompleteItem && (
            <MarkCompleteDialog
              tournament={markCompleteItem}
              open={true}
              onClose={() => setMarkCompleteItem(null)}
              onSuccess={() => {
                setMarkCompleteItem(null);
                triggerRefresh(ADMIN_TOURNAMENTS_REFRESH_KEY);
              }}
              labels={t.markComplete}
            />
          )}

          {pendingTransition && (
            <YStack
              padding="$3"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
              backgroundColor="$background"
              data-testid="transition-confirm"
              gap="$3"
            >
              <Text fontWeight="700">
                {t.transitionPrompt.title.replace(
                  '{name}',
                  pendingTransition.item.content.en.name,
                )}
              </Text>

              <XStack gap="$2" flexWrap="wrap">
                {nextStatuses(pendingTransition.item.status).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={pendingTransition.to === s ? undefined : 'outline'}
                    onPress={() =>
                      setPendingTransition((prev) =>
                        prev ? { ...prev, to: s } : prev,
                      )
                    }
                  >
                    {t.status[s]}
                  </Button>
                ))}
              </XStack>

              {pendingTransition.to === 'completed' && (
                <YStack gap="$1">
                  <Text fontSize="$1" opacity={0.7}>
                    {t.transitionPrompt.resultLabel}
                  </Text>
                  <textarea
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #555',
                      background: 'transparent',
                      color: 'inherit',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </YStack>
              )}

              <XStack gap="$3" justifyContent="flex-end">
                <Button
                  variant="outline"
                  onPress={() => {
                    setPendingTransition(null);
                    setResultText('');
                  }}
                >
                  {t.transitionPrompt.cancel}
                </Button>
                <Button onPress={confirmTransition}>
                  {t.transitionPrompt.confirm}
                </Button>
              </XStack>
            </YStack>
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
