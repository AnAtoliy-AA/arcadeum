import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect, vi } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ErrorState', () => {
  it('renders message and title', () => {
    renderWithTheme(<ErrorState message="Request failed" title="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Request failed')).toBeInTheDocument();
  });

  it('calls onRetry when button is clicked', () => {
    const handleRetry = vi.fn();
    renderWithTheme(
      <ErrorState message="Error" onRetry={handleRetry} retryLabel="Refresh" />,
    );

    const button = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
