import { render, screen } from '@testing-library/react';
import { Section } from './Section';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Section', () => {
  it('renders title, description and children', () => {
    renderWithTheme(
      <Section title="Section Title" description="Section description">
        <div>Content</div>
      </Section>,
    );
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
