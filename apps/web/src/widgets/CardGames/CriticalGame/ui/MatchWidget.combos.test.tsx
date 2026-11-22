import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchWidget } from './MatchWidget';
import { makeProps } from './MatchWidget.test-fixtures';
import type { CriticalCard } from '../types';

vi.mock('./arena/Arena', () => ({
  Arena: () => <div data-testid="arena-stub" />,
}));

vi.mock('./opponents/OpponentsRow', () => ({
  OpponentsRow: () => <div data-testid="opponents-row-stub" />,
}));

vi.mock('./hand/HandZone', () => ({
  HandZone: ({
    cards,
    onPlay,
    onToggleSelect,
  }: {
    cards: Array<{ uid: string }>;
    onPlay: () => void;
    onToggleSelect: (uid: string) => void;
  }) => (
    <div data-testid="hand-zone-stub">
      <button
        type="button"
        data-testid="hand-zone-stub-play"
        onClick={onPlay}
      />
      {cards.map((c) => (
        <button
          key={c.uid}
          type="button"
          data-testid={`hand-zone-stub-select-${c.uid}`}
          onClick={() => onToggleSelect(c.uid)}
        />
      ))}
    </div>
  ),
}));

describe('MatchWidget combo routing', () => {
  it('routes pair combos to handleOpenEventCombo', () => {
    const handleOpenEventCombo = vi.fn();
    render(<MatchWidget {...makeProps({ handleOpenEventCombo })} />);
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-0'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-1'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-play'));
    expect(handleOpenEventCombo).toHaveBeenCalledTimes(1);
    expect(handleOpenEventCombo).toHaveBeenCalledWith(
      ['strike', 'strike'],
      ['strike', 'strike', 'evade'],
      'pair',
      null,
    );
  });

  it('routes triple combos to handleOpenEventCombo', () => {
    const handleOpenEventCombo = vi.fn();
    const hand: CriticalCard[] = ['strike', 'strike', 'strike'];
    const currentPlayer = { playerId: 'p1', hand, alive: true };
    render(
      <MatchWidget
        {...makeProps({
          currentPlayer,
          handleOpenEventCombo,
          snapshot: {
            ...makeProps().snapshot,
            players: [currentPlayer],
          },
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-0'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-1'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-2'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-play'));
    expect(handleOpenEventCombo).toHaveBeenCalledTimes(1);
    expect(handleOpenEventCombo).toHaveBeenCalledWith(
      ['strike', 'strike', 'strike'],
      ['strike', 'strike', 'strike'],
      'trio',
      null,
    );
  });

  it('routes fiver combos to handleOpenFiverCombo with selected cards', () => {
    const handleOpenFiverCombo = vi.fn();
    const hand: CriticalCard[] = [
      'strike',
      'evade',
      'trade',
      'reorder',
      'cancel',
    ];
    const currentPlayer = { playerId: 'p1', hand, alive: true };
    render(
      <MatchWidget
        {...makeProps({
          currentPlayer,
          handleOpenFiverCombo,
          snapshot: {
            ...makeProps().snapshot,
            players: [currentPlayer],
          },
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-0'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-evade-1'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-trade-2'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-reorder-3'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-cancel-4'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-play'));
    expect(handleOpenFiverCombo).toHaveBeenCalledTimes(1);
    expect(handleOpenFiverCombo).toHaveBeenCalledWith([
      'strike',
      'evade',
      'trade',
      'reorder',
      'cancel',
    ]);
  });
});
