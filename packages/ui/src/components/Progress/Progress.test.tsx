import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { ProgressBar, ProgressCircle, WinRateBadge } from './Progress';
import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('Progress components', () => {
  describe('ProgressCircle', () => {
    it('renders with correct value', () => {
      render(<ProgressCircle value={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders with custom size', () => {
      render(<ProgressCircle value={50} size={100} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('ProgressBar', () => {
    it('renders accurately', () => {
      render(<ProgressBar value={60} showLabel={true} />);
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  describe('WinRateBadge', () => {
    it('calculates win rate correctly', () => {
      render(<WinRateBadge wins={10} losses={10} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('Wins: 10')).toBeInTheDocument();
      expect(screen.getByText('Losses: 10')).toBeInTheDocument();
    });
  });
});
