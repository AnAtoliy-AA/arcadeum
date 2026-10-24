import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveGuideBoard } from '../ui/InteractiveGuideBoard';

describe('InteractiveGuideBoard', () => {
  const defaultProps = {
    id: 'test-challenge',
    title: 'Spot the Fork',
    prompt: 'Play as X to win.',
    gameId: 'tic-tac-toe' as const,
    board: ['X', '', '', '', 'O', '', '', '', 'X'],
    solutionIndex: 2,
    explanation: 'Playing square 3 forks O and forces a win!',
    playHref: '/games/tic-tac-toe',
  };

  it('renders title, prompt, and clickable cells', () => {
    render(<InteractiveGuideBoard {...defaultProps} />);

    expect(screen.getByText('Spot the Fork')).toBeInTheDocument();
    expect(screen.getByText('Play as X to win.')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^puzzle-cell-/)).toHaveLength(9);
  });

  it('handles wrong move with feedback and reset', () => {
    render(<InteractiveGuideBoard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('puzzle-cell-1'));

    expect(screen.getByTestId('puzzle-feedback-incorrect')).toBeInTheDocument();
    expect(
      screen.getByText('Not quite! That leaves an opening.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));
    expect(
      screen.queryByTestId('puzzle-feedback-incorrect'),
    ).not.toBeInTheDocument();
  });

  it('handles correct move with celebratory feedback and explanation', () => {
    render(<InteractiveGuideBoard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('puzzle-cell-2'));

    expect(screen.getByTestId('puzzle-feedback-correct')).toBeInTheDocument();
    expect(
      screen.getByText('Playing square 3 forks O and forces a win!'),
    ).toBeInTheDocument();
    expect(screen.getByText('Play Full Game Now')).toBeInTheDocument();
    expect(screen.getByTestId('puzzle-cell-2')).toHaveTextContent('X');
  });

  it('renders multi-row grid and coordinates for chess drills', () => {
    render(
      <InteractiveGuideBoard
        id="chess-drill-test"
        title="Scholar's Mate Defense"
        prompt="Find the defensive knight move."
        gameId="chess"
        grid={[
          'r.bqk.nr',
          'pppp.ppp',
          '..n.....',
          '..B.p...',
          '....P...',
          '.....Q..',
          'PPPP.PPP',
          'RNB.K.NR',
        ]}
        solutionIndex={18}
        solutionValue="N"
        explanation="Nf6 develops and attacks the queen while guarding f7!"
        playHref="/games/chess"
      />,
    );

    expect(screen.getByText("Scholar's Mate Defense")).toBeInTheDocument();
    expect(screen.getAllByTestId(/^puzzle-cell-/)).toHaveLength(64);

    fireEvent.click(screen.getByTestId('puzzle-cell-18'));
    expect(screen.getByTestId('puzzle-feedback-correct')).toBeInTheDocument();
    expect(
      screen.getByText('Nf6 develops and attacks the queen while guarding f7!'),
    ).toBeInTheDocument();
  });

  it('supports localized Russian labels and feedback', () => {
    render(
      <InteractiveGuideBoard
        {...defaultProps}
        locale="ru"
        title="Найдите вилку"
        prompt="Сыграйте за X для победы."
        explanation="Ход в правый угол создает двойную угрозу!"
      />,
    );

    expect(screen.getByText('Интерактивная задача')).toBeInTheDocument();
    expect(screen.getByText('Найдите вилку')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('puzzle-cell-1'));
    expect(screen.getByTestId('puzzle-feedback-incorrect')).toBeInTheDocument();
    expect(
      screen.getByText('Не совсем! Это оставляет уязвимость.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Изучите угрозы на поле и попробуйте снова.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Попробовать снова'));
    expect(
      screen.queryByTestId('puzzle-feedback-incorrect'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('puzzle-cell-2'));
    expect(screen.getByTestId('puzzle-feedback-correct')).toBeInTheDocument();
    expect(screen.getByText('Верный ход!')).toBeInTheDocument();
    expect(
      screen.getByText('Ход в правый угол создает двойную угрозу!'),
    ).toBeInTheDocument();
    expect(screen.getByText('Играть сейчас')).toBeInTheDocument();
  });
});
