'use client';

import { useState, useCallback } from 'react';
import type { ShipConfig } from '../types';
import { SHIPS } from '../types';

interface ShipPlacementModalState {
  isOpen: boolean;
  currentShipIndex: number;
}

interface AttackResultModalState {
  isOpen: boolean;
  result: 'hit' | 'miss' | 'sunk' | null;
  shipName?: string;
}

export function useSeaBattleModals() {
  const [shipPlacementModal, setShipPlacementModal] =
    useState<ShipPlacementModalState>({
      isOpen: false,
      currentShipIndex: 0,
    });

  const [attackResultModal, setAttackResultModal] =
    useState<AttackResultModalState>({
      isOpen: false,
      result: null,
    });

  const [gameOverModal, setGameOverModal] = useState<{
    isOpen: boolean;
    isWinner: boolean;
  }>({
    isOpen: false,
    isWinner: false,
  });

  // Ship placement modal handlers
  const openShipPlacementModal = useCallback(() => {
    setShipPlacementModal({ isOpen: true, currentShipIndex: 0 });
  }, []);

  const closeShipPlacementModal = useCallback(() => {
    setShipPlacementModal({ isOpen: false, currentShipIndex: 0 });
  }, []);

  const advanceToNextShip = useCallback(() => {
    setShipPlacementModal((prev) => ({
      ...prev,
      currentShipIndex: Math.min(prev.currentShipIndex + 1, SHIPS.length - 1),
    }));
  }, []);

  const getCurrentShip = useCallback((): ShipConfig | null => {
    if (shipPlacementModal.currentShipIndex >= SHIPS.length) return null;
    return SHIPS[shipPlacementModal.currentShipIndex];
  }, [shipPlacementModal.currentShipIndex]);

  // Attack result modal handlers
  const showAttackResult = useCallback(
    (result: 'hit' | 'miss' | 'sunk', shipName?: string) => {
      setAttackResultModal({ isOpen: true, result, shipName });
    },
    [],
  );

  const closeAttackResultModal = useCallback(() => {
    setAttackResultModal({ isOpen: false, result: null });
  }, []);

  // Game over modal handlers
  const showGameOver = useCallback((isWinner: boolean) => {
    setGameOverModal({ isOpen: true, isWinner });
  }, []);

  const closeGameOverModal = useCallback(() => {
    setGameOverModal({ isOpen: false, isWinner: false });
  }, []);

  return {
    // Ship placement modal
    shipPlacementModal,
    openShipPlacementModal,
    closeShipPlacementModal,
    advanceToNextShip,
    getCurrentShip,

    // Attack result modal
    attackResultModal,
    showAttackResult,
    closeAttackResultModal,

    // Game over modal
    gameOverModal,
    showGameOver,
    closeGameOverModal,
  };
}
