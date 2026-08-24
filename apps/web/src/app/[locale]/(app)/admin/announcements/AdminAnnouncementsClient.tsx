'use client';
import { useState, useEffect } from 'react';
import { Container, PageLayout, PageTitle, Button } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from '@/features/admin-announcements/hooks';
import type {
  AdminAnnouncementItem,
  AdminAnnouncementsStatusFilter,
  AnnouncementSeverity,
  CreateAnnouncementBody,
} from '@/features/admin-announcements/api';
import { AdminAnnouncementsFilters } from '@/features/admin-announcements/ui/AdminAnnouncementsFilters';
import { AdminAnnouncementsTable } from '@/features/admin-announcements/ui/AdminAnnouncementsTable';
import { AdminAnnouncementForm } from '@/features/admin-announcements/ui/AdminAnnouncementForm';

interface AnnouncementsI18n {
  title: string;
  actions: {
    new: string;
    edit: string;
    delete: string;
    cancel: string;
    save: string;
  };
  filters: {
    searchPlaceholder: string;
    status: {
      label: string;
      all: string;
      active: string;
      scheduled: string;
      expired: string;
    };
    severity: {
      label: string;
      all: string;
      info: string;
      warning: string;
      critical: string;
    };
  };
  table: {
    title: string;
    severity: string;
    audience: string;
    window: string;
    createdBy: string;
    actions: string;
    nowPill: string;
  };
  severity: Record<AnnouncementSeverity, string>;
  audience: { all: string; authenticated: string; anonymous: string };
  status: { active: string; scheduled: string; expired: string };
  windowLabels: { now: string; forever: string; always: string };
  form: {
    sections: { settings: string; content: string };
    severity: string;
    audience: string;
    startsAt: string;
    endsAt: string;
    immediately: string;
    forever: string;
    tabs: { en: string; ru: string; es: string; fr: string; by: string };
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    errors: {
      titleRequired: string;
      endsBeforeStarts: string;
      invalidUrl: string;
    };
  };
  confirm: { delete: string };
  empty: { noResults: string; noAnnouncements: string };
  pagination?: { prev: string; next: string; of: string };
  totalLabel: string;
}

const PAGE_SIZE = 25;

interface ModalState {
  mode: 'create' | 'edit';
  initial: AdminAnnouncementItem | null;
}

export default function AdminAnnouncementsClient() {
  const { messages } = useLanguage();
  const adminMessages = messages.pages?.admin as
    | (Record<string, unknown> & { announcements?: AnnouncementsI18n })
    | undefined;
  const t = adminMessages?.announcements;

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<AdminAnnouncementsStatusFilter>('all');
  const [severity, setSeverity] = useState<AnnouncementSeverity | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<AdminAnnouncementItem | null>(null);
  const [accumulatedAnnouncements, setAccumulatedAnnouncements] = useState<
    AdminAnnouncementItem[]
  >([]);

  const { data, isLoading } = useAdminAnnouncements({
    page,
    pageSize: PAGE_SIZE,
    q,
    status,
    severity,
  });

  const createMut = useCreateAnnouncement();
  const updateMut = useUpdateAnnouncement();
  const deleteMut = useDeleteAnnouncement();

  useEffect(() => {
    if (!data?.items) return;
    setAccumulatedAnnouncements((prev) => {
      if (page === 1) {
        return data.items;
      }
      const existingIds = new Set(prev.map((it) => it.id));
      const newItems = data.items.filter((it) => !existingIds.has(it.id));
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });
  }, [data?.items, page]);

  if (!t) {
    return (
      <PageLayout>
        <Container size="lg">
          <PageTitle size="lg">Announcements</PageTitle>
        </Container>
      </PageLayout>
    );
  }

  const filtersLabels = {
    searchPlaceholder: t.filters.searchPlaceholder,
    statusLabels: {
      all: t.filters.status.all,
      active: t.filters.status.active,
      scheduled: t.filters.status.scheduled,
      expired: t.filters.status.expired,
    },
    severityFilterAll: t.filters.severity.all,
    severityLabels: t.severity,
    newButton: t.actions.new,
  };

  const tableLabels = {
    empty: t.empty,
    pagination: t.pagination,
    totalLabel: t.totalLabel,
    table: t.table,
    severityLabels: t.severity,
    audienceLabels: t.audience,
    statusLabels: t.status,
    windowLabels: t.windowLabels,
    edit: t.actions.edit,
    delete: t.actions.delete,
  };

  const formLabels = {
    sections: t.form.sections,
    severity: t.form.severity,
    severityLabels: t.severity,
    audience: t.form.audience,
    audienceLabels: t.audience,
    startsAt: t.form.startsAt,
    endsAt: t.form.endsAt,
    immediately: t.form.immediately,
    forever: t.form.forever,
    tabs: t.form.tabs,
    title: t.form.title,
    body: t.form.body,
    ctaLabel: t.form.ctaLabel,
    ctaHref: t.form.ctaHref,
    errors: t.form.errors,
    cancel: t.actions.cancel,
    save: t.actions.save,
  };

  const onFilterChange = (next: {
    q: string;
    status: AdminAnnouncementsStatusFilter;
    severity: AnnouncementSeverity | null;
  }) => {
    setQ(next.q);
    setStatus(next.status);
    setSeverity(next.severity);
    setPage(1);
    setAccumulatedAnnouncements([]);
  };

  const handleLoadMore = () => {
    if (!isLoading && data && accumulatedAnnouncements.length < data.total) {
      setPage((p) => p + 1);
    }
  };

  const handleSubmit = async (body: CreateAnnouncementBody) => {
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

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col items-stretch gap-3">
          <PageTitle size="lg">{t.title}</PageTitle>

          <AdminAnnouncementsFilters
            q={q}
            status={status}
            severity={severity}
            onChange={onFilterChange}
            onNewClick={() => setModal({ mode: 'create', initial: null })}
            labels={filtersLabels}
          />

          <AdminAnnouncementsTable
            items={
              accumulatedAnnouncements.length > 0
                ? accumulatedAnnouncements
                : (data?.items ?? [])
            }
            total={data?.total ?? 0}
            isLoading={isLoading}
            hasFilter={!!q || status !== 'all' || severity !== null}
            onLoadMore={handleLoadMore}
            onEdit={(item) => setModal({ mode: 'edit', initial: item })}
            onDelete={(item) => setPendingDelete(item)}
            labels={tableLabels}
          />

          {modal && (
            <AdminAnnouncementForm
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
                  '{title}',
                  pendingDelete.content.en.title,
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
        </div>
      </Container>
    </PageLayout>
  );
}
