import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect, vi } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    renderWithTheme(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    renderWithTheme(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('Hello');
  });

  it('renders in disabled state', () => {
    renderWithTheme(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
