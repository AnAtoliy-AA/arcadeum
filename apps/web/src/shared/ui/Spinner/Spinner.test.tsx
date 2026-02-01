import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Spinner', () => {
  it('renders correctly with default props', () => {
    renderWithTheme(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { unmount } = renderWithTheme(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    unmount();

    renderWithTheme(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
