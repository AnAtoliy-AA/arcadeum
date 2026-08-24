import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsersTable, type UsersTableLabels } from './UsersTable';
import type { AdminUserItem } from '../api';

const Wrapper = ({ children }: { children: React.ReactNode }) => children;

const renderWithProvider = (ui: React.ReactElement) =>
  render(<Wrapper>{ui}</Wrapper>);

const labels: UsersTableLabels = {
  empty: { noUsers: 'no users', noResults: 'no results' },
  table: {
    username: 'Username',
    email: 'Email',
    role: 'Role',
    actions: 'Actions',
    selectAll: 'Select all',
    selectedCount: '{count} selected',
    deleteSelected: 'Delete selected',
    deselectAll: 'Deselect all',
  },
  pagination: {
    prev: 'Prev',
    next: 'Next',
    of: 'Page {current} of {total}',
  },
  totalLabel: '{total} users',
  roleLabels: {
    free: 'Free',
    admin: 'Admin',
    developer: 'Dev',
    moderator: 'Mod',
    tester: 'Tester',
    vip: 'VIP',
    supporter: 'Sup',
    premium: 'Prem',
  },
  selfTooltip: 'cant edit',
  walletButtonLabel: 'Wallet',
  blockLabel: 'Block',
  unblockLabel: 'Unblock',
  removeLabel: 'Remove',
  restoreLabel: 'Restore',
};

const baseProps = {
  items: [],
  total: 0,
  isLoading: false,
  isError: false,
  currentUserId: 'me',
  hasFilter: false,
  onRoleChange: () => {},
  onWalletOpen: () => {},
  onBlock: () => {},
  onUnblock: () => {},
  onDelete: () => {},
  onRestore: () => {},
  onBulkDelete: () => {},
  onLoadMore: () => {},
  labels,
};

const sampleItem: AdminUserItem = {
  id: 'u1',
  email: 'a@x',
  username: 'alice',
  displayName: null,
  role: 'free',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  isBlocked: false,
  blockedAt: null,
  blockedReason: null,
  deletedAt: null,
};

describe('UsersTable', () => {
  it('shows noUsers when total=0 and no filter', () => {
    renderWithProvider(<UsersTable {...baseProps} />);
    expect(screen.getByText('no users')).toBeInTheDocument();
  });

  it('shows noResults when total=0 and filter active', () => {
    renderWithProvider(<UsersTable {...baseProps} hasFilter />);
    expect(screen.getByText('no results')).toBeInTheDocument();
  });

  it('renders rows with username + role badge + role select', () => {
    renderWithProvider(
      <UsersTable {...baseProps} items={[sampleItem]} total={1} />,
    );
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByTestId('role-badge-free')).toBeInTheDocument();
    expect(screen.getByTestId('role-select-u1')).toBeInTheDocument();
  });

  it('disables role select for current user', () => {
    renderWithProvider(
      <UsersTable
        {...baseProps}
        items={[sampleItem]}
        total={1}
        currentUserId="u1"
      />,
    );
    expect(screen.getByTestId('role-select-u1')).toBeDisabled();
  });

  it('fires onRoleChange when select changes', () => {
    const onRoleChange = vi.fn();
    renderWithProvider(
      <UsersTable
        {...baseProps}
        items={[sampleItem]}
        total={1}
        onRoleChange={onRoleChange}
      />,
    );
    fireEvent.change(screen.getByTestId('role-select-u1'), {
      target: { value: 'admin' },
    });
    expect(onRoleChange).toHaveBeenCalledWith('u1', 'admin');
  });

  it('renders infinite scroll trigger when items < total', () => {
    const onLoadMore = vi.fn();
    renderWithProvider(
      <UsersTable
        {...baseProps}
        items={[sampleItem]}
        total={120}
        onLoadMore={onLoadMore}
      />,
    );
    expect(
      screen.getByTestId('users-infinite-scroll-trigger'),
    ).toBeInTheDocument();
    const loadMoreBtn = screen.getByTestId('users-load-more');
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('renders all loaded status when items >= total', () => {
    renderWithProvider(
      <UsersTable {...baseProps} items={[sampleItem]} total={1} />,
    );
    expect(screen.getByTestId('users-all-loaded')).toBeInTheDocument();
    expect(screen.getByText('All 1 users loaded')).toBeInTheDocument();
  });
});
