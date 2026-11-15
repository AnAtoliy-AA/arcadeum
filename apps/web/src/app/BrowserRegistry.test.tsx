import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import BrowserRegistry from './BrowserRegistry';

const mocks = vi.hoisted(() => ({
  connectSockets: vi.fn(),
  connectSocketsAnonymous: vi.fn(),
  disconnectSockets: vi.fn(),
  getGamesSocket: vi.fn(),
  getOrCreateAnonymousId: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/shared/hooks/useSocketConnection', () => ({
  useSocketConnection: vi.fn(),
}));

vi.mock('@/shared/lib/socket', () => ({
  connectSockets: mocks.connectSockets,
  connectSocketsAnonymous: mocks.connectSocketsAnonymous,
  disconnectSockets: mocks.disconnectSockets,
  getGamesSocket: mocks.getGamesSocket,
}));

vi.mock('@/shared/lib/api-client', () => ({
  getOrCreateAnonymousId: mocks.getOrCreateAnonymousId,
}));

vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: { getState: mocks.getSession },
}));

function givenSession(accessToken: string | null): void {
  mocks.getSession.mockReturnValue({
    hydrated: true,
    snapshot: { accessToken },
    setHydrated: vi.fn(),
    refreshTokens: vi.fn().mockResolvedValue(undefined),
  });
}

function givenGamesSocket(connected: boolean): void {
  mocks.getGamesSocket.mockReturnValue({
    connected,
    io: { _readyState: connected ? 'open' : 'closed' },
  });
}

describe('BrowserRegistry socket lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    givenSession('access-token');
    givenGamesSocket(false);
  });

  it('disconnects sockets on pagehide', () => {
    render(
      <BrowserRegistry>
        <div>child</div>
      </BrowserRegistry>,
    );

    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });

    expect(mocks.disconnectSockets).toHaveBeenCalledTimes(1);
  });

  it('reconnects authenticated sockets when the page is shown again', () => {
    render(
      <BrowserRegistry>
        <div>child</div>
      </BrowserRegistry>,
    );

    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    act(() => {
      window.dispatchEvent(new Event('pageshow'));
    });

    expect(mocks.connectSockets).toHaveBeenCalledWith('access-token');
  });

  it('reconnects anonymous sockets when the page is shown again', async () => {
    givenSession(null);
    mocks.getOrCreateAnonymousId.mockResolvedValue('anon_1');

    render(
      <BrowserRegistry>
        <div>child</div>
      </BrowserRegistry>,
    );

    await act(async () => {
      window.dispatchEvent(new Event('pageshow'));
    });

    expect(mocks.connectSocketsAnonymous).toHaveBeenCalledWith('anon_1');
  });

  it('leaves healthy sockets untouched on visibility change', () => {
    givenGamesSocket(true);

    render(
      <BrowserRegistry>
        <div>child</div>
      </BrowserRegistry>,
    );

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(mocks.connectSockets).not.toHaveBeenCalled();
    expect(mocks.connectSocketsAnonymous).not.toHaveBeenCalled();
    expect(mocks.getOrCreateAnonymousId).not.toHaveBeenCalled();
  });
});
