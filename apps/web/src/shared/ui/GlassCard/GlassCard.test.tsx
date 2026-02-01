import { render, screen } from '@testing-library/react';
import { GlassCard } from './GlassCard';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('GlassCard', () => {
  it('renders children correctly', () => {
    renderWithTheme(<GlassCard>Glass Content</GlassCard>);
    expect(screen.getByText('Glass Content')).toBeInTheDocument();
  });
});
