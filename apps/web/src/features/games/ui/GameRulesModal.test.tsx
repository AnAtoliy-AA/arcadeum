import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameRulesModal } from './GameRulesModal';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('GameRulesModal', () => {
  const rules = [
    { title: 'Objective', body: 'Win the game by capturing territory.' },
    { title: 'Scoring', body: 'Count points at the end.' },
  ];

  it('renders nothing when closed', () => {
    render(
      <GameRulesModal
        open={false}
        onClose={() => {}}
        title="Go Rules"
        rules={rules}
      />,
    );
    expect(screen.queryByTestId('game-rules-modal')).not.toBeInTheDocument();
  });

  it('renders title, close button, rule items, and footer button when open', () => {
    const onClose = vi.fn();
    render(
      <GameRulesModal
        open={true}
        onClose={onClose}
        title="Go Rules"
        subtitle="Standard Japanese Rules"
        rules={rules}
      />,
    );

    expect(screen.getByTestId('game-rules-modal')).toBeInTheDocument();
    expect(screen.getByText('Go Rules')).toBeInTheDocument();
    expect(screen.getByText('Standard Japanese Rules')).toBeInTheDocument();
    expect(screen.getByText('Objective')).toBeInTheDocument();
    expect(
      screen.getByText('Win the game by capturing territory.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Scoring')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('modal-close-button');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const gotItBtn = screen.getByTestId('rules-modal-got-it-button');
    expect(gotItBtn).toBeInTheDocument();
    fireEvent.click(gotItBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
