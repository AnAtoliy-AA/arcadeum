import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArcadePetGame } from './ArcadePetGame';

describe('ArcadePetGame', () => {
  it('renders initial coins badge and LCD screen', () => {
    render(<ArcadePetGame currentUserId="player-1" />);
    expect(screen.getByTestId('arcade-pet-game-coins')).toHaveTextContent(
      '🪙 10 Coins',
    );
  });

  it('cycles menu to snack and charges 1 coin when button B is pressed after hatching', () => {
    render(<ArcadePetGame currentUserId="player-1" />);

    const btnB = screen.getByTestId('arcade-pet-btn-b');
    fireEvent.click(btnB);

    const btnA = screen.getByTestId('arcade-pet-btn-a');
    fireEvent.click(btnA);

    expect(screen.getByTestId('arcade-pet-game-coins')).toHaveTextContent(
      '🪙 10 Coins',
    );

    fireEvent.click(btnB);

    expect(screen.getByTestId('arcade-pet-game-coins')).toHaveTextContent(
      '🪙 9 Coins',
    );
  });
});
