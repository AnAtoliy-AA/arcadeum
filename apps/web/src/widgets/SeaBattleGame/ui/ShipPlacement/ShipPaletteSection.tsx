'use client';

import { memo } from 'react';
import { Text } from 'tamagui';
import { SHIPS } from '../../types';
import {
  ShipPalette,
  ShipItem,
  ShipPreview,
  ShipCell as ShipCellStyled,
  ShipName,
} from '../styles';
import type { SeaBattleTheme } from '../../lib/theme';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface ShipPaletteSectionProps {
  theme: SeaBattleTheme;
  isMobile: boolean;
  placedShipIds: Set<string>;
  selectedShipId: string | null;
  setSelectedShipId: (id: string | null) => void;
  getDragProps: (shipId: string) => {
    draggable: boolean;
    onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  };
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const ShipPaletteSection = memo(
  ({
    theme,
    isMobile,
    placedShipIds,
    selectedShipId,
    setSelectedShipId,
    getDragProps,
    t,
  }: ShipPaletteSectionProps) => {
    const shipItems = SHIPS.map((ship) => {
      const isPlaced = placedShipIds.has(ship.id);
      const isSelected = selectedShipId === ship.id;

      return (
        <ShipItem
          key={ship.id}
          isPlaced={isPlaced}
          backgroundColor={
            isSelected ? theme.accentColor + '33' : theme.boardBackground
          }
          borderColor={isSelected ? theme.accentColor : theme.cellBorder}
          className={isSelected ? 'sb-selected-glow' : undefined}
          onClick={() =>
            !isPlaced && setSelectedShipId(isSelected ? null : ship.id)
          }
          data-testid="ship-palette-item"
          {...getDragProps(ship.id)}
        >
          <ShipPreview>
            {Array(ship.size)
              .fill(null)
              .map((_, i) => (
                <ShipCellStyled key={i} backgroundColor={theme.shipColor} />
              ))}
          </ShipPreview>
          <ShipName color={theme.textColor}>
            {ship.name} ({ship.size}){isPlaced ? ' ✓' : isSelected ? ' ◀' : ''}
          </ShipName>
        </ShipItem>
      );
    });

    return (
      <ShipPalette
        backgroundColor={theme.boardBackground}
        borderColor={theme.cellBorder}
        data-testid="sea-battle-ship-palette"
      >
        {!isMobile && (
          <>
            <Text
              className="ship-palette-title"
              color={theme.textColor}
              fontSize="$4"
              fontWeight="600"
              margin={0}
              marginBottom="$2"
            >
              {t('games.sea_battle_v1.table.state.shipsPalette')}
            </Text>
            <Text
              fontSize={11}
              color={theme.textSecondaryColor}
              textAlign="center"
              marginBottom="$2"
            >
              {t(
                'games.sea_battle_v1.table.actions.dragHint' as TranslationKey,
              )}
            </Text>
          </>
        )}
        {shipItems}
      </ShipPalette>
    );
  },
);
ShipPaletteSection.displayName = 'ShipPaletteSection';
