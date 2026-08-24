import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AdminAnnouncementsTable,
  type AdminAnnouncementsTableLabels,
} from './AdminAnnouncementsTable';
import type { AdminAnnouncementItem } from '../api';

vi.mock('@/shared/i18n/context', () => ({
  useLanguage: () => ({ locale: 'en-US', messages: {}, isReady: true }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => children;

const labels: AdminAnnouncementsTableLabels = {
  empty: { noResults: 'no results', noAnnouncements: 'none yet' },
  totalLabel: 'Showing {start}–{end} of {total}',
  table: {
    title: 'Title',
    severity: 'Severity',
    audience: 'Audience',
    window: 'Window',
    createdBy: 'Created by',
    actions: 'Actions',
    nowPill: 'Now',
  },
  severityLabels: { info: 'Info', warning: 'Warning', critical: 'Critical' },
  audienceLabels: { all: 'All', authenticated: 'Auth', anonymous: 'Anon' },
  statusLabels: {
    active: 'Active',
    scheduled: 'Scheduled',
    expired: 'Expired',
  },
  windowLabels: { now: 'Now', forever: 'Forever', always: 'Always' },
  edit: 'Edit',
  delete: 'Delete',
};

const item = (
  overrides: Partial<AdminAnnouncementItem> = {},
): AdminAnnouncementItem => ({
  id: 'a1',
  severity: 'info',
  audience: 'all',
  startsAt: null,
  endsAt: null,
  content: { en: { title: 'Hello world' } },
  createdBy: { id: 'u1', displayName: 'Bob' },
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-02T00:00:00Z',
  status: 'active',
  ...overrides,
});

const renderTable = (props: {
  items?: AdminAnnouncementItem[];
  total?: number;
  isLoading?: boolean;
  hasFilter?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onLoadMore?: () => void;
}) =>
  render(
    <Wrapper>
      <AdminAnnouncementsTable
        items={props.items ?? [item()]}
        total={props.total ?? 1}
        isLoading={props.isLoading ?? false}
        hasFilter={props.hasFilter ?? false}
        onEdit={props.onEdit ?? vi.fn()}
        onDelete={props.onDelete ?? vi.fn()}
        onLoadMore={props.onLoadMore ?? vi.fn()}
        labels={labels}
      />
    </Wrapper>,
  );

describe('AdminAnnouncementsTable', () => {
  it('renders empty state when no items + no filter', () => {
    renderTable({ items: [], total: 0 });
    expect(screen.getByTestId('announcements-table-empty')).toHaveTextContent(
      'none yet',
    );
  });

  it('renders no-results state when filter applied', () => {
    renderTable({ items: [], total: 0, hasFilter: true });
    expect(screen.getByTestId('announcements-table-empty')).toHaveTextContent(
      'no results',
    );
  });

  it('renders rows with title, severity, audience', () => {
    renderTable({});
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('shows Now pill when status=active', () => {
    renderTable({});
    expect(screen.getByText('Now')).toBeInTheDocument();
  });

  it('hides Now pill when status=scheduled', () => {
    renderTable({ items: [item({ status: 'scheduled' })] });
    expect(screen.queryByText('Now')).not.toBeInTheDocument();
  });

  it('truncates very long titles', () => {
    const longTitle = 'X'.repeat(80);
    renderTable({ items: [item({ content: { en: { title: longTitle } } })] });
    expect(screen.getByText(/X{50,}…/)).toBeInTheDocument();
  });

  it('falls back to em-dash when createdBy.displayName missing', () => {
    renderTable({
      items: [item({ createdBy: { id: 'u1', displayName: null } })],
    });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('fires onEdit/onDelete with item', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderTable({ onEdit, onDelete });
    fireEvent.click(screen.getByTestId('edit-a1'));
    fireEvent.click(screen.getByTestId('delete-a1'));
    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });

  it('renders infinite scroll trigger when items < total', () => {
    const onLoadMore = vi.fn();
    renderTable({ items: [item()], total: 100, onLoadMore });
    expect(
      screen.getByTestId('announcements-infinite-scroll-trigger'),
    ).toBeInTheDocument();
    const loadMoreBtn = screen.getByTestId('announcements-load-more');
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('renders all loaded status when items >= total', () => {
    renderTable({ items: [item()], total: 1 });
    expect(screen.getByTestId('announcements-all-loaded')).toBeInTheDocument();
    expect(screen.getByText('All 1 announcements loaded')).toBeInTheDocument();
  });
});
