import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('EmptyState', () => {
  it('renders message correctly', () => {
    renderWithTheme(<EmptyState message="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders icon and action content', () => {
    renderWithTheme(
      <EmptyState
        message="Message"
        icon={<span data-testid="icon">🔍</span>}
        action={<button>Retry</button>}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
