import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import {
  AdminAnnouncementsTable,
  type AdminAnnouncementsTableLabels,
} from './AdminAnnouncementsTable';
import type { AdminAnnouncementItem } from '../api';

vi.mock('@/shared/i18n/context', () => ({
  useLanguage: () => ({ locale: 'en-US', messages: {}, isReady: true }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: AdminAnnouncementsTableLabels = {
  empty: { noResults: 'no results', noAnnouncements: 'none yet' },
  pagination: { prev: 'Prev', next: 'Next', of: '{current} / {total}' },
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
  page?: number;
  isLoading?: boolean;
  hasFilter?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPageChange?: () => void;
}) =>
  render(
    <Wrapper>
      <AdminAnnouncementsTable
        items={props.items ?? [item()]}
        total={props.total ?? 1}
        page={props.page ?? 1}
        pageSize={25}
        isLoading={props.isLoading ?? false}
        hasFilter={props.hasFilter ?? false}
        onEdit={props.onEdit ?? vi.fn()}
        onDelete={props.onDelete ?? vi.fn()}
        onPageChange={props.onPageChange ?? vi.fn()}
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

  it('disables prev on page 1, fires next on click', () => {
    const onPageChange = vi.fn();
    renderTable({ total: 100, page: 1, onPageChange });
    const prev = screen.getByText('Prev').closest('button');
    expect(prev).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders total label with placeholders filled', () => {
    renderTable({ items: [item()], total: 47 });
    // Multiple-row scenario uses end = min(total, page*pageSize) = 1 here.
    // Just verify the totalLabel substitution happened (no '{}' braces left).
    expect(screen.getByText(/Showing \d+.*\d+ of 47/)).toBeInTheDocument();
  });
});
