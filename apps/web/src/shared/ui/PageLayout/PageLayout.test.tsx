import { render, screen } from '@testing-library/react';
import { PageLayout } from './PageLayout';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PageLayout', () => {
  it('renders children correctly', () => {
    renderWithTheme(<PageLayout>Page Content</PageLayout>);
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
