'use client';

import { useEffect } from 'react';
import { useGlimwormStore } from '../store/glimwormStore';

interface UseGlimwormControlsOptions {
  /** The DOM element containing the pixi canvas (null while unmounted). */
  canvasEl: HTMLDivElement | null;
  /** Returns the self-worm's head position in CSS pixels relative to the
   *  canvas root, or null if no head is currently rendered. */
  getHeadScreenPos: () => { x: number; y: number } | null;
}

/**
 * Capture mouse + touch input and write the resulting steering angle into the
 * Glimworm Zustand store. The angle is computed from the worm head toward the
 * cursor/finger so the worm chases the pointer (slither.io style).
 *
 * Spacebar (desktop) and a synthetic `usePowerup` flag (set by the HUD button
 * on mobile) flip the inventory power-up; the socket hook clears the flag
 * after one emit.
 */
export function useGlimwormControls(opts: UseGlimwormControlsOptions): void {
  const { canvasEl, getHeadScreenPos } = opts;

  useEffect(() => {
    const root = canvasEl;
    if (!root) return;

    let cursorX = 0;
    let cursorY = 0;
    let active = false;

    const updateAngle = () => {
      const head = getHeadScreenPos();
      if (!head) return;
      const angle = Math.atan2(cursorY - head.y, cursorX - head.x);
      const { localInput, setInput } = useGlimwormStore.getState();
      if (localInput.angle !== angle) {
        setInput({ angle, usePowerup: localInput.usePowerup });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
      active = true;
      updateAngle();
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = root.getBoundingClientRect();
      cursorX = t.clientX - rect.left;
      cursorY = t.clientY - rect.top;
      active = true;
      updateAngle();
    };

    const onTouchStart = onTouchMove;
    const onTouchEnd = () => {
      active = false;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const { localInput, setInput } = useGlimwormStore.getState();
        setInput({ angle: localInput.angle, usePowerup: true });
      }
    };

    root.addEventListener('mousemove', onMouseMove);
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: true });
    root.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKey);

    let raf = 0;
    const tick = () => {
      if (active) updateAngle();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      root.removeEventListener('mousemove', onMouseMove);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, [canvasEl, getHeadScreenPos]);
}
