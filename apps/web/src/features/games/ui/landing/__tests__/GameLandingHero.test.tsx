import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameLandingHero } from '../GameLandingHero';
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
vi.mock('../GameLandingLiveStats', () => ({
  GameLandingLiveStats: () => <div data-testid="live-stats" />,
}));
vi.mock('../GameInviteModal', () => ({
  GameInviteModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="invite-modal" /> : null,
}));
vi.mock('@/features/games/ui/AIvsAIViewer', () => ({
  AIvsAIViewer: () => <div data-testid="ai-viewer" />,
}));

function renderHero(
  props: Partial<React.ComponentProps<typeof GameLandingHero>> = {},
) {
  return render(
    <GameLandingThemeProvider>
      <GameLandingHero
        gameId="chess_v1"
        title="Chess Online"
        roomsHref="/rooms"
        createRoomHref="/games/create"
        playersBadge="2 players"
        durationBadge="10 min"
        difficultyBadge="Medium"
        directAnswer="Checkmate the king."
        {...props}
      />
    </GameLandingThemeProvider>,
  );
}

describe('GameLandingHero', () => {
  it('has one primary action, bot play and create room', () => {
    renderHero();
    expect(screen.getByTestId('quickplay-human-button')).toHaveTextContent(
      'playNow',
    );
    expect(screen.getByTestId('quickplay-ai-button')).toHaveTextContent(
      'playVsBot',
    );
    expect(screen.getByRole('link', { name: 'createRoom' })).toHaveAttribute(
      'href',
      expect.stringContaining('/games/create?theme='),
    );
  });

  it('shows browse, invite and watch AI as tertiary links', () => {
    renderHero();
    expect(screen.getByRole('link', { name: 'browseRooms' })).toHaveAttribute(
      'href',
      '/rooms',
    );
    expect(screen.getByRole('button', { name: 'invite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'watchAi' })).toBeInTheDocument();
  });

  it('omits watch AI for games without AI vs AI', () => {
    renderHero({ gameId: 'texas_holdem_v1' });
    expect(
      screen.queryByRole('button', { name: 'watchAi' }),
    ).not.toBeInTheDocument();
  });

  it('toggles the AI battle viewer', async () => {
    renderHero();
    fireEvent.click(screen.getByRole('button', { name: 'watchAi' }));
    expect(await screen.findByTestId('ai-viewer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'closeAi' }));
    expect(screen.queryByTestId('ai-viewer')).not.toBeInTheDocument();
  });

  it('opens the invite modal', () => {
    renderHero();
    fireEvent.click(screen.getByRole('button', { name: 'invite' }));
    expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
  });

  it('renders facts as a labelled stat row', () => {
    renderHero();
    const facts = screen.getByTestId('game-hero-facts');
    expect(facts).toHaveTextContent('2 players');
    expect(facts).toHaveTextContent('10 min');
    expect(facts).toHaveTextContent('Medium');
  });

  it('uses the translated overview heading', () => {
    renderHero();
    expect(screen.getByText('overview')).toBeInTheDocument();
    expect(screen.queryByText('Quick Overview')).not.toBeInTheDocument();
  });

  it('disables play actions when coming soon', () => {
    renderHero({ comingSoon: true });
    expect(screen.getByTestId('quickplay-human-button')).toBeDisabled();
    expect(screen.getByTestId('quickplay-ai-button')).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'watchAi' }),
    ).not.toBeInTheDocument();
  });
});
