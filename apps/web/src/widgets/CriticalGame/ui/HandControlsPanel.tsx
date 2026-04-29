import React from 'react';
import type { GameVariant } from '@arcadeum/ui';
import { HandLayoutDropdown } from './HandLayoutDropdown';
import { HandControls, HandToggleButton } from './styles';
import type { HandLayoutMode } from '../types';

interface HandControlsPanelProps {
  showNames: boolean;
  showDescriptions: boolean;
  handLayout: HandLayoutMode;
  setShowNames: (v: boolean) => void;
  setShowDescriptions: (v: boolean) => void;
  setHandLayout?: (mode: HandLayoutMode) => void;
  cardVariant?: string;
  t: (key: string) => string;
}

export function HandControlsPanel({
  showNames,
  showDescriptions,
  handLayout,
  setShowNames,
  setShowDescriptions,
  setHandLayout,
  cardVariant,
  t,
}: HandControlsPanelProps) {
  const variant = cardVariant as GameVariant | undefined;
  return (
    <HandControls>
      <HandToggleButton
        $variant={variant}
        variant="secondary"
        onClick={() => setShowNames(!showNames)}
      >
        {showNames
          ? t('games.table.hand.hideNames') || 'Hide Names'
          : t('games.table.hand.showNames') || 'Show Names'}
      </HandToggleButton>
      <HandToggleButton
        $variant={variant}
        variant="secondary"
        onClick={() => setShowDescriptions(!showDescriptions)}
      >
        {showDescriptions
          ? t('games.table.hand.hideDescriptions') || 'Hide Descriptions'
          : t('games.table.hand.showDescriptions') || 'Show Descriptions'}
      </HandToggleButton>
      {setHandLayout && (
        <HandLayoutDropdown
          layout={handLayout}
          onChange={setHandLayout}
          variant={variant}
          t={t}
        />
      )}
    </HandControls>
  );
}
