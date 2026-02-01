import { render, screen } from '@testing-library/react';
import {
  ProgressCircle,
  ProgressBar,
  WinRateBadge,
  getProgressColor,
  PROGRESS_COLORS,
} from './Progress';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Progress components', () => {
  describe('getProgressColor', () => {
    it('returns correct colors based on value', () => {
      expect(getProgressColor(80)).toBe(PROGRESS_COLORS.success);
      expect(getProgressColor(50)).toBe(PROGRESS_COLORS.warning);
      expect(getProgressColor(20)).toBe(PROGRESS_COLORS.danger);
    });
  });

  describe('ProgressCircle', () => {
    it('renders with correct value', () => {
      renderWithTheme(<ProgressCircle value={75} />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('clips value between 0 and 100', () => {
      renderWithTheme(<ProgressCircle value={150} />);
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('ProgressBar', () => {
    it('renders with label when height is sufficient', () => {
      renderWithTheme(<ProgressBar value={60} height={20} showLabel={true} />);
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('renders with inline label', () => {
      renderWithTheme(<ProgressBar value={42.5} showInlineLabel={true} />);
      expect(screen.getByText('42.5%')).toBeInTheDocument();
    });
  });

  describe('WinRateBadge', () => {
    it('calculates win rate correctly', () => {
      renderWithTheme(<WinRateBadge wins={10} losses={10} />);
      // 50% win rate
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Wins')).toBeInTheDocument();
      expect(screen.getByText('Losses')).toBeInTheDocument();
    });
  });
});
