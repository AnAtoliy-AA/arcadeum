import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AdminTournamentsTable,
  type AdminTournamentsTableLabels,
} from './AdminTournamentsTable';
import type { AdminTournamentItem } from '../api';

const Wrapper = ({ children }: { children: React.ReactNode }) => children;

const renderWith = (ui: React.ReactElement) => render(<Wrapper>{ui}</Wrapper>);

const labels: AdminTournamentsTableLabels = {
  empty: { noTournaments: 'no tournaments', noResults: 'no results' },
  totalLabel: '{total} tournaments',
  table: {
    name: 'Name',
    gameType: 'Game',
    scheduled: 'Scheduled',
    status: 'Status',
    registered: 'Registered',
    createdBy: 'Created By',
    actions: 'Actions',
  },
  statusLabels: {
    scheduled: 'Scheduled',
    registration_open: 'Open',
    live: 'Live',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
  gameTypeLabels: {
    critical_v1: 'Critical',
    sea_battle_v1: 'Sea Battle',
  },
  edit: 'Edit',
  delete: 'Delete',
  transition: 'Transition',
  markComplete: 'Mark Complete',
};

const sampleTournament: AdminTournamentItem = {
  id: 't1',
  gameType: 'critical_v1',
  status: 'scheduled',
  scheduledAt: '2026-09-01T12:00:00Z',
  registrationOpensAt: '2026-08-25T12:00:00Z',
  registrationClosesAt: '2026-09-01T11:00:00Z',
  maxPlayers: 16,
  registeredCount: 4,
  waitlistCount: 0,
  content: {
    en: { name: 'Grand Master Championship', description: 'Annual tournament' },
  },
  createdBy: { id: 'admin1', displayName: 'Admin' },
  entryFeeCoins: 0,
  prizePoolCoins: 100,
  prizeDescription: null,
  resultText: null,
  winnerUserId: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const baseProps = {
  items: [],
  total: 0,
  isLoading: false,
  hasFilter: false,
  onLoadMore: () => {},
  onEdit: () => {},
  onDelete: () => {},
  onTransition: () => {},
  onMarkComplete: () => {},
  labels,
};

describe('AdminTournamentsTable', () => {
  it('shows noTournaments when empty + no filter', () => {
    renderWith(<AdminTournamentsTable {...baseProps} />);
    expect(screen.getByText('no tournaments')).toBeInTheDocument();
  });

  it('renders rows with name, status and actions', () => {
    renderWith(
      <AdminTournamentsTable
        {...baseProps}
        items={[sampleTournament]}
        total={1}
      />,
    );
    expect(screen.getByText(/Grand Master Championship/)).toBeInTheDocument();
    expect(screen.getByTestId('tournament-row-t1')).toHaveTextContent(
      'Scheduled',
    );
    expect(screen.getByTestId('edit-t1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-t1')).toBeInTheDocument();
  });

  it('renders infinite scroll trigger when items < total', () => {
    const onLoadMore = vi.fn();
    renderWith(
      <AdminTournamentsTable
        {...baseProps}
        items={[sampleTournament]}
        total={10}
        onLoadMore={onLoadMore}
      />,
    );
    expect(
      screen.getByTestId('infinite-scroll-trigger'),
    ).toBeInTheDocument();
    const loadMoreBtn = screen.getByTestId('infinite-scroll-load-more');
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('renders all loaded status when items >= total', () => {
    renderWith(
      <AdminTournamentsTable
        {...baseProps}
        items={[sampleTournament]}
        total={1}
      />,
    );
    expect(screen.getByTestId('infinite-scroll-all-loaded')).toBeInTheDocument();
    expect(screen.getByText('All 1 tournaments loaded')).toBeInTheDocument();
  });
});
