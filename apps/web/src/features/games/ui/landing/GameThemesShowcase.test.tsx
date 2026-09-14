import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  GameLandingThemeProvider,
  useGameLandingTheme,
} from './GameLandingThemeContext';
import { GameThemesShowcase } from './GameThemesShowcase';

function ActiveThemeDisplay() {
  const { theme } = useGameLandingTheme();
  return <div data-testid="active-theme-display">{theme}</div>;
}

describe('GameThemesShowcase', () => {
  const sampleThemes = [
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'Rugged mountain peaks',
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'High-tech neon streets',
    },
  ];

  it('renders theme cards and shows active theme state', () => {
    render(
      <GameLandingThemeProvider initialTheme="adventure">
        <ActiveThemeDisplay />
        <GameThemesShowcase
          gameId="chess_v1"
          themes={sampleThemes}
          baseHref="/en/games/create?gameId=chess"
        />
      </GameLandingThemeProvider>,
    );

    expect(screen.getByText('Adventure')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk')).toBeInTheDocument();
    expect(screen.getByText('Previewing')).toBeInTheDocument();
    expect(screen.getByTestId('active-theme-display')).toHaveTextContent(
      'adventure',
    );
  });

  it('updates preview theme when a theme card is clicked', () => {
    render(
      <GameLandingThemeProvider initialTheme="adventure">
        <ActiveThemeDisplay />
        <GameThemesShowcase
          gameId="chess_v1"
          themes={sampleThemes}
          baseHref="/en/games/create?gameId=chess"
        />
      </GameLandingThemeProvider>,
    );

    const cyberpunkCard = screen.getByTestId('theme-card-cyberpunk');
    fireEvent.click(cyberpunkCard);

    expect(screen.getByTestId('active-theme-display')).toHaveTextContent(
      'cyberpunk',
    );
  });
});
