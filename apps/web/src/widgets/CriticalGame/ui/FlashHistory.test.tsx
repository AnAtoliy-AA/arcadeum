import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FlashHistory } from './FlashHistory';
import type { CriticalLogEntry } from '../types';

function makeEntry(
  override: Partial<CriticalLogEntry> & Pick<CriticalLogEntry, 'id'>,
): CriticalLogEntry {
  return {
    type: 'action',
    message: `Entry ${override.id}`,
    createdAt: '2026-05-15T10:00:00.000Z',
    ...override,
  };
}

const echo = (m?: string | null) => m ?? '';

describe('FlashHistory', () => {
  it('renders nothing when there are no action / system entries', () => {
    render(
      <FlashHistory
        logs={[makeEntry({ id: '1', type: 'message', message: 'chat' })]}
        formatMessage={echo}
      />,
    );
    expect(screen.queryByTestId('flash-history')).not.toBeInTheDocument();
  });

  it('renders the last N entries (default 5) with the most recent first', () => {
    const logs = Array.from({ length: 8 }, (_, i) =>
      makeEntry({ id: String(i + 1), message: `Event ${i + 1}` }),
    );
    render(<FlashHistory logs={logs} formatMessage={echo} />);
    const rows = screen.getAllByTestId('flash-history-row');
    expect(rows).toHaveLength(5);
    // Last 5 are 4..8 reversed → newest (8) on top.
    expect(rows[0].textContent).toContain('Event 8');
    expect(rows[4].textContent).toContain('Event 4');
  });

  it('filters out non-action entries (chat / lobby noise)', () => {
    render(
      <FlashHistory
        logs={[
          makeEntry({ id: '1', type: 'action', message: 'drew strike' }),
          makeEntry({ id: '2', type: 'message', message: 'hi everyone' }),
          makeEntry({ id: '3', type: 'system', message: 'game started' }),
        ]}
        formatMessage={echo}
      />,
    );
    const rows = screen.getAllByTestId('flash-history-row');
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.textContent).join('|')).not.toContain(
      'hi everyone',
    );
  });

  it('honours an explicit limit prop', () => {
    const logs = Array.from({ length: 5 }, (_, i) =>
      makeEntry({ id: String(i + 1) }),
    );
    render(<FlashHistory logs={logs} formatMessage={echo} limit={2} />);
    expect(screen.getAllByTestId('flash-history-row')).toHaveLength(2);
  });

  it('prefixes each row with the actor name resolved from senderId', () => {
    render(
      <FlashHistory
        logs={[
          makeEntry({
            id: 'a',
            senderId: 'p1',
            senderName: 'Alice (stale)',
            message: 'Drew a card',
          }),
        ]}
        formatMessage={echo}
        // Resolver wins over the stale snapshot in senderName so renamed
        // players display their current name.
        resolveDisplayName={(id) => (id === 'p1' ? 'Alice' : '')}
      />,
    );
    const row = screen.getByTestId('flash-history-row');
    const actor = screen.getByTestId('flash-history-actor');
    expect(actor).toHaveTextContent('Alice');
    expect(row).toHaveAttribute('data-actor', 'Alice');
    expect(row.textContent).toContain('Drew a card');
  });

  it('falls back to senderName when no resolver is provided', () => {
    render(
      <FlashHistory
        logs={[
          makeEntry({
            id: 'a',
            senderId: 'p1',
            senderName: 'Bob',
            message: 'Played a strike',
          }),
        ]}
        formatMessage={echo}
      />,
    );
    expect(screen.getByTestId('flash-history-actor')).toHaveTextContent('Bob');
  });

  it('omits the actor column when neither senderId nor senderName is present', () => {
    render(
      <FlashHistory
        logs={[
          makeEntry({
            id: 'a',
            type: 'system',
            message: 'Game started',
          }),
        ]}
        formatMessage={echo}
      />,
    );
    expect(screen.queryByTestId('flash-history-actor')).not.toBeInTheDocument();
  });
});
