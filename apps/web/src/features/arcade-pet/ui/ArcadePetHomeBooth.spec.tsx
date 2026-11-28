import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArcadePetHomeBooth } from './ArcadePetHomeBooth';
import { mockUseTranslation } from '../test/mock-translation';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

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

  it('renders drag handle affordance', () => {
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
      screen.getByTestId('arcade-pet-home-drag-handle'),
    ).toBeInTheDocument();
    expect(screen.getByText('DRAG')).toBeInTheDocument();
  });

  it('supports dragging home booth and suppresses toggle on drag', () => {
    const handleToggle = vi.fn();
    render(
      <ArcadePetHomeBooth
        isAtHome={true}
        onToggleHome={handleToggle}
        localPetName="Cyber Drake"
        localPetSpecies="dragon"
        localPetTheme="cyberpunk"
        isKnocked={false}
        onOpenDoor={vi.fn()}
      />,
    );

    const booth = screen.getByTestId('arcade-pet-home-booth');
    booth.setPointerCapture = vi.fn();
    booth.releasePointerCapture = vi.fn();

    vi.spyOn(booth, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      top: 300,
      width: 120,
      height: 150,
      right: 320,
      bottom: 450,
      x: 200,
      y: 300,
      toJSON: () => {},
    });

    fireEvent.pointerDown(booth, {
      clientX: 220,
      clientY: 320,
      button: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(booth, { clientX: 270, clientY: 380, pointerId: 1 });

    expect(booth.style.getPropertyValue('--home-drag-x')).toBeTruthy();
    expect(booth.style.getPropertyValue('--home-drag-y')).toBeTruthy();

    fireEvent.pointerUp(booth, { clientX: 270, clientY: 380, pointerId: 1 });

    fireEvent.click(screen.getByTestId('arcade-pet-house-structure'));
    expect(handleToggle).not.toHaveBeenCalled();
  });

  it('moves the booth with arrow keys from the drag handle', () => {
    localStorage.clear();
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

    const booth = screen.getByTestId('arcade-pet-home-booth');
    const handle = screen.getByTestId('arcade-pet-home-drag-handle');
    expect(handle).toHaveAttribute('aria-label');

    vi.spyOn(booth, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      top: 200,
      width: 100,
      height: 100,
      right: 300,
      bottom: 300,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    });

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(booth.style.getPropertyValue('--home-drag-x')).toBe('16px');
    fireEvent.keyDown(handle, { key: 'ArrowDown', shiftKey: true });
    expect(booth.style.getPropertyValue('--home-drag-y')).toBe('64px');
  });

  it('does not capture the pointer on a plain tap so the click wakes the pet', () => {
    const handleToggle = vi.fn();
    render(
      <ArcadePetHomeBooth
        isAtHome={true}
        onToggleHome={handleToggle}
        localPetName="Cyber Drake"
        localPetSpecies="dragon"
        localPetTheme="cyberpunk"
        isKnocked={false}
        onOpenDoor={vi.fn()}
      />,
    );

    const booth = screen.getByTestId('arcade-pet-home-booth');
    const capture = vi.fn();
    booth.setPointerCapture = capture;
    booth.releasePointerCapture = vi.fn();
    const house = screen.getByTestId('arcade-pet-house-structure');

    // Real browsers retarget the click to the capturing element, which would
    // skip the house onClick. A tap must therefore never capture.
    fireEvent.pointerDown(house, {
      clientX: 220,
      clientY: 320,
      button: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(booth, { clientX: 222, clientY: 321, pointerId: 1 });
    fireEvent.pointerUp(booth, { clientX: 222, clientY: 321, pointerId: 1 });
    fireEvent.click(house);

    expect(capture).not.toHaveBeenCalled();
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('captures the pointer once a real drag starts', () => {
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
    const booth = screen.getByTestId('arcade-pet-home-booth');
    const capture = vi.fn();
    booth.setPointerCapture = capture;
    booth.releasePointerCapture = vi.fn();
    fireEvent.pointerDown(booth, {
      clientX: 0,
      clientY: 0,
      button: 0,
      pointerId: 2,
    });
    fireEvent.pointerMove(booth, { clientX: 40, clientY: 40, pointerId: 2 });
    expect(capture).toHaveBeenCalledWith(2);
  });
});
