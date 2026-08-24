'use client';
import { useState } from 'react';
import { Container, PageLayout, PageTitle, Button } from '@arcadeum/ui';
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
    (Record<string, unknown> & { tournaments?: TournamentsI18n }) | undefined;
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
  const [accumulatedTournaments, setAccumulatedTournaments] = useState<
    AdminTournamentItem[]
  >([]);
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
    setAccumulatedTournaments([]);
  };

  const handleLoadMore = () => {
    if (!isLoading && data && accumulatedTournaments.length < data.total) {
      setPage((p) => p + 1);
    }
  };

  if (data?.items && accumulatedTournaments.length === 0 && page === 1) {
    setAccumulatedTournaments(data.items);
  } else if (data?.items && page > 1) {
    const existingIds = new Set(accumulatedTournaments.map((it) => it.id));
    const newItems = data.items.filter((it) => !existingIds.has(it.id));
    if (newItems.length > 0) {
      setAccumulatedTournaments([...accumulatedTournaments, ...newItems]);
    }
  }

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

  const onTransition = (item: AdminTournamentItem) => {
    const next = nextStatuses(item.status);
    if (next.length === 0) return;
    if (next[0] === 'completed') {
      setMarkCompleteItem(item);
    } else {
      setPendingTransition({ item, to: next[0] });
    }
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

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col items-stretch gap-3">
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
            items={
              accumulatedTournaments.length > 0
                ? accumulatedTournaments
                : (data?.items ?? [])
            }
            total={data?.total ?? 0}
            isLoading={isLoading}
            hasFilter={!!q || status !== 'all' || gameType !== null}
            onLoadMore={handleLoadMore}
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
            <div
              className="flex flex-col items-stretch p-3 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] gap-3"
              data-testid="delete-confirm"
            >
              <span className="">
                {t.confirm.delete.replace(
                  '{name}',
                  pendingDelete.content.en.name,
                )}
              </span>
              <div className="flex flex-row items-stretch gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPendingDelete(null)}
                >
                  {t.actions.cancel}
                </Button>
                <Button onClick={confirmDelete}>{t.actions.delete}</Button>
              </div>
            </div>
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
            <div
              className="flex flex-col items-stretch p-3 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] gap-3"
              data-testid="transition-confirm"
            >
              <span className="font-bold">
                {t.transitionPrompt.title.replace(
                  '{name}',
                  pendingTransition.item.content.en.name,
                )}
              </span>

              <div className="flex flex-row items-stretch gap-2 flex-wrap">
                {nextStatuses(pendingTransition.item.status).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={pendingTransition.to === s ? undefined : 'outline'}
                    onClick={() =>
                      setPendingTransition((prev) =>
                        prev ? { ...prev, to: s } : prev,
                      )
                    }
                  >
                    {t.status[s]}
                  </Button>
                ))}
              </div>

              {pendingTransition.to === 'completed' && (
                <div className="flex flex-col items-stretch gap-1">
                  <span className="text-[12px] opacity-[0.7]">
                    {t.transitionPrompt.resultLabel}
                  </span>
                  <textarea
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="py-1.5 px-2.5 rounded-md border border-[var(--borderColor,#555)] bg-transparent text-inherit w-full font-inherit text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              <div className="flex flex-row items-stretch gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPendingTransition(null);
                    setResultText('');
                  }}
                >
                  {t.transitionPrompt.cancel}
                </Button>
                <Button onClick={confirmTransition}>
                  {t.transitionPrompt.confirm}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
