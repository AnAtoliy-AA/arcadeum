import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { ArcadePetSocialStage } from './ArcadePetSocialStage';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { useGameStore } from '@/features/games/store/gameStore';

describe('ArcadePetSocialStage', () => {
  const onOpenCare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useArcadePetStore.setState({
      pet: {
        id: 'test-pet-1',
        name: 'PixelBuddy',
        species: 'cyber_cat',
        stage: 'adult',
        theme: 'cyberpunk',
        stats: {
          hunger: 80,
          happiness: 90,
          energy: 85,
          hygiene: 70,
          discipline: 60,
          health: 100,
          weight: 12,
          level: 3,
          xp: 150,
        },
        timestamps: {
          bornAt: Date.now() - 100000,
          lastInteractedAt: Date.now(),
          lastFedAt: Date.now(),
          lastSleptAt: Date.now(),
          lastCleanedAt: Date.now(),
          lastTrainedAt: Date.now(),
        },
        inventory: {},
        isSleeping: false,
        poopCount: 0,
      },
    });

    useGameStore.setState({
      room: null,
    });
  });

  it('renders local screen companion with pet name', () => {
    render(<ArcadePetSocialStage onOpenCare={onOpenCare} />);

    expect(screen.getByTestId('arcade-pet-social-stage')).toBeInTheDocument();
    expect(
      screen.getByTestId('arcade-pet-local-screen-pet'),
    ).toBeInTheDocument();
    expect(screen.getByText('PixelBuddy')).toBeInTheDocument();
  });

  it('triggers onOpenCare when local pet is clicked', () => {
    render(<ArcadePetSocialStage onOpenCare={onOpenCare} />);

    const localPet = screen.getByTestId('arcade-pet-local-screen-pet');
    fireEvent.click(localPet);

    expect(onOpenCare).toHaveBeenCalledTimes(1);
  });

  it('renders friend pet when another member is present in room', () => {
    useGameStore.setState({
      room: {
        id: 'room-1',
        gameId: 'chess_v1',
        name: 'Friendly Match',
        hostId: 'host-1',
        visibility: 'public',
        playerCount: 2,
        maxPlayers: 2,
        createdAt: new Date().toISOString(),
        status: 'in_progress',
        members: [
          {
            id: 'host-1',
            displayName: 'BobMaster',
            isHost: true,
          },
        ],
      },
    });

    render(
      <ArcadePetSocialStage
        currentUserId="local-player-id"
        onOpenCare={onOpenCare}
      />,
    );

    expect(
      screen.getByTestId('arcade-pet-remote-screen-pet'),
    ).toBeInTheDocument();
    expect(screen.getByText("BobMaster's Pet")).toBeInTheDocument();
  });

  it('does not render remote pet when user is the only member in the room', () => {
    useGameStore.setState({
      room: {
        id: 'room-1',
        gameId: 'chess_v1',
        name: 'Solo Match',
        hostId: 'my-user-id',
        visibility: 'public',
        playerCount: 1,
        maxPlayers: 2,
        createdAt: new Date().toISOString(),
        status: 'in_progress',
        members: [
          {
            id: 'my-user-id',
            displayName: 'Anatoli Aliaksandrau',
            isHost: true,
          },
        ],
      },
    });

    render(
      <ArcadePetSocialStage
        currentUserId="my-user-id"
        onOpenCare={onOpenCare}
      />,
    );

    expect(
      screen.queryByTestId('arcade-pet-remote-screen-pet'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Anatoli Aliaksandrau's Pet"),
    ).not.toBeInTheDocument();
  });

  it('renders home booth and hides roaming pet when pet is at home', () => {
    useArcadePetStore.setState({ isAtHome: true });
    render(<ArcadePetSocialStage onOpenCare={onOpenCare} />);

    expect(screen.getByTestId('arcade-pet-home-booth')).toBeInTheDocument();
    expect(screen.getByTestId('arcade-pet-inside-house')).toBeInTheDocument();
    expect(
      screen.queryByTestId('arcade-pet-local-screen-pet'),
    ).not.toBeInTheDocument();
  });
});
