import { render, screen, fireEvent } from '@testing-library/react';
import { TextArea } from './TextArea';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect, vi } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('TextArea', () => {
  it('renders correctly with placeholder', () => {
    renderWithTheme(<TextArea placeholder="Write here" />);
    expect(screen.getByPlaceholderText('Write here')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    renderWithTheme(<TextArea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Text' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue('Text');
  });

  it('renders in disabled state', () => {
    renderWithTheme(<TextArea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
