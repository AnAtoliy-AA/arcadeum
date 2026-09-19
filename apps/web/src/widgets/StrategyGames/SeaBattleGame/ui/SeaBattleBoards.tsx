'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { Card, Typography } from '@arcadeum/ui';
import { ShipPlacementBoard } from './ShipPlacementBoard';
import { AttackBoard } from './AttackBoard';
import { TurnTimer } from './TurnTimer';
import { ShipAbilitiesPanel } from './ShipAbilitiesPanel';
import { SeaBattleWeaponsBar, type WeaponMode } from './SeaBattleWeaponsBar';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import type {
  SeaBattlePlayerState,
  SeaBattleSnapshot,
  SeaBattleTeam,
  ShipCell,
} from '../types';

function getBoxCells(
  targetPlayerId: string,
  row: number,
  col: number,
  radius: number,
  gridSize: number,
): Set<string> {
  const cells = new Set<string>();
  const rStart = row - radius;
  const rEnd = row + radius;
  const cStart = col - radius;
  const cEnd = col + radius;
  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        cells.add(`${targetPlayerId}-${r}-${c}`);
      }
    }
  }
  return cells;
}

interface SeaBattleBoardsProps {
  isPlacementPhase: boolean;
  currentPlayer: SeaBattlePlayerState | null;
  placeShip: (shipId: string, cells: ShipCell[]) => void;
  moveShip: (shipId: string, cells: ShipCell[]) => void;
  confirmPlacement: (
    ships?: Array<{ shipId: string; cells: ShipCell[] }>,
  ) => void;
  resetPlacement: () => void;
  isPlacementComplete: boolean;
  handleAutoPlace: () => void;
  isBattlePhase: boolean;
  isGameOver: boolean;
  teamMode: boolean;
  winnerTeam: SeaBattleTeam | null | undefined;
  snapshot: SeaBattleSnapshot | null;
  currentUserId: string | null;
  currentTurnPlayerId: string | null;
  isMyTurn: boolean;
  attack: (targetPlayerId: string, row: number, col: number) => void;
  onSonar?: (targetPlayerId: string, row?: number, col?: number) => void;
  onRadar?: (targetPlayerId: string, row?: number, col?: number) => void;
  onShipAbility?: (
    abilityId: string,
    targetPlayerId?: string,
    row?: number,
    col?: number,
  ) => void;
  resolveDisplayNameBound: (
    id?: string | null,
    fallback?: string | null,
  ) => string;
  teammateIds?: string[];
  teams?: SeaBattleTeam[];
  highlightedCells?: { row: number; col: number }[];
}

export function SeaBattleBoards({
  isPlacementPhase,
  currentPlayer,
  placeShip,
  moveShip,
  confirmPlacement,
  resetPlacement,
  isPlacementComplete,
  handleAutoPlace,
  isBattlePhase,
  isGameOver,
  teamMode,
  winnerTeam,
  snapshot,
  currentUserId,
  currentTurnPlayerId,
  isMyTurn,
  attack,
  onSonar,
  onRadar,
  onShipAbility,
  resolveDisplayNameBound,
  teammateIds,
  teams,
  highlightedCells = [],
}: SeaBattleBoardsProps) {
  const { t } = useTranslation();
  const [weaponMode, setWeaponMode] = useState<WeaponMode>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const opponents = snapshot?.players.filter(
    (p) =>
      p.playerId !== currentUserId &&
      p.alive &&
      (!teammateIds || !teammateIds.includes(p.playerId)),
  );

  const sonarUsed =
    snapshot?.specialWeaponUsage?.[currentUserId ?? '']?.sonarUsed ?? false;
  const radarUsed =
    snapshot?.specialWeaponUsage?.[currentUserId ?? '']?.radarUsed ?? false;
  const hasSonar = !!snapshot?.specialWeapons?.sonar;
  const hasRadar = !!snapshot?.specialWeapons?.radar;
  const isSonarDisabled = sonarUsed || !isMyTurn;
  const isRadarDisabled = radarUsed || !isMyTurn;

  const gridSize = snapshot?.gridSize ?? 10;

  const handleWeaponFire = useCallback(
    (targetPlayerId: string, row: number, col: number) => {
      if (!weaponMode) return;
      if (weaponMode.weapon === 'sonar' && onSonar) {
        onSonar(targetPlayerId, row, col);
      } else if (weaponMode.weapon === 'radar' && onRadar) {
        const axis = weaponMode.radarAxis ?? 'row';
        onRadar(
          targetPlayerId,
          axis === 'row' ? row : undefined,
          axis === 'col' ? col : undefined,
        );
      } else if (
        weaponMode.weapon === 'ability' &&
        onShipAbility &&
        weaponMode.abilityId
      ) {
        onShipAbility(weaponMode.abilityId, targetPlayerId, row, col);
      }
      setWeaponMode(null);
      setHoveredCell(null);
    },
    [weaponMode, onSonar, onRadar, onShipAbility],
  );

  const handleShipAbilityClick = useCallback(
    (abilityId: string) => {
      if (!isMyTurn || isGameOver) return;
      if (
        weaponMode?.weapon === 'ability' &&
        weaponMode.abilityId === abilityId
      ) {
        setWeaponMode(null);
        setHoveredCell(null);
        return;
      }
      const defaultTargetId = opponents?.[0]?.playerId;
      if (abilityId === 'silent_run') {
        onShipAbility?.(abilityId);
        setWeaponMode(null);
        setHoveredCell(null);
        return;
      }
      if (abilityId === 'barrage') {
        if (defaultTargetId) {
          onShipAbility?.(abilityId, defaultTargetId);
        }
        setWeaponMode(null);
        setHoveredCell(null);
        return;
      }
      if (defaultTargetId) {
        setWeaponMode({
          weapon: 'ability',
          abilityId,
          targetPlayerId: defaultTargetId,
        });
      }
    },
    [isMyTurn, isGameOver, weaponMode, opponents, onShipAbility],
  );

  const handleCellHover = useCallback(
    (playerId: string, row: number, col: number) => {
      setWeaponMode((prev) =>
        prev ? { ...prev, targetPlayerId: playerId } : prev,
      );
      setHoveredCell({ row, col });
    },
    [],
  );

  const handleCellHoverEnd = useCallback(() => setHoveredCell(null), []);

  const cancelWeaponMode = useCallback(() => {
    setWeaponMode(null);
    setHoveredCell(null);
  }, []);

  const sonarPreviewCells = useMemo(() => {
    if (weaponMode?.weapon !== 'sonar' || !hoveredCell) return null;
    const side = gridSize <= 10 ? 3 : gridSize <= 15 ? 5 : 7;
    return getBoxCells(
      weaponMode.targetPlayerId,
      hoveredCell.row,
      hoveredCell.col,
      Math.floor((side - 1) / 2),
      gridSize,
    );
  }, [weaponMode, hoveredCell, gridSize]);

  const abilityPreviewCells = useMemo(() => {
    if (weaponMode?.weapon !== 'ability' || !hoveredCell) return null;
    const radius =
      weaponMode.abilityId === 'sonar_ping'
        ? 2
        : weaponMode.abilityId === 'scout'
          ? 1
          : 0;
    return getBoxCells(
      weaponMode.targetPlayerId,
      hoveredCell.row,
      hoveredCell.col,
      radius,
      gridSize,
    );
  }, [weaponMode, hoveredCell, gridSize]);

  const radarPreviewCells = useMemo(() => {
    if (weaponMode?.weapon !== 'radar' || !hoveredCell) return null;
    const lines = gridSize <= 10 ? 1 : gridSize <= 15 ? 3 : 5;
    const halfWidth = Math.floor(lines / 2);
    const cells = new Set<string>();
    const axis = weaponMode.radarAxis ?? 'row';
    for (let d = -halfWidth; d <= halfWidth; d++) {
      for (let i = 0; i < gridSize; i++) {
        const r = axis === 'row' ? hoveredCell.row + d : i;
        const c = axis === 'col' ? hoveredCell.col + d : i;
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          cells.add(`${weaponMode.targetPlayerId}-${r}-${c}`);
        }
      }
    }
    return cells;
  }, [weaponMode, hoveredCell, gridSize]);

  const isWeaponMode = weaponMode !== null;

  const handleSelectSonar = useCallback(() => {
    if (isSonarDisabled) return;
    const targetId = opponents?.[0]?.playerId;
    if (targetId) {
      setWeaponMode({ weapon: 'sonar', targetPlayerId: targetId });
    }
  }, [isSonarDisabled, opponents]);

  const handleSelectRadar = useCallback(() => {
    if (isRadarDisabled) return;
    const targetId = opponents?.[0]?.playerId;
    if (targetId) {
      setWeaponMode({
        weapon: 'radar',
        targetPlayerId: targetId,
        radarAxis: 'row',
      });
    }
  }, [isRadarDisabled, opponents]);

  const handleToggleRadarAxis = useCallback(() => {
    if (isRadarDisabled) return;
    const targetId = opponents?.[0]?.playerId;
    if (!targetId) return;
    setWeaponMode({
      weapon: 'radar',
      targetPlayerId: targetId,
      radarAxis: weaponMode?.radarAxis === 'col' ? 'row' : 'col',
    });
  }, [isRadarDisabled, opponents, weaponMode?.radarAxis]);

  const handleKeyboardFire = useCallback(
    (row: number, col: number) => {
      if (!isMyTurn || isGameOver) return;
      const targetId = opponents?.[0]?.playerId;
      if (targetId) {
        attack(targetId, row, col);
      }
    },
    [isMyTurn, isGameOver, opponents, attack],
  );

  const { cursor } = useKeyboardNavigation({
    gridSize: snapshot?.gridSize ?? 10,
    enabled: isMyTurn && !isGameOver && !isWeaponMode,
    onFire: handleKeyboardFire,
  });

  return (
    <>
      {isPlacementPhase && (
        <ShipPlacementBoard
          key="placement-board"
          currentPlayer={currentPlayer}
          onPlaceShip={placeShip}
          onMoveShip={moveShip}
          onConfirmPlacement={confirmPlacement}
          onResetPlacement={resetPlacement}
          isPlacementComplete={isPlacementComplete}
          onAutoPlace={handleAutoPlace}
          gridSize={snapshot?.gridSize}
          shipCount={snapshot?.shipCount}
        />
      )}

      {isBattlePhase && currentPlayer && !currentPlayer.alive && (
        <Card className={'-mx-3 -mb-3'} variant="error">
          <Typography>
            {t(
              'games.sea_battle_v1.teamMode.banner.eliminatedSpectator' as TranslationKey,
            )}
          </Typography>
        </Card>
      )}

      {isGameOver && teamMode && winnerTeam && (
        <Card className={'-mx-3 -mb-3'} variant="elevated">
          <Typography>
            {t(
              'games.sea_battle_v1.teamMode.banner.teamWon' as TranslationKey,
              {
                team: winnerTeam.name,
              },
            )}
          </Typography>
        </Card>
      )}

      {(isBattlePhase || isGameOver) && snapshot && (
        <>
          {!isGameOver && snapshot.mode === 'salvo' && currentPlayer && (
            <div className="flex items-center justify-center gap-2 py-1">
              <span
                className={`text-[13px] font-semibold ${
                  isMyTurn ? 'text-amber-400' : 'text-neutral-500'
                }`}
              >
                ⚔️ Salvo:{' '}
                {isMyTurn
                  ? `${currentPlayer.salvoShotsRemaining ?? currentPlayer.shipsRemaining} shots remaining`
                  : "Opponent's turn"}
              </span>
            </div>
          )}
          {isMyTurn && snapshot.mode === 'speed' && currentPlayer && (
            <TurnTimer deadline={currentPlayer.turnDeadline} />
          )}
          {!isGameOver && (hasSonar || hasRadar || isWeaponMode) && (
            <SeaBattleWeaponsBar
              hasSonar={hasSonar}
              hasRadar={hasRadar}
              sonarUsed={sonarUsed}
              radarUsed={radarUsed}
              isSonarDisabled={isSonarDisabled}
              isRadarDisabled={isRadarDisabled}
              weaponMode={weaponMode}
              onSelectSonar={handleSelectSonar}
              onSelectRadar={handleSelectRadar}
              onToggleRadarAxis={handleToggleRadarAxis}
              onCancel={cancelWeaponMode}
            />
          )}
          {!isGameOver && snapshot.shipAbilities && currentPlayer && (
            <ShipAbilitiesPanel
              player={currentPlayer}
              cooldowns={snapshot.abilityCooldowns?.[currentUserId ?? '']}
              disabled={!isMyTurn}
              activeAbilityId={
                weaponMode?.weapon === 'ability' ? weaponMode.abilityId : null
              }
              onUseAbility={handleShipAbilityClick}
            />
          )}
          <AttackBoard
            key="attack-board"
            players={snapshot.players}
            currentUserId={currentUserId}
            currentTurnPlayerId={currentTurnPlayerId}
            isMyTurn={isMyTurn}
            onAttack={isWeaponMode ? handleWeaponFire : attack}
            resolveDisplayName={resolveDisplayNameBound}
            disabled={isGameOver}
            showEliminatedPlayers={isGameOver}
            teammateIds={teammateIds}
            teams={teams}
            gridSize={snapshot.gridSize}
            shipCount={snapshot.shipCount}
            snapshot={snapshot}
            weaponPreviewCells={
              weaponMode?.weapon === 'sonar'
                ? sonarPreviewCells
                : weaponMode?.weapon === 'radar'
                  ? radarPreviewCells
                  : abilityPreviewCells
            }
            weaponPreviewType={weaponMode?.weapon ?? null}
            onCellHover={isWeaponMode ? handleCellHover : undefined}
            onCellHoverEnd={isWeaponMode ? handleCellHoverEnd : undefined}
            weaponMode={isWeaponMode}
            keyboardCursor={cursor}
            highlightedCells={highlightedCells}
          />
        </>
      )}
    </>
  );
}
