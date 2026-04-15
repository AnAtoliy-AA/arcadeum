import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OptionCard } from './OptionCard';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

describe('OptionCard', () => {
  it('renders label and description', () => {
    render(
      <TestWrapper>
        <OptionCard label="Test Label" description="Test Description" />
      </TestWrapper>,
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <TestWrapper>
        <OptionCard label="Click Me" onClick={handleClick} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('Click Me').closest('div')!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    render(
      <TestWrapper>
        <OptionCard
          label="Icon Label"
          icon={<span data-testid="test-icon">✨</span>}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
