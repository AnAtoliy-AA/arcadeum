import { render as rtlRender, screen, act } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import config from '../../tamagui.config';
import { CountdownClock } from './CountdownClock';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('CountdownClock', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T00:00:00Z'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders D/H/M/S boxes for full variant', () => {
    // 25h2m3s remaining → D=01, H=01, M=02, S=03
    render(<CountdownClock targetIso="2026-05-02T01:02:03Z" />);
    expect(screen.getAllByText('01').length).toBe(2);
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('fires onComplete at zero', () => {
    const cb = vi.fn();
    render(<CountdownClock targetIso="2026-05-01T00:00:01Z" onComplete={cb} />);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(cb).toHaveBeenCalled();
  });
});
