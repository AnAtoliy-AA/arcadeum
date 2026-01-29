import { render, screen } from '@testing-library/react';
import { ServerLoadingNotice } from './index';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as useTranslationHook from '@/shared/lib/useTranslation';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ServerLoadingNotice', () => {
  beforeEach(() => {
    vi.spyOn(useTranslationHook, 'useTranslation').mockReturnValue({
      t: (key: string) => key,
    } as unknown as ReturnType<typeof useTranslationHook.useTranslation>);
  });

  it('renders progress and elapsed time', () => {
    renderWithTheme(
      <ServerLoadingNotice pendingProgress={45} pendingElapsedSeconds={10} />,
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('10s')).toBeInTheDocument();
  });

  it('renders translation keys as fallback', () => {
    renderWithTheme(
      <ServerLoadingNotice pendingProgress={0} pendingElapsedSeconds={0} />,
    );

    expect(
      screen.getByText('games.room.pendingNotice.title'),
    ).toBeInTheDocument();
    expect(screen.getByText('common.actions.supportTeam')).toBeInTheDocument();
  });
});
