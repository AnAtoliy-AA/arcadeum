'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { useGameStore } from '@/features/games/store/gameStore';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';
import styles from './arcade-pet-companion.module.scss';

interface SimState {
  localSlot: number;
  localDir: 'left' | 'right';
  localState: 'walking' | 'idle' | 'happy' | 'sleeping';
  localEmote: string | null;
  remoteSlot: number;
  remoteDir: 'left' | 'right';
  remoteState: 'walking' | 'idle' | 'happy' | 'sleeping';
  remoteEmote: string | null;
  tick: number;
}

const SLOT_CLASSES = [
  styles.slot0,
  styles.slot1,
  styles.slot2,
  styles.slot3,
  styles.slot4,
  styles.slot5,
  styles.slot6,
  styles.slot7,
  styles.slot8,
];

const EMOTE_CYCLE = ['❤️', '😄', '✨', '🎵', '🍰', '👋'];

const INITIAL_SIM: SimState = {
  localSlot: 2,
  localDir: 'right',
  localState: 'idle',
  localEmote: '😄',
  remoteSlot: 6,
  remoteDir: 'left',
  remoteState: 'idle',
  remoteEmote: '👋',
  tick: 0,
};

export function ArcadePetSocialStage({
  onOpenCare,
}: {
  onOpenCare: () => void;
}) {
  const localPet = useArcadePetStore((s) => s.pet);
  const room = useGameStore((s) => s.room);
  const members = useMemo(() => room?.members ?? [], [room?.members]);

  const [sim, setSim] = useState<SimState>(INITIAL_SIM);

  const otherPlayer = useMemo(() => {
    return members.find((m) => m.id && m.id !== localPet?.id) ?? null;
  }, [members, localPet?.id]);

  const hasFriend = Boolean(otherPlayer);

  useEffect(() => {
    if (!localPet) return;

    const timer = setInterval(() => {
      setSim((prev) => {
        const nextTick = prev.tick + 1;
        if (!hasFriend) {
          const step = Math.random() > 0.45 ? 1 : 0;
          if (step === 0) {
            return {
              ...prev,
              tick: nextTick,
              localState: 'idle',
              localEmote: EMOTE_CYCLE[nextTick % EMOTE_CYCLE.length] ?? '😄',
            };
          }
          let nextDir = prev.localDir;
          let nextSlot =
            prev.localDir === 'right' ? prev.localSlot + 1 : prev.localSlot - 1;
          if (nextSlot > 7) {
            nextSlot = 7;
            nextDir = 'left';
          } else if (nextSlot < 1) {
            nextSlot = 1;
            nextDir = 'right';
          }
          return {
            ...prev,
            tick: nextTick,
            localSlot: nextSlot,
            localDir: nextDir,
            localState: 'walking',
            localEmote: null,
          };
        }

        const distance = Math.abs(prev.localSlot - prev.remoteSlot);
        if (distance <= 1) {
          const walkTogether = nextTick % 2 === 0 ? 1 : -1;
          const nextL = Math.max(0, Math.min(7, prev.localSlot + walkTogether));
          const nextR = Math.max(
            1,
            Math.min(8, prev.remoteSlot + walkTogether),
          );
          return {
            ...prev,
            tick: nextTick,
            localState: 'happy',
            remoteState: 'happy',
            localEmote: '❤️',
            remoteEmote: '😄',
            localDir: prev.localSlot < prev.remoteSlot ? 'right' : 'left',
            remoteDir: prev.localSlot < prev.remoteSlot ? 'left' : 'right',
            localSlot: nextL,
            remoteSlot: nextR,
          };
        }

        const localMoveRight = prev.localSlot < prev.remoteSlot;
        return {
          ...prev,
          tick: nextTick,
          localSlot: localMoveRight
            ? Math.min(prev.localSlot + 1, 7)
            : Math.max(prev.localSlot - 1, 1),
          localDir: localMoveRight ? 'right' : 'left',
          remoteSlot: localMoveRight
            ? Math.max(prev.remoteSlot - 1, 1)
            : Math.min(prev.remoteSlot + 1, 7),
          remoteDir: localMoveRight ? 'left' : 'right',
          localState: 'walking',
          remoteState: 'walking',
          localEmote: null,
          remoteEmote: null,
        };
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [hasFriend, localPet]);

  const handleLocalClick = useCallback(() => {
    setSim((prev) => ({
      ...prev,
      localState: 'happy',
      localEmote: '❤️',
    }));
    onOpenCare();
  }, [onOpenCare]);

  const handleRemoteClick = useCallback(() => {
    setSim((prev) => ({
      ...prev,
      remoteState: 'happy',
      remoteEmote: '✨',
    }));
  }, []);

  if (!localPet) return null;

  const localSpecies: PetSpecies =
    localPet.stage === 'egg' ? 'blob' : localPet.species;
  const remoteSpecies: PetSpecies =
    otherPlayer?.displayName?.length && otherPlayer.displayName.length % 2 === 0
      ? 'cyber_cat'
      : 'dragon';

  const localSlotClass = SLOT_CLASSES[sim.localSlot] ?? styles.slot2;
  const remoteSlotClass = SLOT_CLASSES[sim.remoteSlot] ?? styles.slot6;

  return (
    <div
      className={styles.stageContainer}
      data-testid="arcade-pet-social-stage"
    >
      <div className={styles.petTrack}>
        <div
          data-testid="arcade-pet-local-screen-pet"
          onClick={handleLocalClick}
          className={`${styles.petEntity} ${localSlotClass}`}
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
            />
          </div>

          <span className="mt-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-emerald-400/50 text-[10px] font-semibold text-emerald-300 pointer-events-none select-none">
            {localPet.name}
          </span>
        </div>

        {hasFriend && (
          <div
            data-testid="arcade-pet-remote-screen-pet"
            onClick={handleRemoteClick}
            className={`${styles.petEntity} ${remoteSlotClass}`}
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
              />
            </div>

            <span className="mt-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-indigo-400/50 text-[10px] font-semibold text-indigo-300 pointer-events-none select-none">
              {otherPlayer?.displayName ?? 'Friend'}&apos;s Pet
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
