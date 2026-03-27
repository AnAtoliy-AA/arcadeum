import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMobileMenu } from './useMobileMenu';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/games'),
}));

// Mock useClickOutside — tested in isolation in its own test file
vi.mock('./useClickOutside', () => ({
  useClickOutside: vi.fn(),
}));

import { usePathname } from 'next/navigation';
const mockUsePathname = vi.mocked(usePathname);

describe('useMobileMenu', () => {
  beforeEach(() => {
    // Reset to a stable pathname before each test to prevent cross-test
    // contamination from the pathname-change effect firing unexpectedly.
    mockUsePathname.mockReturnValue('/games');
  });

  it('starts closed', () => {
    const { result } = renderHook(() => useMobileMenu());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle opens the menu', () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
  });

  it('toggle closes the menu when already open', () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('closes the menu when pathname changes', () => {
    const { result, rerender } = renderHook(() => useMobileMenu());

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    mockUsePathname.mockReturnValue('/stats');
    rerender();

    expect(result.current.isOpen).toBe(false);
  });
});
