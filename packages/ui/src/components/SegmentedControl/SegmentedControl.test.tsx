import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl', () => {
  const items = [
    { id: 'all', label: 'All' },
    { id: 'lobby', label: 'Lobby', count: 3 },
    { id: 'in_progress', label: 'In Progress' },
  ];

  it('renders all options with appropriate active states', () => {
    render(
      <SegmentedControl
        items={items}
        value="lobby"
        onChange={() => {}}
      />,
    );
    const lobbyBtn = screen.getByRole('checkbox', { name: 'Lobby' });
    expect(lobbyBtn).toHaveAttribute('aria-checked', 'true');
    const allBtn = screen.getByRole('checkbox', { name: 'All' });
    expect(allBtn).toHaveAttribute('aria-checked', 'false');
  });

  it('triggers onChange when clicking an option', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        items={items}
        value="all"
        onChange={handleChange}
      />,
    );
    const lobbyBtn = screen.getByRole('checkbox', { name: 'Lobby' });
    fireEvent.click(lobbyBtn);
    expect(handleChange).toHaveBeenCalledWith('lobby');
  });

  it('supports multiple selected values in array', () => {
    render(
      <SegmentedControl
        items={items}
        value={['lobby', 'in_progress']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Lobby' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('checkbox', { name: 'In Progress' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('checkbox', { name: 'All' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});
