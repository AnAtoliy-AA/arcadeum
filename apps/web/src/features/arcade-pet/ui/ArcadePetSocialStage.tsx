'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { useGameStore } from '@/features/games/store/gameStore';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';
import styles from './arcade-pet-companion.module.scss';

interface SimState {
  localCol: number;
  localRow: number;
  localDir: 'left' | 'right';
  localState: 'walking' | 'idle' | 'happy' | 'sleeping';
  localEmote: string | null;
  remoteCol: number;
  remoteRow: number;
  remoteDir: 'left' | 'right';
  remoteState: 'walking' | 'idle' | 'happy' | 'sleeping';
  remoteEmote: string | null;
  tick: number;
}

const COL_CLASSES = [
  styles.col0,
  styles.col1,
  styles.col2,
  styles.col3,
  styles.col4,
  styles.col5,
  styles.col6,
  styles.col7,
];

const ROW_CLASSES = [
  styles.row0,
  styles.row1,
  styles.row2,
  styles.row3,
  styles.row4,
  styles.row5,
];

const EMOTE_CYCLE = ['❤️', '😄', '✨', '🎵', '🍰', '👋'];

const INITIAL_SIM: SimState = {
  localCol: 2,
  localRow: 1,
  localDir: 'right',
  localState: 'idle',
  localEmote: '😄',
  remoteCol: 5,
  remoteRow: 2,
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
          const isResting = Math.random() > 0.65;
          if (isResting) {
            return {
              ...prev,
              tick: nextTick,
              localState: 'idle',
              localEmote: EMOTE_CYCLE[nextTick % EMOTE_CYCLE.length] ?? '😄',
            };
          }

          const colDelta =
            Math.random() > 0.5 ? (prev.localDir === 'right' ? 1 : -1) : 0;
          const rowDelta =
            Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;

          let nextCol = prev.localCol + colDelta;
          let nextDir = prev.localDir;
          if (nextCol > 7) {
            nextCol = 7;
            nextDir = 'left';
          } else if (nextCol < 0) {
            nextCol = 0;
            nextDir = 'right';
          }

          const nextRow = Math.max(0, Math.min(5, prev.localRow + rowDelta));

          return {
            ...prev,
            tick: nextTick,
            localCol: nextCol,
            localRow: nextRow,
            localDir: nextDir,
            localState: 'walking',
            localEmote: null,
          };
        }

        const distCol = Math.abs(prev.localCol - prev.remoteCol);
        const distRow = Math.abs(prev.localRow - prev.remoteRow);

        if (distCol <= 1 && distRow <= 1) {
          const walkDirX = nextTick % 3 === 0 ? 1 : nextTick % 3 === 1 ? -1 : 0;
          const walkDirY = nextTick % 2 === 0 ? 1 : -1;

          const nextLCol = Math.max(0, Math.min(6, prev.localCol + walkDirX));
          const nextRCol = Math.max(1, Math.min(7, nextLCol + 1));
          const nextLRow = Math.max(0, Math.min(5, prev.localRow + walkDirY));
          const nextRRow = nextLRow;

          return {
            ...prev,
            tick: nextTick,
            localState: 'happy',
            remoteState: 'happy',
            localEmote: '❤️',
            remoteEmote: '😄',
            localDir: prev.localCol < prev.remoteCol ? 'right' : 'left',
            remoteDir: prev.localCol < prev.remoteCol ? 'left' : 'right',
            localCol: nextLCol,
            localRow: nextLRow,
            remoteCol: nextRCol,
            remoteRow: nextRRow,
          };
        }

        const targetColDir = prev.localCol < prev.remoteCol ? 1 : -1;
        const targetRowDir = prev.localRow < prev.remoteRow ? 1 : -1;

        const nextLCol = Math.max(0, Math.min(7, prev.localCol + targetColDir));
        const nextLRow = Math.max(0, Math.min(5, prev.localRow + targetRowDir));

        const nextRCol = Math.max(
          0,
          Math.min(7, prev.remoteCol - targetColDir),
        );
        const nextRRow = Math.max(
          0,
          Math.min(5, prev.remoteRow - targetRowDir),
        );

        return {
          ...prev,
          tick: nextTick,
          localCol: nextLCol,
          localRow: nextLRow,
          localDir: targetColDir === 1 ? 'right' : 'left',
          remoteCol: nextRCol,
          remoteRow: nextRRow,
          remoteDir: targetColDir === 1 ? 'left' : 'right',
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

  const localColClass = COL_CLASSES[sim.localCol] ?? styles.col2;
  const localRowClass = ROW_CLASSES[sim.localRow] ?? styles.row1;

  const remoteColClass = COL_CLASSES[sim.remoteCol] ?? styles.col5;
  const remoteRowClass = ROW_CLASSES[sim.remoteRow] ?? styles.row2;

  return (
    <div
      className={styles.stageContainer}
      data-testid="arcade-pet-social-stage"
    >
      <div className={styles.petTrack}>
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
