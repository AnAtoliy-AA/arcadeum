'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  createInitialPet,
  executePetAction,
  TREAT_EFFECTS,
  type GameTreatId,
  type PetActionType,
  type PetSpecies,
  type PetState,
} from '@arcadeum/games-core';
import type { ArcadePetGameProps } from '../types';
import { ArcadePetLcdScreen } from './ArcadePetLcdScreen';
import { ArcadePetControls } from './ArcadePetControls';
import { ArcadePetMinigame } from './ArcadePetMinigame';
import { getArcadePetTheme } from '../lib/theme';

export const ArcadePetGame: React.FC<ArcadePetGameProps> = ({
  gameOptions,
  currentUserId,
}) => {
  const theme = useMemo(
    () => getArcadePetTheme(gameOptions?.theme ?? 'retro'),
    [gameOptions?.theme],
  );

  const [pet, setPet] = useState<PetState>(() =>
    createInitialPet({
      id: currentUserId || 'local-pet',
      name: 'ArcadePet',
      species: 'slime',
      theme: gameOptions?.theme ?? 'retro',
    }),
  );

  const [activeMenuIndex, setActiveMenuIndex] = useState<number>(0);
  const [screenMessage, setScreenMessage] = useState<string | undefined>(
    undefined,
  );
  const [showMinigame, setShowMinigame] = useState<boolean>(false);
  const [showTreatPicker, setShowTreatPicker] = useState<boolean>(false);
  const [hatchSpecies, setHatchSpecies] = useState<PetSpecies>('dragon');
  const [petNameInput, setPetNameInput] = useState<string>('BitBuddy');
  const [coins, setCoins] = useState<number>(10);

  const playBeep = useCallback(
    (freq = 440, type: OscillatorType = 'square') => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch {}
    },
    [],
  );

  const handleAction = useCallback(
    (action: PetActionType, treatId?: GameTreatId) => {
      if (action === 'feed_snack') {
        if (coins < 1) {
          playBeep(260, 'sawtooth');
          setScreenMessage('NEED 1 COIN');
          return;
        }
        setCoins((c) => Math.max(0, c - 1));
      }

      playBeep(action === 'sleep' ? 300 : 600);
      const result = executePetAction(pet, action, {
        treatId,
        species: hatchSpecies,
        theme: gameOptions?.theme,
      });

      if (result.success) {
        setPet(result.state);
        setScreenMessage(result.messageCode.toUpperCase());
      } else {
        setScreenMessage(result.messageCode.toUpperCase());
      }
    },
    [pet, hatchSpecies, gameOptions?.theme, playBeep, coins],
  );

  const handlePressA = () => {
    playBeep(520);
    setActiveMenuIndex((prev) => (prev + 1) % 8);
  };

  const handlePressB = () => {
    if (pet.stage === 'egg') {
      handleAction('hatch');
      return;
    }

    const actionMap: PetActionType[] = [
      'feed_meal',
      'feed_snack',
      'play',
      'clean',
      pet.isSleeping ? 'wake' : 'sleep',
      'heal',
      'train',
      'feed_treat',
    ];

    const chosenAction = actionMap[activeMenuIndex];
    if (chosenAction === 'play') {
      setShowMinigame(true);
      return;
    }
    if (chosenAction === 'feed_treat') {
      setShowTreatPicker(true);
      return;
    }
    handleAction(chosenAction);
  };

  const handlePressC = () => {
    playBeep(380);
    if (pet.isSleeping) {
      handleAction('wake');
      return;
    }
    setShowMinigame(false);
    setShowTreatPicker(false);
    setScreenMessage(undefined);
  };

  const availableTreats = useMemo(
    () =>
      (Object.keys(pet.inventory) as GameTreatId[]).filter(
        (id) => pet.inventory[id] > 0,
      ),
    [pet.inventory],
  );

  return (
    <div
      className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-4xl mx-auto p-4 select-none"
      style={
        {
          '--arcade-shell-bg': theme.shellBg,
          '--arcade-shell-border': theme.shellBorder,
          '--arcade-screen-bg': theme.screenBg,
          '--arcade-pixel-color': theme.pixelColor,
          '--arcade-btn-a': theme.buttonA,
          '--arcade-btn-b': theme.buttonB,
          '--arcade-btn-c': theme.buttonC,
          '--arcade-glow': theme.glow,
        } as React.CSSProperties
      }
    >
      <div className="relative flex flex-col items-center w-full max-w-sm p-6 sm:p-8 rounded-[40px] bg-[var(--arcade-shell-bg,#18181b)] border-8 border-[var(--arcade-shell-border,#3f3f46)] shadow-2xl">
        <div className="w-full flex items-center justify-between pb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">👾</span>
            <span className="font-extrabold uppercase tracking-widest text-sm text-white">
              {pet.name}
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-black/40 text-white/80 border border-white/20">
            {pet.stage}
          </span>
        </div>

        {showMinigame ? (
          <ArcadePetMinigame
            onComplete={(won) => {
              if (won) {
                handleAction('play');
              }
              setShowMinigame(false);
            }}
            onCancel={() => setShowMinigame(false)}
          />
        ) : showTreatPicker ? (
          <div className="flex flex-col items-center justify-center p-3 bg-black/70 rounded-lg text-white font-mono gap-2 w-full h-64 overflow-y-auto">
            <div className="text-xs uppercase font-bold text-amber-400">
              Select Cross-Game Treat
            </div>
            {availableTreats.length === 0 ? (
              <div className="text-xs text-neutral-400 text-center py-4">
                No treats in inventory! Play Arcadeum matches to earn treats.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full">
                {availableTreats.map((treatId) => (
                  <button
                    key={treatId}
                    type="button"
                    onClick={() => {
                      handleAction('feed_treat', treatId);
                      setShowTreatPicker(false);
                    }}
                    className="flex items-center justify-between px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-left"
                  >
                    <span>{TREAT_EFFECTS[treatId].label}</span>
                    <span className="text-emerald-400">
                      x{pet.inventory[treatId]}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowTreatPicker(false)}
              className="text-xs text-neutral-400 underline mt-2"
            >
              Back
            </button>
          </div>
        ) : (
          <ArcadePetLcdScreen
            stage={pet.stage}
            species={pet.species}
            mood={pet.mood}
            isSleeping={pet.isSleeping}
            isSick={pet.isSick}
            poopCount={pet.poopCount}
            activeMenuIndex={activeMenuIndex}
            messageText={screenMessage}
          />
        )}

        <ArcadePetControls
          onPressA={handlePressA}
          onPressB={handlePressB}
          onPressC={handlePressC}
          isSleeping={pet.isSleeping}
          isEgg={pet.stage === 'egg'}
        />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex flex-col">
            <span className="text-base font-bold text-white">Pet Status</span>
            <span className="text-xs text-neutral-400">
              Level {pet.stats.level} (XP: {pet.stats.xp})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              data-testid="arcade-pet-game-coins"
              className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
            >
              🪙 {coins} Coins
            </span>
            <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
              Weight: {pet.stats.weight}g
            </span>
          </div>
        </div>

        {pet.stage === 'egg' ? (
          <div className="flex flex-col gap-3 py-2">
            <label className="text-xs font-bold text-neutral-300">
              Pet Name:
              <input
                type="text"
                value={petNameInput}
                onChange={(e) => setPetNameInput(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-white text-sm"
              />
            </label>
            <label className="text-xs font-bold text-neutral-300">
              Choose Species:
              <select
                value={hatchSpecies}
                onChange={(e) => setHatchSpecies(e.target.value as PetSpecies)}
                className="w-full mt-1 px-3 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-white text-sm"
              >
                <option value="dragon">🐲 Dragon</option>
                <option value="cyber_cat">🐱 Cyber Cat</option>
                <option value="slime">👾 Slime</option>
                <option value="dino">🦖 Dino</option>
                <option value="blob">🐡 Cosmic Blob</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setPet((prev) => ({ ...prev, name: petNameInput }));
                handleAction('hatch');
              }}
              className="w-full mt-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-colors"
            >
              Hatch Egg
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
              <span className="text-neutral-400">🍖 Hunger</span>
              <div className="w-full h-2 rounded bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${pet.stats.hunger}%` }}
                />
              </div>
              <span className="font-bold text-white text-right">
                {pet.stats.hunger}%
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
              <span className="text-neutral-400">💖 Happiness</span>
              <div className="w-full h-2 rounded bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${pet.stats.happiness}%` }}
                />
              </div>
              <span className="font-bold text-white text-right">
                {pet.stats.happiness}%
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
              <span className="text-neutral-400">⚡ Energy</span>
              <div className="w-full h-2 rounded bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${pet.stats.energy}%` }}
                />
              </div>
              <span className="font-bold text-white text-right">
                {pet.stats.energy}%
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
              <span className="text-neutral-400">🛁 Hygiene</span>
              <div className="w-full h-2 rounded bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${pet.stats.hygiene}%` }}
                />
              </div>
              <span className="font-bold text-white text-right">
                {pet.stats.hygiene}%
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
              <span className="text-neutral-400">🏆 Discipline</span>
              <div className="w-full h-2 rounded bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${pet.stats.discipline}%` }}
                />
              </div>
              <span className="font-bold text-white text-right">
                {pet.stats.discipline}%
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
              <span className="text-neutral-400">🩺 Health</span>
              <div className="w-full h-2 rounded bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${pet.stats.health}%` }}
                />
              </div>
              <span className="font-bold text-white text-right">
                {pet.stats.health}%
              </span>
            </div>
          </div>
        )}

        <div className="border-t border-neutral-800 pt-3 flex items-center justify-between text-xs text-neutral-400">
          <span>Theme: {gameOptions?.theme ?? 'Retro'}</span>
          <span>Offline state synced</span>
        </div>
      </div>
    </div>
  );
};
