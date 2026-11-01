import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArcadePetHomeBooth } from './ArcadePetHomeBooth';

describe('ArcadePetHomeBooth', () => {
  it('renders house structure and pet name', () => {
    render(
      <ArcadePetHomeBooth
        isAtHome={false}
        onToggleHome={vi.fn()}
        localPetName="Cyber Drake"
        localPetSpecies="dragon"
        localPetTheme="cyberpunk"
        isKnocked={false}
        onOpenDoor={vi.fn()}
      />,
    );

    expect(screen.getByTestId('arcade-pet-home-booth')).toBeInTheDocument();
    expect(screen.getByText('🐾 Cyber Drake')).toBeInTheDocument();
    expect(screen.getByText('Cozy Crib 🏠')).toBeInTheDocument();
  });

  it('renders sleeping pet inside house when isAtHome is true', () => {
    render(
      <ArcadePetHomeBooth
        isAtHome={true}
        onToggleHome={vi.fn()}
        localPetName="Cyber Drake"
        localPetSpecies="dragon"
        localPetTheme="cyberpunk"
        isKnocked={false}
        onOpenDoor={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId('arcade-pet-sleeping-bubble'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('arcade-pet-inside-house')).toBeInTheDocument();
    expect(screen.getByText('Click to wake ☀️')).toBeInTheDocument();
  });

  it('shows knock bubble and calls onOpenDoor when opponent knocks', () => {
    const handleOpenDoor = vi.fn();
    render(
      <ArcadePetHomeBooth
        isAtHome={true}
        onToggleHome={vi.fn()}
        localPetName="Cyber Drake"
        localPetSpecies="dragon"
        localPetTheme="cyberpunk"
        isKnocked={true}
        knockerName="Rival Dino"
        onOpenDoor={handleOpenDoor}
      />,
    );

    expect(screen.getByTestId('arcade-pet-knock-bubble')).toBeInTheDocument();
    expect(screen.getByText(/KNOCK KNOCK!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Rival Dino: “Come out and play! 🎾”/i),
    ).toBeInTheDocument();

    const openDoorBtn = screen.getByTestId('open-door-and-play-btn');
    fireEvent.click(openDoorBtn);
    expect(handleOpenDoor).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleHome when clicking house structure', () => {
    const handleToggle = vi.fn();
    render(
      <ArcadePetHomeBooth
        isAtHome={false}
        onToggleHome={handleToggle}
        localPetName="Cyber Drake"
        localPetSpecies="dragon"
        localPetTheme="cyberpunk"
        isKnocked={false}
        onOpenDoor={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('arcade-pet-house-structure'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
