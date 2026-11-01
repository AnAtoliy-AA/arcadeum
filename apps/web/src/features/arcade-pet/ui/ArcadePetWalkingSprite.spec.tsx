import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';

describe('ArcadePetWalkingSprite', () => {
  it('renders cyber_cat walking sprite', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="cyber_cat" state="walking" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders dragon happy sprite', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="dragon" state="happy" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders dino sleeping sprite', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="dino" state="sleeping" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders blob idle sprite', () => {
    const { container } = render(
      <ArcadePetWalkingSprite species="blob" state="idle" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
