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
import { ArcadePetGameStatus } from './ArcadePetGameStatus';
import { Button } from '@arcadeum/ui';
import { stageTranslationKey } from '@/features/arcade-pet/lib/arcade-pet-stage-key';
import { ArcadePetThemeProvider } from '../lib/ArcadePetThemeContext';
import { ArcadePetMinigame } from './ArcadePetMinigame';
import { useTranslation } from '@/shared/i18n/useTranslation';

export const ArcadePetGame: React.FC<ArcadePetGameProps> = ({
  gameOptions,
  currentUserId,
}) => {
  const { t } = useTranslation();
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
          setScreenMessage(t('arcadePetCompanion.game.needCoin'));
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
    [pet, hatchSpecies, gameOptions?.theme, playBeep, coins, t],
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
    <ArcadePetThemeProvider variant={gameOptions?.theme ?? 'retro'}>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-4xl mx-auto p-4 select-none">
        <div className="relative flex flex-col items-center w-full max-w-sm p-6 sm:p-8 rounded-[40px] bg-[var(--arcade-shell-bg,var(--background))] border-8 border-[var(--arcade-shell-border,var(--borderColor))] shadow-2xl">
          <div className="w-full flex items-center justify-between pb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">👾</span>
              <span className="font-extrabold uppercase tracking-widest text-sm text-white">
                {pet.name}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-black/40 text-white/80 border border-white/20">
              {t(stageTranslationKey(pet.stage))}
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
            <div className="flex h-64 w-full flex-col items-center justify-center gap-2 overflow-y-auto rounded-lg bg-black/70 p-3 font-mono text-white">
              <div className="text-xs font-bold uppercase text-white">
                {t('arcadePetCompanion.game.treatTitle')}
              </div>
              {availableTreats.length === 0 ? (
                <div className="py-4 text-center text-xs text-white/80">
                  {t('arcadePetCompanion.game.noTreats')}
                </div>
              ) : (
                <div className="flex w-full flex-col gap-1.5">
                  {availableTreats.map((treatId) => (
                    <Button
                      key={treatId}
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        handleAction('feed_treat', treatId);
                        setShowTreatPicker(false);
                      }}
                      className="w-full justify-between text-xs font-bold"
                    >
                      <span>{TREAT_EFFECTS[treatId].label}</span>
                      <span>x{pet.inventory[treatId]}</span>
                    </Button>
                  ))}
                </div>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowTreatPicker(false)}
                className="mt-2 text-xs"
              >
                {t('arcadePetCompanion.game.back')}
              </Button>
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

        <ArcadePetGameStatus
          pet={pet}
          coins={coins}
          themeLabel={gameOptions?.theme ?? 'Retro'}
          petNameInput={petNameInput}
          onPetNameChange={setPetNameInput}
          hatchSpecies={hatchSpecies}
          onHatchSpeciesChange={setHatchSpecies}
          onHatch={() => {
            setPet((prev) => ({ ...prev, name: petNameInput }));
            handleAction('hatch');
          }}
        />
      </div>
    </ArcadePetThemeProvider>
  );
};
