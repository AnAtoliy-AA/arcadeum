import { render, screen } from '@testing-library/react';
import { FormGroup } from './FormGroup';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('FormGroup', () => {
  it('renders label and children', () => {
    renderWithTheme(
      <FormGroup label="Name">
        <input id="test" />
      </FormGroup>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders required asterisk', () => {
    renderWithTheme(
      <FormGroup label="Email" required>
        <input />
      </FormGroup>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message', () => {
    renderWithTheme(
      <FormGroup label="Zip" error="Invalid zip code">
        <input />
      </FormGroup>,
    );
    expect(screen.getByText(/Invalid zip code/i)).toBeInTheDocument();
  });

  it('renders description', () => {
    renderWithTheme(
      <FormGroup label="Pass" description="At least 8 chars">
        <input />
      </FormGroup>,
    );
    expect(screen.getByText('At least 8 chars')).toBeInTheDocument();
  });
});
