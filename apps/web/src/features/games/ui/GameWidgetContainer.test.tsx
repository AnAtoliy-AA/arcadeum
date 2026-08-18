import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameWidgetContainer } from './GameWidgetContainer';
import { WidgetFullscreenContext } from './GameWidgetContainer.styles';

function renderContainer(overrides: { a11yAnnouncement?: string } = {}) {
  return render(
    <WidgetFullscreenContext.Provider value={false}>
      <GameWidgetContainer
        board={<div>board</div>}
        showChatPopup={false}
        loading={false}
        {...overrides}
      />
    </WidgetFullscreenContext.Provider>,
  );
}

describe('GameWidgetContainer a11y', () => {
  it('renders no live region when no announcement is provided', () => {
    renderContainer();
    expect(screen.queryByTestId('a11y-live-region')).toBeNull();
  });

  it('announces the provided message in a polite live region', () => {
    renderContainer({ a11yAnnouncement: 'Your turn' });
    const region = screen.getByTestId('a11y-live-region');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('role', 'status');
    expect(region.textContent).toBe('Your turn');
  });
});
