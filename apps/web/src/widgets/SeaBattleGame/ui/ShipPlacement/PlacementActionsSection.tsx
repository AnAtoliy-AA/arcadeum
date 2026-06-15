'use client';

import { memo } from 'react';
import type { ShipConfig } from '../../types';
import { ActionButton, RotateButton, PlacementActions } from '../styles';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface PlacementActionsSectionProps {
  isMobile: boolean;
  selectedShip: ShipConfig | null;
  isVertical: boolean;
  isAllShipsPlaced: boolean;
  isPlacementComplete: boolean;
  placedShipIdsSize: number;
  onRotate: () => void;
  onConfirm: () => void;
  onReset: () => void;
  onAutoPlace?: () => void;
  onCancelMove?: () => void;
  isMovingShip?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const PlacementActionsSection = memo(
  ({
    isMobile,
    selectedShip,
    isVertical,
    isAllShipsPlaced,
    isPlacementComplete,
    placedShipIdsSize,
    onRotate,
    onConfirm,
    onReset,
    onAutoPlace,
    onCancelMove,
    isMovingShip,
    t,
  }: PlacementActionsSectionProps) => {
    const btnSize = isMobile ? 'sm' : 'lg';

    return (
      <PlacementActions>
        {isMovingShip && onCancelMove && (
          <ActionButton
            variant="secondary"
            size={btnSize}
            onClick={onCancelMove}
            style={{
              background: 'rgba(251, 191, 36, 0.15)',
              borderColor: 'rgba(251, 191, 36, 0.5)',
            }}
          >
            ✕{' '}
            {t(
              'games.sea_battle_v1.table.actions.cancelMove' as TranslationKey,
            ) || 'Cancel move'}
          </ActionButton>
        )}
        {!isMovingShip && (
          <RotateButton
            variant="secondary"
            size={btnSize}
            onClick={onRotate}
            disabled={!selectedShip}
          >
            ↻ {t('games.sea_battle_v1.table.actions.rotate')} (
            {isVertical
              ? t('games.sea_battle_v1.table.state.vertical')
              : t('games.sea_battle_v1.table.state.horizontal')}
            )
          </RotateButton>
        )}
        <ActionButton
          variant="primary"
          size={btnSize}
          disabled={!isAllShipsPlaced || isPlacementComplete}
          onClick={onConfirm}
          className={
            isAllShipsPlaced && !isPlacementComplete
              ? 'sb-valid-pulse'
              : undefined
          }
          style={
            isAllShipsPlaced && !isPlacementComplete
              ? {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 2px 12px rgba(16,185,129,0.5)',
                }
              : undefined
          }
        >
          {isPlacementComplete
            ? t('games.sea_battle_v1.table.actions.waitingForOthers')
            : `⚓ ${t('games.sea_battle_v1.table.actions.confirmPlacement')}`}
        </ActionButton>
        {placedShipIdsSize > 0 && !isPlacementComplete && (
          <ActionButton variant="secondary" size={btnSize} onClick={onReset}>
            ↺ {t('games.sea_battle_v1.table.actions.resetPlacement')}
          </ActionButton>
        )}
        {!isPlacementComplete && onAutoPlace && (
          <ActionButton
            variant="secondary"
            size={btnSize}
            onClick={onAutoPlace}
          >
            🎲{' '}
            {placedShipIdsSize > 0
              ? t('games.sea_battle_v1.table.actions.randomize')
              : t('games.sea_battle_v1.table.actions.autoPlace')}
          </ActionButton>
        )}
      </PlacementActions>
    );
  },
);
PlacementActionsSection.displayName = 'PlacementActionsSection';
