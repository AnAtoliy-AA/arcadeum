import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRef } from 'react';
import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  let node: HTMLDivElement;

  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(() => {
    node.parentNode?.removeChild(node);
  });

  function setup() {
    const ref = createRef<HTMLDivElement>();
    // jsdom refs are plain objects; assign current manually
    (ref as { current: HTMLDivElement }).current = node;
    return renderHook(() => useFullscreen(ref));
  }

  it('toggles the is-fullscreen class on and off', () => {
    const { result } = setup();

    expect(node.classList.contains('is-fullscreen')).toBe(false);

    act(() => result.current.toggleFullscreen());
    expect(result.current.isFullscreen).toBe(true);
    expect(node.classList.contains('is-fullscreen')).toBe(true);

    act(() => result.current.toggleFullscreen());
    expect(result.current.isFullscreen).toBe(false);
    expect(node.classList.contains('is-fullscreen')).toBe(false);
  });

  it('exitFullscreen removes the class when in fullscreen', () => {
    const { result } = setup();

    act(() => result.current.toggleFullscreen());
    expect(result.current.isFullscreen).toBe(true);

    act(() => result.current.exitFullscreen());
    expect(result.current.isFullscreen).toBe(false);
    expect(node.classList.contains('is-fullscreen')).toBe(false);
  });

  it('exitFullscreen is idempotent when already exited', () => {
    const { result } = setup();

    expect(result.current.isFullscreen).toBe(false);
    act(() => result.current.exitFullscreen());
    expect(result.current.isFullscreen).toBe(false);
    expect(node.classList.contains('is-fullscreen')).toBe(false);
  });

  it('keeps a stable exitFullscreen identity across renders', () => {
    const { result, rerender } = setup();
    const first = result.current.exitFullscreen;
    rerender();
    expect(result.current.exitFullscreen).toBe(first);
  });
});
