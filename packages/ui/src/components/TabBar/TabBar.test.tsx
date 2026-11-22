import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TabBar } from './TabBar';

const items = [
  { id: 'a', label: 'Alpha', testId: 'tab-a' },
  { id: 'b', label: 'Beta', badge: 3, testId: 'tab-b' },
  { id: 'c', label: 'Gamma', testId: 'tab-c' },
];

describe('TabBar', () => {
  it('exposes tablist semantics and selected state', () => {
    render(
      <TabBar
        items={items}
        value="b"
        onChange={vi.fn()}
        aria-label="Sections"
      />,
    );
    expect(
      screen.getByRole('tablist', { name: 'Sections' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-b')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('tab-a')).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByTestId('tab-a')).toHaveAttribute('tabindex', '-1');
  });

  it('shows the badge only when positive', () => {
    render(
      <TabBar
        items={items}
        value="a"
        onChange={vi.fn()}
        aria-label="Sections"
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange on click and arrow keys (wrapping)', () => {
    const onChange = vi.fn();
    render(
      <TabBar
        items={items}
        value="a"
        onChange={onChange}
        aria-label="Sections"
      />,
    );
    fireEvent.click(screen.getByTestId('tab-c'));
    expect(onChange).toHaveBeenLastCalledWith('c');
    fireEvent.keyDown(screen.getByTestId('tab-a'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('c');
    fireEvent.keyDown(screen.getByTestId('tab-a'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('b');
    fireEvent.keyDown(screen.getByTestId('tab-a'), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('c');
  });
});
