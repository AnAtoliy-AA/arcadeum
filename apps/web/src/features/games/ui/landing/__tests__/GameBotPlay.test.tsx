import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameBotPlay } from '../GameBotPlay';

vi.mock('@/shared/i18n/useTranslation', async () =>
  (await import('./landingMocks')).translationMock(),
);
vi.mock('@/features/games/ui/QuickplayButton', async () =>
  (await import('./landingMocks')).quickplayButtonMock(),
);

describe('GameBotPlay', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the bot button with the default label and medium level', () => {
    render(<GameBotPlay gameId="chess_v1" />);
    const button = screen.getByTestId('quickplay-ai-button');
    expect(button).toHaveTextContent('playVsBot');
    expect(button).toHaveAttribute('data-difficulty', 'medium');
    expect(screen.getByTestId('game-bot-level')).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(<GameBotPlay gameId="chess_v1" label="Quick Match (AI)" />);
    expect(screen.getByTestId('quickplay-ai-button')).toHaveTextContent(
      'Quick Match (AI)',
    );
  });

  it('restores the stored difficulty', () => {
    window.localStorage.setItem(
      'aicoapp_web_settings_v1',
      JSON.stringify({ aiDifficulty: 'expert' }),
    );
    render(<GameBotPlay gameId="chess_v1" />);
    expect(screen.getByTestId('quickplay-ai-button')).toHaveAttribute(
      'data-difficulty',
      'expert',
    );
  });

  it('disables the button when the game is coming soon', () => {
    render(<GameBotPlay gameId="chess_v1" disabled />);
    expect(screen.getByTestId('quickplay-ai-button')).toBeDisabled();
  });
});
