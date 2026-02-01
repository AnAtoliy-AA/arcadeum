import { render, screen } from '@testing-library/react';
import { LoadingState } from './LoadingState';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('LoadingState', () => {
  it('renders with default message', () => {
    renderWithTheme(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    renderWithTheme(<LoadingState message="Fetching games..." />);
    expect(screen.getByText('Fetching games...')).toBeInTheDocument();
  });
});
