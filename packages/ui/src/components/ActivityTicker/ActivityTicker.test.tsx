import { render as rtlRender, screen, act } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { ActivityTicker } from './ActivityTicker';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

const items = [
  { tag: 'support', who: 'Maria', what: 'answered a ticket', when: '12s ago' },
  { tag: 'release', who: 'v2.41', what: 'shipped to production', when: '4m ago' },
  { tag: 'bug', who: 'Anatoliy', what: 'fixed a thing', when: '11m ago' },
];

describe('ActivityTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first item', () => {
    render(<ActivityTicker items={items} />);
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });

  it('renders the label when provided', () => {
    render(<ActivityTicker items={items} label="HQ live feed" />);
    expect(screen.getByText('HQ live feed')).toBeInTheDocument();
  });

  it('rotates through items on the given interval', () => {
    render(<ActivityTicker items={items} interval={1000} />);
    expect(screen.getByText('Maria')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('v2.41')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Anatoliy')).toBeInTheDocument();
  });

  it('renders nothing when items is empty', () => {
    render(<ActivityTicker items={[]} label="HQ live feed" />);
    expect(screen.queryByText('HQ live feed')).not.toBeInTheDocument();
  });
});
