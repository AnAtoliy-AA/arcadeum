import { render } from '@testing-library/react';
import { Divider } from './Divider';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Divider', () => {
  it('renders correctly', () => {
    const { container } = renderWithTheme(<Divider />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });
});
