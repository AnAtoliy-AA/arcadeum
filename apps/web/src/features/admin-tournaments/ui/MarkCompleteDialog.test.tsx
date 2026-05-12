import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';

vi.mock('../server/tournament.actions', () => ({
  markCompleteAction: vi.fn(),
}));

import { markCompleteAction } from '../server/tournament.actions';
import {
  MarkCompleteDialog,
  type MarkCompleteDialogLabels,
} from './MarkCompleteDialog';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: MarkCompleteDialogLabels = {
  button: 'Mark complete',
  dialog: {
    title: 'Select winner',
    body: 'Who won?',
    confirm: 'Mark complete',
    cancel: 'Cancel',
  },
  errors: {
    notRegistered: 'Not registered.',
    notLive: 'Not live.',
    generic: 'Error.',
  },
};

const mockTournament = {
  id: 'tour-1',
  registrations: [
    { userId: 'user-1', displayName: 'Alice' },
    { userId: 'user-2', displayName: 'Bob' },
  ],
};

const renderDialog = (
  props: Partial<Parameters<typeof MarkCompleteDialog>[0]> = {},
) =>
  render(
    <Wrapper>
      <MarkCompleteDialog
        tournament={mockTournament}
        open={true}
        onClose={() => undefined}
        labels={labels}
        {...props}
      />
    </Wrapper>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MarkCompleteDialog', () => {
  it('renders dialog with participant select when open', () => {
    renderDialog();
    expect(screen.getByTestId('mark-complete-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('winner-select')).toBeInTheDocument();
    expect(screen.getByText('Alice (user-1)')).toBeInTheDocument();
    expect(screen.getByText('Bob (user-2)')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    renderDialog({ open: false });
    expect(
      screen.queryByTestId('mark-complete-dialog'),
    ).not.toBeInTheDocument();
  });

  it('calls markCompleteAction with selected userId on confirm', async () => {
    vi.mocked(markCompleteAction).mockResolvedValue({
      ok: true,
      data: { id: 'tour-1' } as Parameters<
        typeof MarkCompleteDialog
      >[0]['tournament'] & { status: 'completed' },
    } as Awaited<ReturnType<typeof markCompleteAction>>);

    const onClose = vi.fn();
    renderDialog({ onClose });

    fireEvent.change(screen.getByTestId('winner-select'), {
      target: { value: 'user-2' },
    });
    fireEvent.click(screen.getByTestId('mark-complete-confirm'));

    await waitFor(() => {
      expect(markCompleteAction).toHaveBeenCalledWith({
        tournamentId: 'tour-1',
        winnerUserId: 'user-2',
      });
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error message when action returns not_registered error', async () => {
    vi.mocked(markCompleteAction).mockResolvedValue({
      ok: false,
      error: 'not_registered',
    });

    renderDialog();
    fireEvent.click(screen.getByTestId('mark-complete-confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('mark-complete-error')).toHaveTextContent(
        'Not registered.',
      );
    });
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByTestId('mark-complete-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
