import React, { useState } from 'react';
import { HandLayoutMode } from '../types';
import { HAND_LAYOUT_OPTIONS } from '../lib/constants';
import {
  DropdownContainer,
  DropdownTrigger,
  DropdownList,
  DropdownItem,
} from './styles';

interface HandLayoutDropdownProps {
  layout: HandLayoutMode;
  onChange: (layout: HandLayoutMode) => void;
  variant?: string;
  t: (key: string) => string;
}

export const HandLayoutDropdown: React.FC<HandLayoutDropdownProps> = ({
  layout,
  onChange,
  variant,
  t,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on outside click is handled by a backdrop or just simple onBlur
  // Here we'll use a simple backdrop for simplicity if open

  const getLabel = (mode: HandLayoutMode) => {
    switch (mode) {
      case 'linear':
        return t('games.table.hand.layout.scroll') || 'Scroll';
      case 'grid-3':
        return t('games.table.hand.layout.grid3') || 'Grid 3x';
      case 'grid-4':
        return t('games.table.hand.layout.grid4') || 'Grid 4x';
      case 'grid-5':
        return t('games.table.hand.layout.grid5') || 'Grid 5x';
      case 'grid-6':
        return t('games.table.hand.layout.grid6') || 'Grid 6x';
      case 'grid':
      default:
        return t('games.table.hand.layout.grid') || 'Auto Grid';
    }
  };

  return (
    <DropdownContainer>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      <DropdownTrigger
        data-testid="layout-trigger"
        $variant={variant}
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {getLabel(layout)}
      </DropdownTrigger>
      {isOpen && (
        <DropdownList $variant={variant}>
          {HAND_LAYOUT_OPTIONS.map((mode) => (
            <DropdownItem
              key={mode}
              $variant={variant}
              $isActive={layout === mode}
              onClick={() => {
                onChange(mode);
                setIsOpen(false);
              }}
            >
              {getLabel(mode)}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};
