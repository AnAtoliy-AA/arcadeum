'use client';

import { useState, useEffect } from 'react';
import { Container, PageLayout, PageTitle } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useAdminPaymentNotes } from '@/features/admin-payments/hooks';
import type {
  AdminNotesVisibility,
  AdminPaymentNoteItem,
} from '@/features/admin-payments/api';
import { AdminPaymentsFilters } from '@/features/admin-payments/ui/AdminPaymentsFilters';
import { AdminPaymentsTable } from '@/features/admin-payments/ui/AdminPaymentsTable';

interface PaymentsI18n {
  title: string;
  search: { placeholder: string };
  filter: {
    visibility: {
      label: string;
      all: string;
      public: string;
      private: string;
    };
  };
  table: {
    user: string;
    amount: string;
    note: string;
    visibility: string;
    createdAt: string;
    transactionId: string;
  };
  chip: { public: string; private: string; anonymous: string };
  empty: { noResults: string; noNotes: string };
  pagination?: { prev: string; next: string; of: string };
  totalLabel: string;
}

const PAGE_SIZE = 50;

export default function AdminPaymentsClient() {
  const { messages } = useLanguage();
  const t = messages.pages?.admin?.payments as PaymentsI18n | undefined;

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [visibility, setVisibility] = useState<AdminNotesVisibility>('all');
  const [accumulatedNotes, setAccumulatedNotes] = useState<
    AdminPaymentNoteItem[]
  >([]);

  const { data, isLoading } = useAdminPaymentNotes({
    page,
    pageSize: PAGE_SIZE,
    q,
    visibility,
  });

  useEffect(() => {
    if (!data?.items) return;
    setAccumulatedNotes((prev) => {
      if (page === 1) {
        return data.items;
      }
      const existingIds = new Set(prev.map((it) => it.id));
      const newItems = data.items.filter((it) => !existingIds.has(it.id));
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });
  }, [data?.items, page]);

  const onFilterChange = (next: {
    q: string;
    visibility: AdminNotesVisibility;
  }) => {
    setQ(next.q);
    setVisibility(next.visibility);
    setPage(1);
    setAccumulatedNotes([]);
  };

  const handleLoadMore = () => {
    if (!isLoading && data && accumulatedNotes.length < data.total) {
      setPage((p) => p + 1);
    }
  };

  const filtersLabels = t
    ? {
        searchPlaceholder: t.search.placeholder,
        visibilityLabel: t.filter.visibility.label,
        visibilityAll: t.filter.visibility.all,
        visibilityPublic: t.filter.visibility.public,
        visibilityPrivate: t.filter.visibility.private,
      }
    : null;

  const tableLabels = t
    ? {
        empty: t.empty,
        pagination: t.pagination,
        totalLabel: t.totalLabel,
        chipPublic: t.chip.public,
        chipPrivate: t.chip.private,
        anonymous: t.chip.anonymous,
        header: {
          user: t.table.user,
          amount: t.table.amount,
          note: t.table.note,
          visibility: t.table.visibility,
          createdAt: t.table.createdAt,
        },
      }
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col items-stretch gap-3">
          <PageTitle size="lg">{t?.title ?? 'Payments'}</PageTitle>
          {filtersLabels && (
            <AdminPaymentsFilters
              q={q}
              visibility={visibility}
              onChange={onFilterChange}
              labels={filtersLabels}
            />
          )}
          {tableLabels && (
            <AdminPaymentsTable
              items={
                accumulatedNotes.length > 0
                  ? accumulatedNotes
                  : (data?.items ?? [])
              }
              total={data?.total ?? 0}
              isLoading={isLoading}
              hasFilter={!!q || visibility !== 'all'}
              onLoadMore={handleLoadMore}
              labels={tableLabels}
            />
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
