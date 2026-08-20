import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlashBanner } from './FlashBanner';
import type { CriticalLogEntry, CriticalLogKind } from '../types';

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
    kind?: CriticalLogKind,
  ): CriticalLogEntry {
    return { id, type, message, kind, createdAt: new Date().toISOString() };
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

  it('prefers entry.kind over string matching when the structured field is present', () => {
    // The message text suggests "info", but the structured kind tags it as
    // a critical-draw event. Once servers emit kind, the UI should classify
    // on that rather than on free-form message phrasing.
    const logs = [
      makeLog('a', 'action', 'something innocuous happened', 'critical'),
    ];
    render(<FlashBanner logs={logs} formatMessage={identityFormat} />);
    expect(screen.getByTestId('flash-banner')).toHaveAttribute(
      'data-kind',
      'danger',
    );
  });

  it('sets a title attribute carrying the full message for ellipsized banners', () => {
    const longMessage =
      'Player A played a really long Critical card combo that will not fit on a single line at 360px max-width';
    const logs = [makeLog('a', 'action', longMessage)];
    render(<FlashBanner logs={logs} formatMessage={identityFormat} />);
    expect(screen.getByTestId('flash-banner')).toHaveAttribute(
      'title',
      longMessage,
    );
  });
});
