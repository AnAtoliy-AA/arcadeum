import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameFinalCta } from '../GameFinalCta';
import { GameLandingThemeProvider } from '../GameLandingThemeContext';

vi.mock('@/shared/i18n/useTranslation', async () =>
  (await import('./landingMocks')).translationMock(),
);
vi.mock('@/features/games/ui/QuickplayButton', async () =>
  (await import('./landingMocks')).quickplayButtonMock(),
);
vi.mock('@/features/games/api', async () =>
  (await import('./landingMocks')).gamesApiMock(),
);

function renderCta(comingSoon = false) {
  return render(
    <GameLandingThemeProvider>
      <GameFinalCta
        gameId="chess_v1"
        title="Ready?"
        roomsHref="/rooms"
        gamesHref="/games"
        comingSoon={comingSoon}
      />
    </GameLandingThemeProvider>,
  );
}

describe('GameFinalCta', () => {
  it('repeats only the primary action and bot play', () => {
    renderCta();
    expect(screen.getByTestId('quickplay-human-button')).toHaveTextContent(
      'playNow',
    );
    expect(screen.getByTestId('quickplay-ai-button')).toBeInTheDocument();
    expect(screen.queryByText('browseRooms')).not.toBeInTheDocument();
    expect(screen.queryByText('watchAi')).not.toBeInTheDocument();
  });

  it('links back to all games', () => {
    renderCta();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/games');
  });

  it('disables play actions when coming soon', () => {
    renderCta(true);
    expect(screen.getByTestId('quickplay-human-button')).toBeDisabled();
    expect(screen.getByTestId('quickplay-ai-button')).toBeDisabled();
  });
});
