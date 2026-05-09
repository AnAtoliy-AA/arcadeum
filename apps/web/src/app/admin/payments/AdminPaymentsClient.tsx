'use client';
import { useState } from 'react';
import { Container, PageLayout, PageTitle, YStack } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useAdminPaymentNotes } from '@/features/admin-payments/hooks';
import type { AdminNotesVisibility } from '@/features/admin-payments/api';
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
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
}

const PAGE_SIZE = 50;

export default function AdminPaymentsClient() {
  const { messages } = useLanguage();
  const t = messages.pages?.admin?.payments as PaymentsI18n | undefined;

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [visibility, setVisibility] = useState<AdminNotesVisibility>('all');

  const { data, isLoading } = useAdminPaymentNotes({
    page,
    pageSize: PAGE_SIZE,
    q,
    visibility,
  });

  const onFilterChange = (next: {
    q: string;
    visibility: AdminNotesVisibility;
  }) => {
    setQ(next.q);
    setVisibility(next.visibility);
    setPage(1);
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
      }
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$3">
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
              items={data?.items ?? []}
              total={data?.total ?? 0}
              page={page}
              pageSize={PAGE_SIZE}
              isLoading={isLoading}
              hasFilter={!!q || visibility !== 'all'}
              onPageChange={setPage}
              labels={tableLabels}
            />
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
