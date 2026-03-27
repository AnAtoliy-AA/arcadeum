import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHeaderAuth } from './useHeaderAuth';

// vi.mock is hoisted before imports by Vitest, so useSessionTokens is fully
// intercepted before any module-level store code runs. The cast below is safe
// because only `snapshot` is accessed in useHeaderAuth — the rest of the return
// value (clearTokens, setTokens, etc.) is never touched by the hook under test.
vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: vi.fn(),
}));

import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
const mockUseSessionTokens = vi.mocked(useSessionTokens);

describe('useHeaderAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isAuthenticated=false and displayName=undefined when no access token', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: { accessToken: null, displayName: null, username: null, email: null },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.isAuthenticated).toBe(false);
    // Note: the original code returned `null` here (null || null || null === null).
    // The hook normalises this to `undefined` to match the declared return type.
    // Both are falsy; consumers use `displayName && ...` so behavior is identical.
    expect(result.current.displayName).toBeUndefined();
  });

  it('returns isAuthenticated=true when access token present', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: { accessToken: 'tok', displayName: null, username: null, email: null },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('prefers displayName over username over email', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: 'tok',
        displayName: 'Alice',
        username: 'alice99',
        email: 'a@b.com',
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.displayName).toBe('Alice');
  });

  it('falls back to username when no displayName', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: 'tok',
        displayName: null,
        username: 'alice99',
        email: 'a@b.com',
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.displayName).toBe('alice99');
  });

  it('falls back to email when no displayName or username', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: 'tok',
        displayName: null,
        username: null,
        email: 'a@b.com',
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.displayName).toBe('a@b.com');
  });
});
