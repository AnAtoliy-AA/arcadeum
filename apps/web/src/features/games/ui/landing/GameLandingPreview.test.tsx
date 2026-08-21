import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  GameLandingThemeProvider,
  LANDING_THEME_IDS,
  useGameLandingTheme,
} from './GameLandingThemeContext';
import { GameLandingPreview } from './GameLandingPreview';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => (key.startsWith('games.') ? key.split('.').pop() : key),
  }),
}));

function ThemeProbe() {
  const { theme } = useGameLandingTheme();
  return <span data-testid="theme-probe">{theme}</span>;
}

function Harness({ children }: { children: React.ReactNode }) {
  return (
    <GameLandingThemeProvider initialTheme="adventure">
      {children}
    </GameLandingThemeProvider>
  );
}

function CycleProbeButton() {
  const { cycleTheme } = useGameLandingTheme();
  return (
    <button type="button" data-testid="cycle-probe" onClick={cycleTheme}>
      cycle
    </button>
  );
}

describe('GameLandingThemeProvider', () => {
  it('defaults to the first shared theme id', () => {
    render(
      <GameLandingThemeProvider>
        <ThemeProbe />
      </GameLandingThemeProvider>,
    );
    expect(screen.getByTestId('theme-probe')).toHaveTextContent(
      LANDING_THEME_IDS[0] ?? 'adventure',
    );
  });

  it('cycles to the next theme in the catalog', () => {
    const first = LANDING_THEME_IDS[0] ?? 'adventure';
    const second = LANDING_THEME_IDS[1] ?? 'cyberpunk';
    render(
      <Harness>
        <ThemeProbe />
        <CycleProbeButton />
      </Harness>,
    );
    expect(screen.getByTestId('theme-probe')).toHaveTextContent(first);
    fireEvent.click(screen.getByTestId('cycle-probe'));
    expect(screen.getByTestId('theme-probe')).toHaveTextContent(second);
  });

  it('rejects unknown initial themes', () => {
    render(
      <GameLandingThemeProvider initialTheme="not-a-theme">
        <ThemeProbe />
      </GameLandingThemeProvider>,
    );
    expect(screen.getByTestId('theme-probe')).toHaveTextContent(
      LANDING_THEME_IDS[0] ?? 'adventure',
    );
  });
});

describe('GameLandingPreview', () => {
  it('renders the preview art with the current theme id', () => {
    const renderArt = vi.fn((themeId: string) => (
      <div data-testid="art">{themeId}</div>
    ));
    render(
      <Harness>
        <GameLandingPreview render={renderArt} testId="preview" />
      </Harness>,
    );
    expect(renderArt).toHaveBeenCalledWith(LANDING_THEME_IDS[0]);
    expect(screen.getByTestId('art')).toHaveTextContent(LANDING_THEME_IDS[0]);
  });

  it('cycles the theme and re-renders the art on click', () => {
    const renderArt = vi.fn((themeId: string) => (
      <div data-testid="art">{themeId}</div>
    ));
    render(
      <Harness>
        <GameLandingPreview render={renderArt} testId="preview" />
      </Harness>,
    );
    const first = LANDING_THEME_IDS[0] ?? 'adventure';
    const second = LANDING_THEME_IDS[1] ?? 'cyberpunk';
    fireEvent.click(screen.getByTestId('preview'));
    expect(renderArt).toHaveBeenLastCalledWith(second);
    expect(screen.getByTestId('art')).toHaveTextContent(second);
    expect(screen.queryByTestId('art')).not.toHaveTextContent(first);
  });

  it('renders the theme name in the caption and aria label', () => {
    render(
      <Harness>
        <GameLandingPreview
          render={(themeId) => <div data-testid="art">{themeId}</div>}
          cycleHint="Click me"
          cycleAriaLabel="Theme: {{variant}}"
          label="Preview"
          testId="preview"
        />
      </Harness>,
    );
    const first = LANDING_THEME_IDS[0] ?? 'adventure';
    const name =
      first.charAt(0).toUpperCase() + first.slice(1).replace(/-/g, ' ');
    expect(screen.getByTestId('preview')).toHaveAttribute(
      'aria-label',
      `Theme: ${name}`,
    );
    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('updates the aria label after cycling', () => {
    render(
      <Harness>
        <GameLandingPreview
          render={(themeId) => <div data-testid="art">{themeId}</div>}
          cycleAriaLabel="Theme: {{variant}}"
          testId="preview"
        />
      </Harness>,
    );
    fireEvent.click(screen.getByTestId('preview'));
    const second = LANDING_THEME_IDS[1] ?? 'cyberpunk';
    const name =
      second.charAt(0).toUpperCase() + second.slice(1).replace(/-/g, ' ');
    expect(screen.getByTestId('preview')).toHaveAttribute(
      'aria-label',
      `Theme: ${name}`,
    );
  });

  it('follows the context theme when changed externally (no stuck initial theme)', () => {
    const first = LANDING_THEME_IDS[0] ?? 'adventure';
    const second = LANDING_THEME_IDS[1] ?? 'cyberpunk';
    const renderArt = vi.fn((themeId: string) => (
      <div data-testid="art">{themeId}</div>
    ));
    render(
      <GameLandingThemeProvider initialTheme={first}>
        <GameLandingPreview render={renderArt} testId="preview" />
        <CycleProbeButton />
      </GameLandingThemeProvider>,
    );
    expect(renderArt).toHaveBeenLastCalledWith(first);
    fireEvent.click(screen.getByTestId('cycle-probe'));
    expect(renderArt).toHaveBeenLastCalledWith(second);
    expect(screen.getByTestId('art')).toHaveTextContent(second);
  });

  it('uses the provided label overrides over i18n keys', () => {
    render(
      <Harness>
        <GameLandingPreview
          render={(themeId) => <div data-testid="art">{themeId}</div>}
          label="Custom label"
          cycleHint="Custom hint"
          testId="preview"
        />
      </Harness>,
    );
    expect(screen.getByText('Custom label')).toBeInTheDocument();
    expect(screen.getByText('Custom hint')).toBeInTheDocument();
  });
});
