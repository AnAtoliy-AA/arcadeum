'use client';
import { useState } from 'react';
import { Container, PageLayout, PageTitle, YStack } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useAdminUsers, useUpdateUserRole } from '@/features/admin-users/hooks';
import type { UserRole } from '@/entities/session/model/types';
import { ApiError } from '@/shared/lib/api-client';
import { UsersFilters } from '@/features/admin-users/ui/UsersFilters';
import { UsersTable } from '@/features/admin-users/ui/UsersTable';

interface UsersI18n {
  title: string;
  search: { placeholder: string };
  filter: { role: { all: string; placeholder: string } };
  table: {
    username: string;
    email: string;
    role: string;
    createdAt: string;
    actions: string;
  };
  empty: { noResults: string; noUsers: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  selfTooltip: string;
  role: Record<UserRole, string>;
  errors: {
    SELF_ROLE_CHANGE_FORBIDDEN: string;
    LAST_ADMIN_PROTECTED: string;
    USER_NOT_FOUND: string;
    INVALID_USER_ID: string;
    generic: string;
  };
}

const PAGE_SIZE = 50;

export default function AdminUsersClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const { messages } = useLanguage();
  const t = messages.pages?.admin?.users as UsersI18n | undefined;

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | undefined>();

  const {
    data,
    isLoading,
    error: queryError,
  } = useAdminUsers({
    page,
    pageSize: PAGE_SIZE,
    q,
    role,
  });

  const mutation = useUpdateUserRole();

  const onFilterChange = (next: { q: string; role: UserRole | null }) => {
    setQ(next.q);
    setRole(next.role);
    setPage(1);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!t) return;
    setPendingUserId(userId);
    setErrorMsg(null);
    try {
      await mutation.mutateAsync({ userId, role: newRole });
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      const code = (apiErr?.data as { code?: string } | undefined)?.code;
      const msg =
        (code && t.errors[code as keyof typeof t.errors]) || t.errors.generic;
      setErrorMsg(msg);
    } finally {
      setPendingUserId(undefined);
    }
  };

  const labels = t
    ? {
        empty: t.empty,
        table: t.table,
        pagination: t.pagination,
        totalLabel: t.totalLabel,
        roleLabels: t.role,
        selfTooltip: t.selfTooltip,
      }
    : null;
  const filtersLabels = t
    ? {
        searchPlaceholder: t.search.placeholder,
        roleFilterPlaceholder: t.filter.role.placeholder,
        roleFilterAll: t.filter.role.all,
        roleLabels: t.role,
      }
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$3">
          <PageTitle size="lg">{t?.title ?? 'Users'}</PageTitle>
          {filtersLabels && (
            <UsersFilters
              q={q}
              role={role}
              onChange={onFilterChange}
              labels={filtersLabels}
            />
          )}
          {errorMsg && (
            <YStack
              padding="$3"
              borderRadius="$3"
              backgroundColor="$red3"
              data-testid="admin-users-error"
            >
              {errorMsg}
            </YStack>
          )}
          {labels && (
            <UsersTable
              items={data?.items ?? []}
              total={data?.total ?? 0}
              page={page}
              pageSize={PAGE_SIZE}
              isLoading={isLoading}
              isError={!!queryError}
              currentUserId={currentUserId}
              hasFilter={!!q || !!role}
              onRoleChange={handleRoleChange}
              onPageChange={setPage}
              pendingUserId={pendingUserId}
              labels={labels}
            />
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
