import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArcadePetAdoptionModal } from './ArcadePetAdoptionModal';
import { useArcadePetStore } from '../store/useArcadePetStore';

describe('ArcadePetAdoptionModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useArcadePetStore.setState({
      gemBalance: 800,
      adoptionCount: 0,
      pets: [],
      activePetId: null,
      queuedThemeForNextPet: null,
    });
  });

  it('renders free first mount adoption button', () => {
    render(<ArcadePetAdoptionModal open onClose={onClose} />);
    expect(screen.getByTestId('arcade-pet-adoption-modal')).toBeInTheDocument();
    expect(screen.getByTestId('adopt-random-btn')).toHaveTextContent(
      'Roll First Mount (FREE)',
    );
  });

  it('adopts random companion when button clicked', () => {
    render(<ArcadePetAdoptionModal open onClose={onClose} />);
    const btn = screen.getByTestId('adopt-random-btn');
    fireEvent.click(btn);

    expect(useArcadePetStore.getState().pets.length).toBe(1);
    expect(screen.getByText(/Adopted/i)).toBeInTheDocument();
  });

  it('switches to VIP pet selection and adopts custom pet', () => {
    useArcadePetStore.setState({
      gemBalance: 900,
      adoptionCount: 1,
    });

    render(<ArcadePetAdoptionModal open onClose={onClose} />);
    const selectTab = screen.getByTestId('tab-select-pet');
    fireEvent.click(selectTab);

    const speciesBtn = screen.getByTestId('select-species-dragon');
    fireEvent.click(speciesBtn);

    const themeBtn = screen.getByTestId('select-theme-fantasy');
    fireEvent.click(themeBtn);

    const nameInput = screen.getByTestId('custom-pet-name-input');
    fireEvent.change(nameInput, { target: { value: 'Mystic Drake' } });

    const adoptSelectedBtn = screen.getByTestId('adopt-selected-btn');
    fireEvent.click(adoptSelectedBtn);

    expect(useArcadePetStore.getState().pets.length).toBe(1);
    expect(useArcadePetStore.getState().gemBalance).toBe(150);
    expect(useArcadePetStore.getState().pet?.name).toBe('Mystic Drake');
  });

  it('displays theme pet cards showing signature pets for game themes', () => {
    render(<ArcadePetAdoptionModal open onClose={onClose} />);
    expect(
      screen.getByText('Game Theme Pets (5 Pets per Theme)'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('theme-pet-card-cyberpunk')).toBeInTheDocument();
    expect(screen.getByText('⭐ Neon Cyber Cat')).toBeInTheDocument();
  });
});
