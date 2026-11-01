import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';

describe('ArcadePetWalkingSprite', () => {
  it('renders cyber_cat walking sprite with cat walk animation', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="cyber_cat" state="walking" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/catWalkAnimation/);
  });

  it('renders dragon happy sprite with dragon breath animation', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="dragon" state="happy" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/dragonBreathAnimation/);
  });

  it('renders dino walking sprite with stomp animation', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="dino" state="walking" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/dinoStompAnimation/);
  });

  it('renders dino sleeping sprite', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="dino" state="sleeping" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/petSleepAnimation/);
  });

  it('renders blob walking sprite with bounce animation', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="blob" state="walking" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/blobBounceAnimation/);
  });

  it('renders slime walking sprite with slide animation', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="slime" state="walking" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/slimeSlideAnimation/);
  });
});
