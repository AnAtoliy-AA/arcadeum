import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AdminPaymentsTable,
  type AdminPaymentsTableLabels,
} from './AdminPaymentsTable';
import type { AdminPaymentNoteItem } from '../api';

const Wrapper = ({ children }: { children: React.ReactNode }) => children;

const renderWith = (ui: React.ReactElement) => render(<Wrapper>{ui}</Wrapper>);

const labels: AdminPaymentsTableLabels = {
  empty: { noNotes: 'no notes', noResults: 'no results' },
  pagination: {
    prev: 'Prev',
    next: 'Next',
    of: 'Page {current} of {total}',
  },
  totalLabel: '{total} notes',
  chipPublic: 'Public',
  chipPrivate: 'Private',
  anonymous: 'Anonymous',
};

const baseProps = {
  items: [],
  total: 0,
  isLoading: false,
  hasFilter: false,
  onLoadMore: () => {},
  labels,
};

const sampleItem: AdminPaymentNoteItem = {
  id: 'n1',
  note: 'Thanks for the donation!',
  amount: 5,
  currency: 'USD',
  displayName: 'Alice',
  createdAt: '2026-01-01T00:00:00Z',
  transactionId: 'tx_abc',
  isPublic: true,
  userId: null,
};

describe('AdminPaymentsTable', () => {
  it('shows noNotes when empty + no filter', () => {
    renderWith(<AdminPaymentsTable {...baseProps} />);
    expect(screen.getByText('no notes')).toBeInTheDocument();
  });

  it('shows noResults when empty + filter active', () => {
    renderWith(<AdminPaymentsTable {...baseProps} hasFilter />);
    expect(screen.getByText('no results')).toBeInTheDocument();
  });

  it('renders rows with displayName, transactionId, formatted amount', () => {
    renderWith(
      <AdminPaymentsTable {...baseProps} items={[sampleItem]} total={1} />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('tx_abc')).toBeInTheDocument();
    expect(screen.getByText(/Thanks for the donation/)).toBeInTheDocument();
  });

  it('renders Anonymous placeholder when displayName is null', () => {
    renderWith(
      <AdminPaymentsTable
        {...baseProps}
        items={[{ ...sampleItem, displayName: null }]}
        total={1}
      />,
    );
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('renders Public chip for isPublic: true', () => {
    renderWith(
      <AdminPaymentsTable {...baseProps} items={[sampleItem]} total={1} />,
    );
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('renders Private chip for isPublic: false', () => {
    renderWith(
      <AdminPaymentsTable
        {...baseProps}
        items={[{ ...sampleItem, isPublic: false }]}
        total={1}
      />,
    );
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('falls back to "<amount> <currency>" when Intl.NumberFormat throws', () => {
    renderWith(
      <AdminPaymentsTable
        {...baseProps}
        items={[{ ...sampleItem, currency: 'NOTACURRENCY' }]}
        total={1}
      />,
    );
    expect(screen.getByText('5 NOTACURRENCY')).toBeInTheDocument();
  });

  it('renders infinite scroll trigger when items < total', () => {
    const onLoadMore = vi.fn();
    renderWith(
      <AdminPaymentsTable
        {...baseProps}
        items={[sampleItem]}
        total={120}
        onLoadMore={onLoadMore}
      />,
    );
    expect(
      screen.getByTestId('admin-payments-infinite-scroll-trigger'),
    ).toBeInTheDocument();
    const loadMoreBtn = screen.getByTestId('admin-payments-load-more');
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('renders all loaded status when items >= total', () => {
    renderWith(
      <AdminPaymentsTable {...baseProps} items={[sampleItem]} total={1} />,
    );
    expect(screen.getByTestId('admin-payments-all-loaded')).toBeInTheDocument();
    expect(screen.getByText('All 1 notes loaded')).toBeInTheDocument();
  });
});
