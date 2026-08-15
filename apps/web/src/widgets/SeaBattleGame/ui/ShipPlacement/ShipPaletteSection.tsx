'use client';

import { memo } from 'react';
import type { ShipConfig } from '../../types';
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
  activeShips: ShipConfig[];
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
    activeShips,
    t,
  }: ShipPaletteSectionProps) => {
    const shipItems = [...activeShips]
      .sort((a, b) => b.size - a.size)
      .map((ship) => {
        const isPlaced = placedShipIds.has(ship.id);
        const isSelected = selectedShipId === ship.id;

        return (
          <ShipItem
            className={isSelected ? 'sb-selected-glow' : undefined}
            style={{
              backgroundColor: isSelected
                ? theme.accentColor + '33'
                : theme.boardBackground,
              borderColor: isSelected ? theme.accentColor : theme.cellBorder,
            }}
            key={ship.id}
            isPlaced={isPlaced}
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
              {ship.name} ({ship.size})
              {isPlaced ? ' ✓' : isSelected ? ' ◀' : ''}
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
            <span
              className={
                '"box-border text-[18px] font-semibold -m-0 -mb-2 ship-palette-title"'
              }
              style={{ color: theme.textColor }}
            >
              {t('games.sea_battle_v1.table.state.shipsPalette')}
            </span>
            <span
              className={'"box-border text-[11px] text-center -mb-2"'}
              style={{ color: theme.textSecondaryColor }}
            >
              {t(
                'games.sea_battle_v1.table.actions.dragHint' as TranslationKey,
              )}
            </span>
          </>
        )}
        {shipItems}
      </ShipPalette>
    );
  },
);
ShipPaletteSection.displayName = 'ShipPaletteSection';
