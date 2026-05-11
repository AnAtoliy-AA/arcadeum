import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./ActiveGameContent', () => ({
  ActiveGameContent: () => (
    <div data-testid="active-game-content-stub">stub</div>
  ),
}));

import { MatchWidget, type MatchWidgetProps } from './MatchWidget';

describe('MatchWidget (ARC-631 scaffold)', () => {
  it('passes through to ActiveGameContent', () => {
    // For ARC-631 the widget is a transparent wrapper. Follow-up tickets
    // replace the inside with the §7 layout (Arena, OpponentsRow, HandZone).
    // The test asserts the pass-through stays in place for now — the inner
    // is mocked, so the actual prop values don't matter.
    const stubProps = {} as unknown as MatchWidgetProps;
    render(<MatchWidget {...stubProps} />);
    expect(screen.getByTestId('match-widget')).toBeInTheDocument();
    expect(screen.getByTestId('active-game-content-stub')).toBeInTheDocument();
  });
});
