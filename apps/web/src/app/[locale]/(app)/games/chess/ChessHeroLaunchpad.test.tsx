import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChessHeroLaunchpad } from './ChessHeroLaunchpad';

describe('ChessHeroLaunchpad', () => {
  it('renders mode launchers and status badge', () => {
    render(
      <ChessHeroLaunchpad
        gameId="chess_v1"
        roomsHref="/en/games/rooms?gameId=chess"
        createRoomHref="/en/games/create?gameId=chess"
        dailyPuzzleHref="#puzzles"
      />,
    );

    expect(screen.getByTestId('chess-hero-launchpad')).toBeInTheDocument();
    expect(screen.getByText('Quick Match & Modes')).toBeInTheDocument();
    expect(screen.getByText('Blitz Matchmaking')).toBeInTheDocument();
    expect(screen.getByText('Daily Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Chess960')).toBeInTheDocument();
    expect(screen.getByText('Lobby Browser')).toBeInTheDocument();
  });
});
