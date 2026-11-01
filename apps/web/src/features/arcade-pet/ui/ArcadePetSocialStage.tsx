'use client';

import React, { useMemo } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { useGameStore } from '@/features/games/store/gameStore';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';
import { ArcadePetHomeBooth } from './ArcadePetHomeBooth';
import { usePetStageSimulation } from '../lib/usePetStageSimulation';
import styles from './arcade-pet-companion.module.scss';

const COL_CLASSES = [
  styles.col0,
  styles.col1,
  styles.col2,
  styles.col3,
  styles.col4,
  styles.col5,
  styles.col6,
  styles.col7,
  styles.col8,
  styles.col9,
];

const ROW_CLASSES = [
  styles.row0,
  styles.row1,
  styles.row2,
  styles.row3,
  styles.row4,
  styles.row5,
  styles.row6,
  styles.row7,
];

export function ArcadePetSocialStage({
  onOpenCare,
}: {
  onOpenCare: () => void;
}) {
  const localPet = useArcadePetStore((s) => s.pet);
  const isAtHome = useArcadePetStore((s) => s.isAtHome);
  const setAtHome = useArcadePetStore((s) => s.setAtHome);
  const toggleHome = useArcadePetStore((s) => s.toggleHome);
  const room = useGameStore((s) => s.room);
  const members = useMemo(() => room?.members ?? [], [room?.members]);

  const otherPlayer = useMemo(() => {
    return members.find((m) => m.id && m.id !== localPet?.id) ?? null;
  }, [members, localPet?.id]);

  const hasFriend = Boolean(otherPlayer);

  const localSpecies: PetSpecies =
    localPet?.stage === 'egg' ? 'blob' : (localPet?.species ?? 'cyber_cat');
  const remoteSpecies: PetSpecies =
    otherPlayer?.displayName?.length && otherPlayer.displayName.length % 2 === 0
      ? 'cyber_cat'
      : 'dragon';

  const { sim, handleOpenDoor, handleLocalClick, handleRemoteClick } =
    usePetStageSimulation({
      localSpecies,
      remoteSpecies,
      isAtHome,
      hasFriend,
      setAtHome,
      onOpenCare,
    });

  if (!localPet) return null;

  const localColClass = COL_CLASSES[sim.localCol] ?? styles.col2;
  const localRowClass = ROW_CLASSES[sim.localRow] ?? styles.row1;

  const remoteColClass = COL_CLASSES[sim.remoteCol] ?? styles.col5;
  const remoteRowClass = ROW_CLASSES[sim.remoteRow] ?? styles.row2;

  const isKnocked = isAtHome && sim.remoteCol === 7 && sim.remoteRow === 1;
  const knockerName = otherPlayer?.displayName
    ? `${otherPlayer.displayName}'s Pet`
    : 'Neighbor Pixel';
  const hasRemotePet = hasFriend || isAtHome;

  return (
    <div
      className={styles.stageContainer}
      data-testid="arcade-pet-social-stage"
    >
      <div className={styles.petTrack}>
        <ArcadePetHomeBooth
          isAtHome={isAtHome}
          onToggleHome={toggleHome}
          localPetName={localPet.name}
          localPetSpecies={localSpecies}
          localPetTheme={localPet.theme}
          isKnocked={isKnocked}
          knockerName={knockerName}
          onOpenDoor={handleOpenDoor}
        />

        {!isAtHome && (
          <div
            data-testid="arcade-pet-local-screen-pet"
            onClick={handleLocalClick}
            className={`${styles.petEntity} ${localColClass} ${localRowClass}`}
          >
            {sim.localEmote && (
              <div
                className={`mb-1 px-2 py-0.5 rounded-full bg-black/85 border border-emerald-500/60 text-xs shadow-md ${styles.floatingEmote}`}
              >
                <span>{sim.localEmote}</span>
              </div>
            )}

            <div
              className={
                sim.localDir === 'left'
                  ? styles.spriteDirectionLeft
                  : styles.spriteDirectionRight
              }
            >
              <ArcadePetWalkingSprite
                species={localSpecies}
                state={sim.localState}
                theme={localPet.theme}
              />
            </div>

            <span className="mt-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-emerald-400/50 text-[10px] font-semibold text-emerald-300 pointer-events-none select-none">
              {localPet.name}
            </span>
          </div>
        )}

        {hasRemotePet && (
          <div
            data-testid="arcade-pet-remote-screen-pet"
            onClick={handleRemoteClick}
            className={`${styles.petEntity} ${remoteColClass} ${remoteRowClass}`}
          >
            {sim.remoteEmote && (
              <div
                className={`mb-1 px-2 py-0.5 rounded-full bg-black/85 border border-indigo-500/60 text-xs shadow-md ${styles.floatingEmote}`}
              >
                <span>{sim.remoteEmote}</span>
              </div>
            )}

            <div
              className={
                sim.remoteDir === 'left'
                  ? styles.spriteDirectionLeft
                  : styles.spriteDirectionRight
              }
            >
              <ArcadePetWalkingSprite
                species={remoteSpecies}
                state={sim.remoteState}
                theme="galaxy"
              />
            </div>

            <span className="mt-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-indigo-400/50 text-[10px] font-semibold text-indigo-300 pointer-events-none select-none">
              {otherPlayer?.displayName ?? 'Neighbor'}&apos;s Pet
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
