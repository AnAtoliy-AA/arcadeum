import { useState, useEffect, useCallback } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import {
  computeNextStep,
  getSpeciesBehavior,
  pickRandomSpeciesEmote,
  pickSpeciesTarget,
} from './arcade-pet-behavior';

export interface PetSimState {
  localCol: number;
  localRow: number;
  targetCol: number;
  targetRow: number;
  localDir: 'left' | 'right';
  localState: 'walking' | 'idle' | 'happy' | 'sleeping';
  localEmote: string | null;
  remoteCol: number;
  remoteRow: number;
  remoteTargetCol: number;
  remoteTargetRow: number;
  remoteDir: 'left' | 'right';
  remoteState: 'walking' | 'idle' | 'happy' | 'sleeping';
  remoteEmote: string | null;
  knockTicks: number;
  tick: number;
}

interface UsePetStageSimulationParams {
  localSpecies: PetSpecies;
  remoteSpecies: PetSpecies;
  isAtHome: boolean;
  hasFriend: boolean;
  setAtHome: (atHome: boolean) => void;
  onOpenCare: () => void;
}

export function usePetStageSimulation({
  localSpecies,
  remoteSpecies,
  isAtHome,
  hasFriend,
  setAtHome,
  onOpenCare,
}: UsePetStageSimulationParams) {
  const localBehavior = getSpeciesBehavior(localSpecies);
  const remoteBehavior = getSpeciesBehavior(remoteSpecies);

  const [sim, setSim] = useState<PetSimState>(() => {
    const initialLocalTarget = pickSpeciesTarget(localSpecies, 2, 1);
    const initialRemoteTarget = pickSpeciesTarget(remoteSpecies, 6, 2);
    return {
      localCol: 2,
      localRow: Math.max(
        localBehavior.minRow,
        Math.min(localBehavior.maxRow, 1),
      ),
      targetCol: initialLocalTarget.targetCol,
      targetRow: initialLocalTarget.targetRow,
      localDir: 'right',
      localState: 'idle',
      localEmote: pickRandomSpeciesEmote(localSpecies, 'ambient'),
      remoteCol: 6,
      remoteRow: Math.max(
        remoteBehavior.minRow,
        Math.min(remoteBehavior.maxRow, 2),
      ),
      remoteTargetCol: initialRemoteTarget.targetCol,
      remoteTargetRow: initialRemoteTarget.targetRow,
      remoteDir: 'left',
      remoteState: 'idle',
      remoteEmote: pickRandomSpeciesEmote(remoteSpecies, 'ambient'),
      knockTicks: 0,
      tick: 0,
    };
  });

  useEffect(() => {
    const localTimer = setInterval(() => {
      setSim((prev) => {
        if (isAtHome) return prev;

        const atTarget =
          prev.localCol === prev.targetCol && prev.localRow === prev.targetRow;

        if (atTarget) {
          const nextTarget = pickSpeciesTarget(
            localSpecies,
            prev.localCol,
            prev.localRow,
          );
          return {
            ...prev,
            tick: prev.tick + 1,
            targetCol: nextTarget.targetCol,
            targetRow: nextTarget.targetRow,
            localState: 'happy',
            localEmote: pickRandomSpeciesEmote(localSpecies, 'ambient'),
          };
        }

        const step = computeNextStep(
          localSpecies,
          prev.localCol,
          prev.localRow,
          prev.targetCol,
          prev.targetRow,
          prev.localDir,
        );

        return {
          ...prev,
          tick: prev.tick + 1,
          localCol: step.nextCol,
          localRow: step.nextRow,
          localDir: step.dir,
          localState: 'walking',
          localEmote: null,
        };
      });
    }, localBehavior.cadenceMs);

    return () => clearInterval(localTimer);
  }, [localSpecies, localBehavior.cadenceMs, isAtHome]);

  useEffect(() => {
    if (!hasFriend && !isAtHome) return;

    const remoteTimer = setInterval(() => {
      setSim((prev) => {
        if (isAtHome) {
          const atDoor = prev.remoteCol === 7 && prev.remoteRow === 1;
          if (atDoor) {
            const nextKnock = prev.knockTicks + 1;
            if (nextKnock >= 2) {
              setAtHome(false);
              return {
                ...prev,
                knockTicks: 0,
                localCol: 8,
                localRow: 1,
                localState: 'happy',
                localEmote: pickRandomSpeciesEmote(localSpecies, 'friend'),
                remoteState: 'happy',
                remoteEmote: pickRandomSpeciesEmote(remoteSpecies, 'friend'),
                targetCol: 4,
                targetRow: Math.floor(
                  (localBehavior.minRow + localBehavior.maxRow) / 2,
                ),
              };
            }
            return {
              ...prev,
              knockTicks: nextKnock,
              remoteDir: 'right',
              remoteState: 'idle',
              remoteEmote: pickRandomSpeciesEmote(remoteSpecies, 'knock'),
            };
          }

          const step = computeNextStep(
            remoteSpecies,
            prev.remoteCol,
            prev.remoteRow,
            7,
            1,
            prev.remoteDir,
          );

          return {
            ...prev,
            remoteCol: step.nextCol,
            remoteRow: step.nextRow,
            remoteDir: step.dir,
            remoteState: 'walking',
            remoteEmote: null,
            knockTicks: 0,
          };
        }

        const distCol = Math.abs(prev.localCol - prev.remoteCol);
        const distRow = Math.abs(prev.localRow - prev.remoteRow);

        if (distCol <= 1 && distRow <= 1) {
          const nextTarget = pickSpeciesTarget(
            remoteSpecies,
            prev.remoteCol,
            prev.remoteRow,
          );
          return {
            ...prev,
            remoteTargetCol: nextTarget.targetCol,
            remoteTargetRow: nextTarget.targetRow,
            remoteState: 'happy',
            localState: 'happy',
            remoteEmote: pickRandomSpeciesEmote(remoteSpecies, 'friend'),
            localEmote: pickRandomSpeciesEmote(localSpecies, 'friend'),
          };
        }

        const atRemoteTarget =
          prev.remoteCol === prev.remoteTargetCol &&
          prev.remoteRow === prev.remoteTargetRow;

        if (atRemoteTarget) {
          const nextTarget = pickSpeciesTarget(
            remoteSpecies,
            prev.remoteCol,
            prev.remoteRow,
          );
          return {
            ...prev,
            remoteTargetCol: nextTarget.targetCol,
            remoteTargetRow: nextTarget.targetRow,
            remoteState: 'happy',
            remoteEmote: pickRandomSpeciesEmote(remoteSpecies, 'ambient'),
          };
        }

        const step = computeNextStep(
          remoteSpecies,
          prev.remoteCol,
          prev.remoteRow,
          prev.remoteTargetCol,
          prev.remoteTargetRow,
          prev.remoteDir,
        );

        return {
          ...prev,
          remoteCol: step.nextCol,
          remoteRow: step.nextRow,
          remoteDir: step.dir,
          remoteState: 'walking',
          remoteEmote: null,
        };
      });
    }, remoteBehavior.cadenceMs);

    return () => clearInterval(remoteTimer);
  }, [
    remoteSpecies,
    remoteBehavior.cadenceMs,
    localSpecies,
    localBehavior.minRow,
    localBehavior.maxRow,
    isAtHome,
    hasFriend,
    setAtHome,
  ]);

  const handleOpenDoor = useCallback(() => {
    setAtHome(false);
    setSim((prev) => ({
      ...prev,
      localCol: 8,
      localRow: 1,
      localState: 'happy',
      localEmote: pickRandomSpeciesEmote(localSpecies, 'friend'),
      remoteState: 'happy',
      remoteEmote: pickRandomSpeciesEmote(remoteSpecies, 'friend'),
      targetCol: 4,
      targetRow: 4,
      knockTicks: 0,
    }));
  }, [setAtHome, localSpecies, remoteSpecies]);

  const handleLocalClick = useCallback(() => {
    setSim((prev) => ({
      ...prev,
      localState: 'happy',
      localEmote: pickRandomSpeciesEmote(localSpecies, 'friend'),
    }));
    onOpenCare();
  }, [onOpenCare, localSpecies]);

  const handleRemoteClick = useCallback(() => {
    setSim((prev) => ({
      ...prev,
      remoteState: 'happy',
      remoteEmote: pickRandomSpeciesEmote(remoteSpecies, 'friend'),
    }));
  }, [remoteSpecies]);

  return {
    sim,
    handleOpenDoor,
    handleLocalClick,
    handleRemoteClick,
  };
}
