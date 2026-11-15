import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { HandCardStack } from './HandCardStack';
import type { HandCardInstance } from '../../lib/combo';

describe('HandCardStack', () => {
  const singleInstance: HandCardInstance = {
    id: 'strike',
    uid: 'strike-0',
    originalIndex: 0,
  };

  const tripleInstances: HandCardInstance[] = [
    { id: 'strike', uid: 'strike-0', originalIndex: 0 },
    { id: 'strike', uid: 'strike-1', originalIndex: 1 },
    { id: 'strike', uid: 'strike-2', originalIndex: 2 },
  ];

  it('renders a single card without stack layers or count badge', () => {
    render(
      <HandCardStack
        card={singleInstance}
        instances={[singleInstance]}
        selectedCount={0}
        onSelectCount={vi.fn()}
      />,
    );

    expect(screen.getByTestId('hand-card-strike')).toBeInTheDocument();
    expect(screen.queryByTestId('stack-layer-2-strike')).toBeNull();
    expect(screen.queryByTestId('stack-layer-3-strike')).toBeNull();
    expect(screen.queryByTestId('hand-card-count-strike')).toBeNull();
  });

  it('renders stacked layers and duplicate count badge for duplicate cards', () => {
    render(
      <HandCardStack
        card={tripleInstances[0]}
        instances={tripleInstances}
        selectedCount={0}
        onSelectCount={vi.fn()}
      />,
    );

    expect(screen.getByTestId('hand-card-strike')).toBeInTheDocument();
    expect(screen.getByTestId('stack-layer-2-strike')).toBeInTheDocument();
    expect(screen.getByTestId('stack-layer-3-strike')).toBeInTheDocument();
    expect(screen.getByTestId('hand-card-count-strike')).toHaveTextContent(
      '×3',
    );
  });

  it('cycles selection from 0 -> 1 -> 2 -> 3 -> 0 on successive taps', () => {
    const onSelectCount = vi.fn();
    const { rerender } = render(
      <HandCardStack
        card={tripleInstances[0]}
        instances={tripleInstances}
        selectedCount={0}
        onSelectCount={onSelectCount}
      />,
    );

    const card = screen.getByTestId('hand-card-strike');

    // 0 -> 1
    fireEvent.pointerDown(card, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(card, { clientX: 10, clientY: 10 });
    expect(onSelectCount).toHaveBeenCalledWith(1);

    // 1 -> 2
    rerender(
      <HandCardStack
        card={tripleInstances[0]}
        instances={tripleInstances}
        selectedCount={1}
        onSelectCount={onSelectCount}
      />,
    );
    fireEvent.pointerDown(card, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(card, { clientX: 10, clientY: 10 });
    expect(onSelectCount).toHaveBeenCalledWith(2);

    // 2 -> 3
    rerender(
      <HandCardStack
        card={tripleInstances[0]}
        instances={tripleInstances}
        selectedCount={2}
        onSelectCount={onSelectCount}
      />,
    );
    fireEvent.pointerDown(card, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(card, { clientX: 10, clientY: 10 });
    expect(onSelectCount).toHaveBeenCalledWith(3);

    // 3 -> 0 (deselect)
    rerender(
      <HandCardStack
        card={tripleInstances[0]}
        instances={tripleInstances}
        selectedCount={3}
        onSelectCount={onSelectCount}
      />,
    );
    fireEvent.pointerDown(card, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(card, { clientX: 10, clientY: 10 });
    expect(onSelectCount).toHaveBeenCalledWith(0);
  });

  it('allows fine-grained count adjustments with stepper buttons', () => {
    const onSelectCount = vi.fn();
    render(
      <HandCardStack
        card={tripleInstances[0]}
        instances={tripleInstances}
        selectedCount={2}
        onSelectCount={onSelectCount}
      />,
    );

    expect(screen.getByTestId('stack-stepper-strike')).toBeInTheDocument();

    const decBtn = screen.getByTestId('stack-dec-strike');
    fireEvent.click(decBtn);
    expect(onSelectCount).toHaveBeenCalledWith(1);

    const incBtn = screen.getByTestId('stack-inc-strike');
    fireEvent.click(incBtn);
    expect(onSelectCount).toHaveBeenCalledWith(3);
  });

  it('does not trigger selection when disabled', () => {
    const onSelectCount = vi.fn();
    render(
      <HandCardStack
        card={tripleInstances[0]}
        instances={tripleInstances}
        selectedCount={0}
        disabled={true}
        onSelectCount={onSelectCount}
      />,
    );

    const card = screen.getByTestId('hand-card-strike');
    fireEvent.pointerDown(card, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(card, { clientX: 10, clientY: 10 });
    expect(onSelectCount).not.toHaveBeenCalled();
  });
});
