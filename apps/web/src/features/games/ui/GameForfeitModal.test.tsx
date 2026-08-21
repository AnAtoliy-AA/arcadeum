import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameForfeitModal } from './GameForfeitModal';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => (key.startsWith('games.') ? key : key),
  }),
}));

describe('GameForfeitModal', () => {
  const base = { open: true, onClose: vi.fn(), onConfirm: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default labels from shared i18n keys', () => {
    render(<GameForfeitModal {...base} />);
    expect(screen.getByText('games.table.forfeit.title')).toBeInTheDocument();
    expect(screen.getByText('games.table.forfeit.message')).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when confirmed', () => {
    render(<GameForfeitModal {...base} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'games.table.forfeit.confirm' }),
    );
    expect(base.onConfirm).toHaveBeenCalledTimes(1);
    expect(base.onClose).toHaveBeenCalledTimes(1);
  });

  it('only calls onClose when cancelled', () => {
    render(<GameForfeitModal {...base} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'games.table.forfeit.cancel' }),
    );
    expect(base.onConfirm).not.toHaveBeenCalled();
    expect(base.onClose).toHaveBeenCalledTimes(1);
  });

  it('supports custom labels', () => {
    render(
      <GameForfeitModal
        {...base}
        labels={{
          title: 'Give up?',
          message: 'Sure?',
          confirm: 'Yes, give up',
          cancel: 'No',
        }}
      />,
    );
    expect(screen.getByText('Give up?')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Yes, give up' }),
    ).toBeInTheDocument();
  });
});
