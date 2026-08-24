'use client';
import { useState, useEffect } from 'react';
import { Container, PageLayout, PageTitle } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import {
  useAdminUsers,
  useUpdateUserRole,
  useBlockUser,
  useUnblockUser,
  useDeleteUser,
  useRestoreUser,
  useBulkDeleteUsers,
} from '@/features/admin-users/hooks';
import type { UserRole } from '@/entities/session/model/types';
import type {
  AdminUserItem,
  AdminUserStatus,
} from '@/features/admin-users/api';
import { ApiError } from '@/shared/lib/api-client';
import { UsersFilters } from '@/features/admin-users/ui/UsersFilters';
import { UsersTable } from '@/features/admin-users/ui/UsersTable';
import { AdminWalletDrawer } from '@/features/admin-wallet/ui/AdminWalletDrawer';
import type { AdminWalletI18n } from '@/shared/i18n/messages/pages/admin-wallet/en';

interface UsersI18n {
  title: string;
  search: { placeholder: string };
  filter: {
    role: { all: string; placeholder: string };
    status: { all: string; placeholder: string };
  };
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
  status: Record<AdminUserStatus, string>;
  actions: {
    block: string;
    unblock: string;
    remove: string;
    restore: string;
  };
  errors: {
    SELF_ROLE_CHANGE_FORBIDDEN: string;
    LAST_ADMIN_PROTECTED: string;
    USER_NOT_FOUND: string;
    INVALID_USER_ID: string;
    CANNOT_BLOCK_SELF: string;
    CANNOT_DELETE_SELF: string;
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
  const [status, setStatus] = useState<AdminUserStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | undefined>();
  const [walletTarget, setWalletTarget] = useState<{ userId: string } | null>(
    null,
  );

  const {
    data,
    isLoading,
    error: queryError,
  } = useAdminUsers({
    page,
    pageSize: PAGE_SIZE,
    q,
    role,
    status,
  });

  const roleMutation = useUpdateUserRole();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();
  const bulkDeleteMutation = useBulkDeleteUsers();

  const [accumulatedUsers, setAccumulatedUsers] = useState<AdminUserItem[]>([]);

  useEffect(() => {
    if (!data?.items) return;
    setAccumulatedUsers((prev) => {
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
    role: UserRole | null;
    status: AdminUserStatus | null;
  }) => {
    setQ(next.q);
    setRole(next.role);
    setStatus(next.status);
    setPage(1);
    setAccumulatedUsers([]);
  };

  const handleLoadMore = () => {
    if (!isLoading && data && accumulatedUsers.length < data.total) {
      setPage((p) => p + 1);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!t) return;
    setPendingUserId(userId);
    setErrorMsg(null);
    try {
      await roleMutation.mutateAsync({ userId, role: newRole });
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

  const handleBlock = async (userId: string) => {
    if (!t) return;
    setPendingUserId(userId);
    setErrorMsg(null);
    try {
      await blockMutation.mutateAsync({ userId });
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

  const handleUnblock = async (userId: string) => {
    if (!t) return;
    setPendingUserId(userId);
    setErrorMsg(null);
    try {
      await unblockMutation.mutateAsync({ userId });
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

  const handleDelete = async (userId: string) => {
    if (!t) return;
    setPendingUserId(userId);
    setErrorMsg(null);
    try {
      await deleteMutation.mutateAsync({ userId });
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

  const handleRestore = async (userId: string) => {
    if (!t) return;
    setPendingUserId(userId);
    setErrorMsg(null);
    try {
      await restoreMutation.mutateAsync({ userId });
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

  const handleBulkDelete = async (userIds: string[]) => {
    if (!t) return;
    setErrorMsg(null);
    try {
      const result = await bulkDeleteMutation.mutateAsync({ userIds });
      if (result.skipped.length > 0) {
        setErrorMsg(
          `Deleted ${result.deleted} users. Skipped ${result.skipped.length} users (self, admins, or already deleted).`,
        );
      }
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      const code = (apiErr?.data as { code?: string } | undefined)?.code;
      const msg =
        (code && t.errors[code as keyof typeof t.errors]) || t.errors.generic;
      setErrorMsg(msg);
    }
  };

  const tWallet = messages.pages?.admin?.wallet as AdminWalletI18n | undefined;

  const walletDrawerLabels = tWallet
    ? {
        title: tWallet.drawer.title,
        sections: tWallet.drawer.sections,
        form: {
          currencyLabel: tWallet.form.currencyLabel,
          amountLabel: tWallet.form.amountLabel,
          noteLabel: tWallet.form.noteLabel,
          grant: tWallet.form.grant,
          deduct: tWallet.form.deduct,
          submitting: tWallet.form.submitting,
          success: tWallet.form.success,
          errors: tWallet.errors,
        },
      }
    : null;

  const labels = t
    ? {
        empty: t.empty,
        table: {
          username: t.table.username,
          email: t.table.email,
          role: t.table.role,
          createdAt: t.table.createdAt,
          actions: t.table.actions,
          selectAll:
            (t.table as Record<string, string>).selectAll ?? 'Select all',
          selectedCount:
            (t.table as Record<string, string>).selectedCount ??
            '{count} selected',
          deleteSelected:
            (t.table as Record<string, string>).deleteSelected ??
            'Delete selected',
          deselectAll:
            (t.table as Record<string, string>).deselectAll ?? 'Deselect all',
        },
        pagination: t.pagination,
        totalLabel: t.totalLabel,
        roleLabels: t.role,
        selfTooltip: t.selfTooltip,
        walletButtonLabel: tWallet?.drawer.openButton ?? 'Wallet',
        blockLabel: t.actions.block,
        unblockLabel: t.actions.unblock,
        removeLabel: t.actions.remove,
        restoreLabel: t.actions.restore,
      }
    : null;
  const filtersLabels = t
    ? {
        searchPlaceholder: t.search.placeholder,
        roleFilterPlaceholder: t.filter.role.placeholder,
        roleFilterAll: t.filter.role.all,
        statusFilterAll: t.filter.status.all,
        statusLabels: t.status,
        roleLabels: t.role,
      }
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col items-stretch gap-3">
          <PageTitle size="lg">{t?.title ?? 'Users'}</PageTitle>
          {filtersLabels && (
            <UsersFilters
              q={q}
              role={role}
              status={status}
              onChange={onFilterChange}
              labels={filtersLabels}
            />
          )}
          {errorMsg && (
            <div
              className="flex flex-col items-stretch p-3 rounded-xl bg-[#4c1d1d]"
              data-testid="admin-users-error"
            >
              {errorMsg}
            </div>
          )}
          {labels && (
            <UsersTable
              items={
                accumulatedUsers.length > 0
                  ? accumulatedUsers
                  : (data?.items ?? [])
              }
              total={data?.total ?? 0}
              isLoading={isLoading}
              isError={!!queryError}
              currentUserId={currentUserId}
              hasFilter={!!q || !!role || !!status}
              onRoleChange={handleRoleChange}
              onWalletOpen={(userId) => setWalletTarget({ userId })}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onBulkDelete={handleBulkDelete}
              onLoadMore={handleLoadMore}
              pendingUserId={pendingUserId}
              labels={labels}
            />
          )}
        </div>
      </Container>
      {walletDrawerLabels && (
        <AdminWalletDrawer
          userId={walletTarget?.userId ?? ''}
          open={!!walletTarget}
          onClose={() => setWalletTarget(null)}
          labels={walletDrawerLabels}
        />
      )}
    </PageLayout>
  );
}
