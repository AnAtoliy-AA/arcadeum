'use client';

import { useState } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { Card, Typography } from '@arcadeum/ui';
import { ShipPlacementBoard } from './ShipPlacementBoard';
import { AttackBoard } from './AttackBoard';
import type {
  SeaBattlePlayerState,
  SeaBattleSnapshot,
  SeaBattleTeam,
  ShipCell,
} from '../types';

interface SeaBattleBoardsProps {
  isPlacementPhase: boolean;
  currentPlayer: SeaBattlePlayerState | null;
  placeShip: (shipId: string, cells: ShipCell[]) => void;
  moveShip: (shipId: string, cells: ShipCell[]) => void;
  confirmPlacement: () => void;
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
  onSonar?: (targetPlayerId: string) => void;
  onRadar?: (targetPlayerId: string, row?: number, col?: number) => void;
  resolveDisplayNameBound: (
    id?: string | null,
    fallback?: string | null,
  ) => string;
  teammateIds?: string[];
  teams?: SeaBattleTeam[];
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
  resolveDisplayNameBound,
  teammateIds,
  teams,
}: SeaBattleBoardsProps) {
  const { t } = useTranslation();
  const [radarMode, setRadarMode] = useState<'row' | 'col' | null>(null);
  const [radarTarget, setRadarTarget] = useState<string | null>(null);

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
        />
      )}

      {isBattlePhase && currentPlayer && !currentPlayer.alive && (
        <Card
          variant="error"
          padding="md"
          marginHorizontal="$3"
          marginBottom="$3"
        >
          <Typography>
            {t(
              'games.sea_battle_v1.teamMode.banner.eliminatedSpectator' as TranslationKey,
            )}
          </Typography>
        </Card>
      )}

      {isGameOver && teamMode && winnerTeam && (
        <Card
          variant="elevated"
          padding="md"
          marginHorizontal="$3"
          marginBottom="$3"
        >
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

      {isBattlePhase && snapshot && (
        <>
          {isMyTurn && (hasSonar || hasRadar) && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '8px 16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {hasSonar && !sonarUsed && (
                <select
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #555',
                    background: '#1a1a2e',
                    color: '#e0e0e0',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  value=""
                  onChange={(e) => {
                    if (e.target.value && onSonar) {
                      onSonar(e.target.value);
                    }
                  }}
                >
                  <option value="">
                    {t('games.create.seaBattleSonar') || 'Sonar'}
                  </option>
                  {opponents?.map((p) => (
                    <option key={p.playerId} value={p.playerId}>
                      {resolveDisplayNameBound(p.playerId, p.playerId)}
                    </option>
                  ))}
                </select>
              )}
              {hasRadar && !radarUsed && (
                <>
                  {radarMode && radarTarget ? (
                    <div
                      style={{ display: 'flex', gap: 4, alignItems: 'center' }}
                    >
                      <span style={{ fontSize: 12, color: '#aaa' }}>
                        {radarMode === 'row' ? 'Row' : 'Col'}:
                      </span>
                      {Array.from(
                        { length: snapshot.gridSize ?? 10 },
                        (_, i) => i,
                      ).map((i) => (
                        <button
                          key={i}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            border: '1px solid #555',
                            background: '#1a1a2e',
                            color: '#e0e0e0',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            if (onRadar) {
                              onRadar(
                                radarTarget,
                                radarMode === 'row' ? i : undefined,
                                radarMode === 'col' ? i : undefined,
                              );
                              setRadarMode(null);
                              setRadarTarget(null);
                            }
                          }}
                        >
                          {i}
                        </button>
                      ))}
                      <button
                        style={{
                          fontSize: 11,
                          color: '#f87171',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setRadarMode(null);
                          setRadarTarget(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #555',
                        background: '#1a1a2e',
                        color: '#e0e0e0',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setRadarTarget(e.target.value);
                          setRadarMode('row');
                        }
                      }}
                    >
                      <option value="">
                        {t('games.create.seaBattleRadar') || 'Radar'}
                      </option>
                      {opponents?.map((p) => (
                        <option key={p.playerId} value={p.playerId}>
                          {resolveDisplayNameBound(p.playerId, p.playerId)}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>
          )}
          <AttackBoard
            key="attack-board"
            players={snapshot.players}
            currentUserId={currentUserId}
            currentTurnPlayerId={currentTurnPlayerId}
            isMyTurn={isMyTurn}
            onAttack={attack}
            resolveDisplayName={resolveDisplayNameBound}
            teammateIds={teammateIds}
            teams={teams}
            gridSize={snapshot.gridSize}
          />
        </>
      )}
    </>
  );
}
