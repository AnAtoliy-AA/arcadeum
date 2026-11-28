import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickPlayPanel } from './QuickPlayPanel';

const STRINGS: Record<string, string> = {
  'games.chess_v1.lobby.noClock': 'No clock',
  'games.chess_v1.lobby.unlimited': 'Unlimited',
  'games.chess_v1.lobby.timeControl': 'Time control',
};
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => STRINGS[key] ?? key }),
}));

describe('QuickPlayPanel', () => {
  it('renders all time control cards including classical and no clock', () => {
    render(<QuickPlayPanel onSelectTimeControl={vi.fn()} />);
    expect(screen.getByText('1+0')).toBeDefined();
    expect(screen.getByText('3+0')).toBeDefined();
    expect(screen.getByText('3+2')).toBeDefined();
    expect(screen.getByText('5+0')).toBeDefined();
    expect(screen.getByText('10+0')).toBeDefined();
    expect(screen.getByText('15+10')).toBeDefined();
    expect(screen.getByText('30+0')).toBeDefined();
    expect(screen.getByText('No clock')).toBeDefined();
  });

  it('renders human-readable duration subtitles', () => {
    render(<QuickPlayPanel onSelectTimeControl={vi.fn()} />);
    expect(screen.getByText('1 min')).toBeDefined();
    expect(screen.getByText('3 min')).toBeDefined();
    expect(screen.getByText('3m + 2s')).toBeDefined();
    expect(screen.getByText('5 min')).toBeDefined();
    expect(screen.getByText('10 min')).toBeDefined();
    expect(screen.getByText('15m + 10s')).toBeDefined();
    expect(screen.getByText('30 min')).toBeDefined();
    expect(screen.getByText('Unlimited')).toBeDefined();
  });

  it('calls onSelectTimeControl with correct time control when 3+0 is clicked', () => {
    const onSelect = vi.fn();
    render(<QuickPlayPanel onSelectTimeControl={onSelect} />);
    fireEvent.click(screen.getByText('3+0').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'blitz',
        initialSeconds: 180,
        incrementSeconds: 0,
      }),
    );
  });

  it('calls onSelectTimeControl with increment 2 for 3+2', () => {
    const onSelect = vi.fn();
    render(<QuickPlayPanel onSelectTimeControl={onSelect} />);
    fireEvent.click(screen.getByText('3+2').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'blitz',
        initialSeconds: 180,
        incrementSeconds: 2,
      }),
    );
  });

  it('calls onSelectTimeControl with bullet for 1+0', () => {
    const onSelect = vi.fn();
    render(<QuickPlayPanel onSelectTimeControl={onSelect} />);
    fireEvent.click(screen.getByText('1+0').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'bullet', initialSeconds: 60 }),
    );
  });

  it('calls onSelectTimeControl with null when No clock is clicked', () => {
    const onSelect = vi.fn();
    render(<QuickPlayPanel onSelectTimeControl={onSelect} />);
    fireEvent.click(screen.getByText('No clock').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('displays visible checkmark on the selected card', () => {
    const { rerender } = render(
      <QuickPlayPanel
        selectedTimeControl={{
          type: 'blitz',
          initialSeconds: 180,
          incrementSeconds: 2,
        }}
        onSelectTimeControl={vi.fn()}
      />,
    );
    const card32 = screen.getByText('3+2').closest('button')!;
    expect(card32.getAttribute('data-active')).toBe('true');
    expect(card32.getAttribute('aria-pressed')).toBe('true');
    expect(
      card32.querySelector('[data-testid="selected-indicator"]'),
    ).not.toBeNull();

    rerender(
      <QuickPlayPanel
        selectedTimeControl={null}
        onSelectTimeControl={vi.fn()}
      />,
    );
    const noClockCard = screen.getByText('No clock').closest('button')!;
    expect(noClockCard.getAttribute('data-active')).toBe('true');
    expect(
      noClockCard.querySelector('[data-testid="selected-indicator"]'),
    ).not.toBeNull();
  });

  it('does not call onSelectTimeControl when disabled', () => {
    const onSelect = vi.fn();
    render(<QuickPlayPanel onSelectTimeControl={onSelect} disabled />);
    const button = screen.getByText('1+0').closest('button')!;
    expect(button).toHaveProperty('disabled', true);
  });

  it('renders category badges for each time control type', () => {
    render(<QuickPlayPanel onSelectTimeControl={vi.fn()} />);
    expect(screen.getByText('Bullet')).toBeDefined();
    expect(screen.getByText('Classical')).toBeDefined();
    expect(screen.getAllByText('Rapid').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Blitz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Casual')).toBeDefined();
  });
});
