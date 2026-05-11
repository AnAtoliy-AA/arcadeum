import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlashBanner } from './FlashBanner';
import type { CriticalLogEntry } from '../types';

const identityFormat = (m?: string | null) => m ?? '';

describe('FlashBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeLog(
    id: string,
    type: CriticalLogEntry['type'],
    message: string,
  ): CriticalLogEntry {
    return { id, type, message, createdAt: new Date().toISOString() };
  }

  it('does not render when there are no logs', () => {
    render(<FlashBanner logs={[]} formatMessage={identityFormat} />);
    expect(screen.queryByTestId('flash-banner')).not.toBeInTheDocument();
  });

  it('renders the latest action log and dismisses after the duration', () => {
    const logs = [makeLog('a', 'action', 'Player A played strike')];
    render(
      <FlashBanner
        logs={logs}
        formatMessage={identityFormat}
        durationMs={500}
      />,
    );
    expect(screen.getByTestId('flash-banner')).toHaveTextContent(
      'Player A played strike',
    );
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByTestId('flash-banner')).not.toBeInTheDocument();
  });

  it('classifies eliminated messages as the eliminated kind', () => {
    const logs = [makeLog('a', 'action', 'Player A was eliminated')];
    render(<FlashBanner logs={logs} formatMessage={identityFormat} />);
    expect(screen.getByTestId('flash-banner')).toHaveAttribute(
      'data-kind',
      'eliminated',
    );
  });

  it('classifies defuse messages as the defuse kind', () => {
    const logs = [makeLog('a', 'action', 'Player defused the bomb')];
    render(<FlashBanner logs={logs} formatMessage={identityFormat} />);
    expect(screen.getByTestId('flash-banner')).toHaveAttribute(
      'data-kind',
      'defuse',
    );
  });

  it('skips chat messages and only surfaces action/system entries', () => {
    const logs = [makeLog('chat-1', 'message', 'hello')];
    render(<FlashBanner logs={logs} formatMessage={identityFormat} />);
    expect(screen.queryByTestId('flash-banner')).not.toBeInTheDocument();
  });
});
