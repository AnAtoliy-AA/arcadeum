import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useClickOutside } from './useClickOutside';

function fireClick(target: Element) {
  target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('useClickOutside', () => {
  let onClose: () => void;
  // Track appended elements so afterEach can clean up even if a test throws
  const appended: Element[] = [];

  function append<T extends Element>(el: T): T {
    document.body.appendChild(el);
    appended.push(el);
    return el;
  }

  beforeEach(() => {
    onClose = vi.fn();
  });

  afterEach(() => {
    appended.splice(0).forEach((el) => el.parentNode?.removeChild(el));
  });

  it('does not attach a listener when enabled=false', () => {
    const outside = append(document.createElement('div'));
    renderHook(() => useClickOutside(onClose, false));
    fireClick(outside);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking outside the menu and button', () => {
    const outside = append(document.createElement('div'));
    renderHook(() => useClickOutside(onClose, true));
    fireClick(outside);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when clicking inside [data-mobile-menu]', () => {
    const menu = append(document.createElement('div'));
    menu.setAttribute('data-mobile-menu', '');
    const inner = document.createElement('button');
    menu.appendChild(inner);

    renderHook(() => useClickOutside(onClose, true));
    fireClick(inner);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when clicking [data-mobile-menu-button]', () => {
    const btn = append(document.createElement('button'));
    btn.setAttribute('data-mobile-menu-button', '');

    renderHook(() => useClickOutside(onClose, true));
    fireClick(btn);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes the listener when enabled changes to false', () => {
    const outside = append(document.createElement('div'));

    const { rerender } = renderHook(
      ({ enabled }) => useClickOutside(onClose, enabled),
      { initialProps: { enabled: true } },
    );
    rerender({ enabled: false });
    fireClick(outside);
    expect(onClose).not.toHaveBeenCalled();
  });
});
