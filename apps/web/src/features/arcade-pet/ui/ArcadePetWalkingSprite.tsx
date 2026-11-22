import React from 'react';
import type { PetSpecies, PetStage } from '@arcadeum/games-core';
import styles from './arcade-pet-sprite.module.scss';
import companionStyles from './arcade-pet-companion.module.scss';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';
import {
  CatArt,
  DinoArt,
  DragonArt,
  EggArt,
  SlimeArt,
} from './ArcadePetSpeciesArt';

interface ArcadePetWalkingSpriteProps {
  species: PetSpecies;
  state: 'walking' | 'idle' | 'happy' | 'sleeping';
  className?: string;
  theme?: string;
  stage?: PetStage;
}

export function ArcadePetWalkingSprite({
  species,
  state,
  className = '',
  theme = 'retro',
  stage,
}: ArcadePetWalkingSpriteProps) {
  const isWalking = state === 'walking';
  const isHappy = state === 'happy';
  const isSleeping = state === 'sleeping';

  const glow = (SPECIES_PALETTE[theme] ?? SPECIES_PALETTE.retro).glow;

  const walkClass =
    species === 'cyber_cat'
      ? styles.catWalkAnimation
      : species === 'dragon'
        ? styles.dragonFlyAnimation
        : species === 'dino'
          ? styles.dinoStompAnimation
          : species === 'blob'
            ? styles.blobBounceAnimation
            : styles.slimeSlideAnimation;

  const happyClass =
    species === 'cyber_cat'
      ? styles.catPounceAnimation
      : species === 'dragon'
        ? styles.dragonBreathAnimation
        : species === 'dino'
          ? styles.dinoRoarAnimation
          : species === 'blob'
            ? styles.blobSpinAnimation
            : styles.slimeBubbleAnimation;

  const animationClass = isHappy
    ? happyClass
    : isWalking
      ? walkClass
      : isSleeping
        ? styles.petSleepAnimation
        : styles.petSmileAnimation;

  const containerClass = `${animationClass} ${companionStyles.aura} ${className} w-14 h-14`;
  const containerStyle = { '--pet-glow': glow } as React.CSSProperties;

  if (stage === 'egg') {
    return (
      <div
        className={containerClass}
        style={containerStyle}
        data-testid="arcade-pet-egg-sprite"
      >
        <EggArt />
      </div>
    );
  }

  if (species === 'cyber_cat') {
    return (
      <div className={containerClass} style={containerStyle}>
        <CatArt
          isWalking={isWalking}
          isHappy={isHappy}
          isSleeping={isSleeping}
        />
      </div>
    );
  }

  if (species === 'dragon') {
    return (
      <div className={containerClass} style={containerStyle}>
        <DragonArt
          isWalking={isWalking}
          isHappy={isHappy}
          isSleeping={isSleeping}
        />
      </div>
    );
  }

  if (species === 'dino') {
    return (
      <div className={containerClass} style={containerStyle}>
        <DinoArt
          isWalking={isWalking}
          isHappy={isHappy}
          isSleeping={isSleeping}
        />
      </div>
    );
  }

  return (
    <div className={containerClass} style={containerStyle}>
      <SlimeArt
        isWalking={isWalking}
        isHappy={isHappy}
        isSleeping={isSleeping}
      />
    </div>
  );
}
