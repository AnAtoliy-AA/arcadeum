import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShipAbilitiesPanel } from './ShipAbilitiesPanel';
import type { SeaBattlePlayerState } from '../types';

const mockPlayer: SeaBattlePlayerState = {
  playerId: 'p1',
  alive: true,
  placementComplete: true,
  shipsRemaining: 2,
  board: [],
  ships: [
    {
      id: 's1',
      name: 'Carrier',
      size: 5,
      cells: [],
      hits: 0,
      sunk: false,
    },
    {
      id: 's2',
      name: 'Battleship',
      size: 4,
      cells: [],
      hits: 0,
      sunk: false,
    },
  ],
};

describe('ShipAbilitiesPanel', () => {
  it('renders ability toggle and shows buttons when expanded', () => {
    const onUseAbility = vi.fn();
    render(
      <ShipAbilitiesPanel
        player={mockPlayer}
        onUseAbility={onUseAbility}
        disabled={false}
      />,
    );

    const toggle = screen.getByRole('button', { name: /Ship Abilities/i });
    expect(toggle).toBeDefined();

    fireEvent.click(toggle);

    const scoutBtn = screen.getByRole('button', { name: /Scout/i });
    expect(scoutBtn).toBeDefined();
    expect(scoutBtn).not.toBeDisabled();

    fireEvent.click(scoutBtn);
    expect(onUseAbility).toHaveBeenCalledWith('scout');
  });

  it('disables ability buttons when disabled prop is true', () => {
    const onUseAbility = vi.fn();
    render(
      <ShipAbilitiesPanel
        player={mockPlayer}
        onUseAbility={onUseAbility}
        disabled={true}
      />,
    );

    const toggle = screen.getByRole('button', { name: /Ship Abilities/i });
    fireEvent.click(toggle);

    const scoutBtn = screen.getByRole('button', { name: /Scout/i });
    expect(scoutBtn).toBeDisabled();

    fireEvent.click(scoutBtn);
    expect(onUseAbility).not.toHaveBeenCalled();
  });

  it('indicates active primed ability with cancel hint in title', () => {
    render(
      <ShipAbilitiesPanel
        player={mockPlayer}
        onUseAbility={vi.fn()}
        disabled={false}
        activeAbilityId="scout"
      />,
    );

    const toggle = screen.getByRole('button', { name: /Ship Abilities/i });
    fireEvent.click(toggle);

    const scoutBtn = screen.getByRole('button', { name: /Scout/i });
    expect(scoutBtn.getAttribute('title')).toContain(
      'Active - click to cancel',
    );
  });
});
