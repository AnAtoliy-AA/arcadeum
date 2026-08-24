import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TutorialOverlay } from './TutorialOverlay';
import { useTutorialStore } from '../store/tutorialStore';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function renderOverlay(
  props: Partial<React.ComponentProps<typeof TutorialOverlay>> = {},
) {
  const onClose = vi.fn();
  render(
    <TutorialOverlay gameId="chess_v1" open onClose={onClose} {...props} />,
  );
  return onClose;
}

describe('TutorialOverlay', () => {
  it('renders nothing when closed or for unsupported games', () => {
    const { container: closedContainer } = render(
      <TutorialOverlay gameId="chess_v1" open={false} onClose={() => {}} />,
    );
    expect(closedContainer).toBeEmptyDOMElement();

    const { container: unknownGame } = render(
      <TutorialOverlay gameId="mystery_v1" open onClose={() => {}} />,
    );
    expect(unknownGame).toBeEmptyDOMElement();
  });

  it('shows the first step with progress and navigation buttons', () => {
    renderOverlay();
    expect(screen.getByTestId('tutorial-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('tutorial-step-title')).toHaveTextContent(
      'games.chess_v1.tutorial.s1.title',
    );
    // Back is hidden on the first step.
    expect(
      screen.queryByTestId('tutorial-back-button'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('tutorial-next-button')).toBeInTheDocument();
  });

  it('advances forward and back through steps', () => {
    renderOverlay();
    fireEvent.click(screen.getByTestId('tutorial-next-button'));
    expect(screen.getByTestId('tutorial-step-title')).toHaveTextContent(
      'games.chess_v1.tutorial.s2.title',
    );
    fireEvent.click(screen.getByTestId('tutorial-back-button'));
    expect(screen.getByTestId('tutorial-step-title')).toHaveTextContent(
      'games.chess_v1.tutorial.s1.title',
    );
  });

  it('reaches the completion card and marks the game completed on finish', async () => {
    useTutorialStore.setState({ completedAt: {}, dismissedAt: {} });
    const onClose = renderOverlay();

    // Walk all four chess steps.
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByTestId('tutorial-next-button'));
    }
    expect(screen.getByTestId('tutorial-complete-title')).toHaveTextContent(
      'games.tutorial.ui.completeTitle',
    );

    fireEvent.click(screen.getByTestId('tutorial-finish-button'));
    await waitFor(() => {
      expect(useTutorialStore.getState().isCompleted('chess_v1')).toBe(true);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('skip marks the tutorial as dismissed (seen, not completed)', async () => {
    useTutorialStore.setState({ completedAt: {}, dismissedAt: {} });
    const onClose = renderOverlay();
    fireEvent.click(screen.getByTestId('tutorial-skip-button'));
    await waitFor(() => {
      expect(useTutorialStore.getState().hasSeenTutorial('chess_v1')).toBe(
        true,
      );
    });
    expect(useTutorialStore.getState().isCompleted('chess_v1')).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape dismisses without completing', () => {
    useTutorialStore.setState({ completedAt: {}, dismissedAt: {} });
    const onClose = renderOverlay();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useTutorialStore.getState().isCompleted('chess_v1')).toBe(false);
  });

  it('arrow keys navigate between steps', () => {
    renderOverlay();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByTestId('tutorial-step-title')).toHaveTextContent(
      'games.chess_v1.tutorial.s2.title',
    );
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByTestId('tutorial-step-title')).toHaveTextContent(
      'games.chess_v1.tutorial.s1.title',
    );
  });

  it('Escape on the completion card counts as completed', async () => {
    useTutorialStore.setState({ completedAt: {}, dismissedAt: {} });
    const onClose = renderOverlay();

    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByTestId('tutorial-next-button'));
    }
    expect(screen.getByTestId('tutorial-complete-title')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(useTutorialStore.getState().isCompleted('chess_v1')).toBe(true);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog on open and restores it on close', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(
      <TutorialOverlay gameId="chess_v1" open onClose={() => {}} />,
    );
    expect(document.activeElement).toBe(screen.getByTestId('tutorial-card'));

    unmount();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });
});
