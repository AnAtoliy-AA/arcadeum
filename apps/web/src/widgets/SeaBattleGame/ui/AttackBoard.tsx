'use client';

import { useCallback, useMemo, memo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import type { SeaBattlePlayerState } from '../types';
import { CELL_STATE, ROW_LABELS, COL_LABELS } from '../types';
import { ShipsLeft } from './ShipsLeft';
import {
  PlayerSection,
  PlayerSectionWrapper,
  PlayerName,
  PlayerStats,
  BoardGrid,
  BoardCell,
  BoardWithLabels,
  RowLabels,
  ColLabels,
  Label,
  MainGameArea,
  BadgeWrapper,
} from './styles';
import { SeaBattleGrids } from './SeaBattleGrids';
import { IdleBadge } from '@/shared/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import type { SeaBattleTheme } from '../lib/theme';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';

function getCellBg(state: number, theme: SeaBattleTheme): string {
  switch (state) {
    case CELL_STATE.HIT:
      return theme.hitColor;
    case CELL_STATE.MISS:
      return theme.missColor;
    case CELL_STATE.SHIP:
      return theme.shipColor;
    default:
      return theme.cellEmpty;
  }
}

function getCellIcon(isSunk: boolean, cellState: number): string | null {
  if (isSunk) return '💀';
  if (cellState === CELL_STATE.HIT) return '🔥';
  return null;
}

function getCellAnimClass(
  isSunk: boolean,
  cellState: number,
): string | undefined {
  if (isSunk) return 'sb-glow-sunk';
  if (cellState === CELL_STATE.HIT) return 'sb-glow-hit';
  return undefined;
}

interface AttackBoardCellProps {
  cellState: number;
  displayState: number;
  isSunk: boolean;
  theme: SeaBattleTheme;
  rIndex: number;
  cIndex: number;
  isAttackable: boolean;
  isMe: boolean;
}

const AttackBoardCell = memo(
  ({
    displayState,
    isSunk,
    theme,
    rIndex,
    cIndex,
    isAttackable,
    isMe,
  }: AttackBoardCellProps) => {
    const icon = getCellIcon(isSunk, displayState);
    const animClass = getCellAnimClass(isSunk, displayState);

    const iconFilter =
      icon === '💀'
        ? 'drop-shadow(0 0 5px rgba(239,68,68,0.9))'
        : icon === '🔥'
          ? 'drop-shadow(0 0 5px rgba(251,146,60,0.9))'
          : undefined;

    return (
      <BoardCell
        isClickable={isAttackable}
        position="relative"
        backgroundColor={getCellBg(displayState, theme)}
        borderColor={theme.cellBorder}
        borderRadius={parseInt(theme.borderRadius) || 4}
        className={`sb-cell ${isAttackable ? 'sb-attackable' : ''} ${animClass || ''}`}
        style={
          iconFilter
            ? ({ '--icon-filter': iconFilter } as React.CSSProperties)
            : undefined
        }
        hoverStyle={
          isAttackable
            ? {
                scale: 1.05,
                backgroundColor: theme.cellHover,
                borderColor: theme.primaryColor,
              }
            : undefined
        }
        data-row={!isMe ? rIndex : undefined}
        data-col={!isMe ? cIndex : undefined}
      >
        {icon && (
          <Text
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={13}
            style={
              {
                pointerEvents: 'none',
                userSelect: 'none',
                filter: iconFilter,
              } as React.CSSProperties
            }
          >
            {icon}
          </Text>
        )}
        {displayState === CELL_STATE.MISS && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            style={{ pointerEvents: 'none' } as React.CSSProperties}
          >
            <YStack
              width={6}
              height={6}
              borderRadius={100}
              backgroundColor="rgba(255,255,255,0.7)"
            />
          </YStack>
        )}
      </BoardCell>
    );
  },
);
AttackBoardCell.displayName = 'AttackBoardCell';

interface AttackPlayerBoardProps {
  player: SeaBattlePlayerState;
  isMe: boolean;
  theme: SeaBattleTheme;
  resolveDisplayName: (id: string, fallback: string) => string;
  idlePlayers: string[];
  isMyTurn: boolean;
  disabled: boolean;
  isTeammate?: boolean;
  sunkCellSet: Set<string>;
  onAttack?: (targetPlayerId: string, row: number, col: number) => void;
  t: (key: TranslationKey) => string;
}

const AttackPlayerBoard = memo(
  ({
    player,
    isMe,
    theme,
    resolveDisplayName,
    idlePlayers,
    isMyTurn,
    disabled,
    isTeammate = false,
    sunkCellSet,
    onAttack,
    t,
  }: AttackPlayerBoardProps) => {
    const isAttackDisabled = disabled || isTeammate;
    const showTargeting = isMyTurn && !isTeammate;
    const handleGridClick = useCallback(
      (e: React.MouseEvent) => {
        if (!isMyTurn || isAttackDisabled || !onAttack) return;

        // Find the closest sb-cell that is attackable
        const cell = (e.target as HTMLElement).closest(
          '.sb-cell.sb-attackable',
        );
        if (!cell) return;

        const row = cell.getAttribute('data-row');
        const col = cell.getAttribute('data-col');

        if (row !== null && col !== null) {
          onAttack(player.playerId, parseInt(row), parseInt(col));
        }
      },
      [isMyTurn, isAttackDisabled, onAttack, player.playerId],
    );

    const boardGrid = (
      <BoardGrid
        className={`sb-board-grid ${showTargeting ? 'sb-my-turn' : ''}`}
        backgroundColor={theme.boardBackground}
        borderColor={theme.cellBorder}
        onClick={handleGridClick}
        style={
          isTeammate
            ? ({ cursor: 'not-allowed' } as React.CSSProperties)
            : undefined
        }
      >
        {player.board.map((row, rIndex) =>
          row.map((cellState, cIndex) => {
            const isSunk = sunkCellSet.has(
              `${player.playerId}-${rIndex}-${cIndex}`,
            );
            const displayState =
              !isMe && isSunk
                ? CELL_STATE.HIT
                : !isMe && cellState === CELL_STATE.SHIP
                  ? CELL_STATE.EMPTY
                  : cellState;
            const isAttackable =
              !isMe &&
              !isTeammate &&
              cellState !== CELL_STATE.HIT &&
              cellState !== CELL_STATE.MISS &&
              !isSunk;

            return (
              <AttackBoardCell
                key={`${isMe ? 'own' : player.playerId}-${rIndex}-${cIndex}`}
                cellState={cellState}
                displayState={displayState}
                isSunk={isSunk}
                isAttackable={isAttackable}
                theme={theme}
                rIndex={rIndex}
                cIndex={cIndex}
                isMe={isMe}
              />
            );
          }),
        )}
      </BoardGrid>
    );

    if (isMe) {
      return (
        <PlayerSectionWrapper>
          <PlayerSection
            backgroundColor={theme.boardBackground}
            borderColor={theme.cellBorder}
            style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
          >
            <PlayerName data-testid="player-board-name" color={theme.textColor}>
              {resolveDisplayName(player.playerId, 'You')} (Your Fleet)
              {idlePlayers.includes(player.playerId) && <IdleBadge />}
            </PlayerName>
            <PlayerStats>
              <ShipsLeft ships={player.ships} isMe={true} />
            </PlayerStats>
            <BoardWithLabels>
              <div />
              <ColLabels>
                {COL_LABELS.map((label) => (
                  <Label key={label} color={theme.textSecondaryColor}>
                    {label}
                  </Label>
                ))}
              </ColLabels>
              <RowLabels>
                {ROW_LABELS.map((label) => (
                  <Label key={label} color={theme.textSecondaryColor}>
                    {label}
                  </Label>
                ))}
              </RowLabels>
              {boardGrid}
            </BoardWithLabels>
          </PlayerSection>
        </PlayerSectionWrapper>
      );
    }

    return (
      <PlayerSectionWrapper>
        <BadgeWrapper
          backgroundColor={theme.boardBackground}
          borderRadius={8}
          paddingHorizontal="$1.5"
          top={-4}
        >
          {isTeammate ? (
            <XStack
              alignItems="center"
              gap="$1"
              paddingHorizontal="$2"
              paddingVertical="$0.5"
              borderRadius={8}
              borderWidth={1}
              backgroundColor="rgba(34,197,94,0.1)"
              borderColor="rgba(34,197,94,0.3)"
              aria-label={t(
                'games.sea_battle_v1.teamMode.cannotAttackTeammate' as TranslationKey,
              )}
            >
              <Text fontSize={10}>🤝</Text>
              <Text
                fontSize={9}
                fontWeight="700"
                color="#86efac"
                textTransform="uppercase"
              >
                {t(
                  'games.sea_battle_v1.teamMode.teammateBadge' as TranslationKey,
                )}
              </Text>
            </XStack>
          ) : (
            showTargeting && (
              <XStack
                alignItems="center"
                gap="$1"
                paddingHorizontal="$2"
                paddingVertical="$0.5"
                borderRadius={8}
                borderWidth={1}
                backgroundColor="rgba(239,68,68,0.1)"
                borderColor="rgba(239,68,68,0.3)"
              >
                <Text fontSize={10}>🎯</Text>
                <Text
                  fontSize={9}
                  fontWeight="700"
                  color="#fca5a5"
                  textTransform="uppercase"
                >
                  {t(
                    'games.sea_battle_v1.table.players.targetBadge' as TranslationKey,
                  )}
                </Text>
              </XStack>
            )
          )}
        </BadgeWrapper>
        <PlayerSection
          isTargetable={showTargeting}
          backgroundColor={theme.boardBackground}
          borderColor={showTargeting ? theme.accentColor : theme.cellBorder}
          className={showTargeting ? 'sb-breathe' : undefined}
          style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
        >
          <PlayerName data-testid="player-board-name" color={theme.textColor}>
            {resolveDisplayName(player.playerId, 'Opponent')}
            {idlePlayers.includes(player.playerId) && <IdleBadge />}
          </PlayerName>
          <PlayerStats>
            <ShipsLeft ships={player.ships} isMe={false} />
          </PlayerStats>
          <BoardWithLabels>
            <div />
            <ColLabels>
              {COL_LABELS.map((label) => (
                <Label key={label} color={theme.textSecondaryColor}>
                  {label}
                </Label>
              ))}
            </ColLabels>
            <RowLabels>
              {ROW_LABELS.map((label) => (
                <Label key={label} color={theme.textSecondaryColor}>
                  {label}
                </Label>
              ))}
            </RowLabels>
            {boardGrid}
          </BoardWithLabels>
        </PlayerSection>
      </PlayerSectionWrapper>
    );
  },
);
AttackPlayerBoard.displayName = 'AttackPlayerBoard';

interface AttackBoardProps {
  players: SeaBattlePlayerState[];
  currentUserId: string | null;
  isMyTurn: boolean;
  onAttack: (targetPlayerId: string, row: number, col: number) => void;
  resolveDisplayName: (id: string, fallback: string) => string;
  disabled?: boolean;
  teammateIds?: string[];
}

export const AttackBoard = memo(function AttackBoard({
  players,
  currentUserId,
  isMyTurn,
  onAttack,
  resolveDisplayName,
  disabled = false,
  teammateIds,
}: AttackBoardProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();
  const currentPlayer = useMemo(() => {
    return players.find((p) => p.playerId === currentUserId) || null;
  }, [players, currentUserId]);

  const opponents = useMemo(() => {
    return players.filter((p) => p.playerId !== currentUserId && p.alive);
  }, [players, currentUserId]);

  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);

  const sunkCellSet = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      p.ships
        .filter((s) => s.sunk)
        .forEach((s) => {
          s.cells.forEach((c) => set.add(`${p.playerId}-${c.row}-${c.col}`));
        });
    });
    return set;
  }, [players]);

  return (
    <MainGameArea data-testid="game-main-area">
      <SeaBattleGrids>
        {currentPlayer && (
          <AttackPlayerBoard
            player={currentPlayer}
            isMe={true}
            theme={theme}
            resolveDisplayName={resolveDisplayName}
            idlePlayers={idlePlayers}
            isMyTurn={isMyTurn}
            disabled={disabled}
            sunkCellSet={sunkCellSet}
            t={t}
          />
        )}

        {opponents.map((opponent) => {
          const isTeammate = !!teammateIds?.includes(opponent.playerId);
          return (
            <AttackPlayerBoard
              key={opponent.playerId}
              player={opponent}
              isMe={false}
              theme={theme}
              resolveDisplayName={resolveDisplayName}
              idlePlayers={idlePlayers}
              isMyTurn={isMyTurn}
              disabled={disabled}
              isTeammate={isTeammate}
              sunkCellSet={sunkCellSet}
              onAttack={isTeammate ? undefined : onAttack}
              t={t}
            />
          );
        })}
      </SeaBattleGrids>
    </MainGameArea>
  );
});
AttackBoard.displayName = 'AttackBoard';
