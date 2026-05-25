'use client';
import { memo, useCallback, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import type { SeaBattlePlayerState, SeaBattleTeam } from '../../types';
import { CELL_STATE, COL_LABELS, ROW_LABELS } from '../../types';
import { ShipsLeft } from '../ShipsLeft';
import {
  BadgeWrapper,
  BoardGrid,
  BoardWithLabels,
  ColLabels,
  Label,
  PlayerName,
  PlayerSection,
  PlayerSectionWrapper,
  PlayerStats,
  RowLabels,
} from '../styles';
import { IdleBadge } from '@/shared/ui';
import { type TranslationKey } from '@/shared/lib/useTranslation';
import type { SeaBattleTheme } from '../../lib/theme';
import { AttackBoardCell } from './AttackBoardCell';
import { BadgePill, TeamPill } from './Pills';
import { getPlayerColor } from '@/shared/lib/playerColors';
import { InGameAvatar } from '@/features/games/ui';

interface AttackPlayerBoardProps {
  player: SeaBattlePlayerState;
  isMe: boolean;
  theme: SeaBattleTheme;
  resolveDisplayName: (id: string, fallback: string) => string;
  idlePlayers: string[];
  isMyTurn: boolean;
  isCurrentTurn: boolean;
  disabled: boolean;
  isTeammate?: boolean;
  team?: SeaBattleTeam;
  sunkCellSet: Set<string>;
  onAttack?: (targetPlayerId: string, row: number, col: number) => void;
  t: (key: TranslationKey) => string;
}

export const AttackPlayerBoard = memo(function AttackPlayerBoard({
  player,
  isMe,
  theme,
  resolveDisplayName,
  idlePlayers,
  isMyTurn,
  isCurrentTurn,
  disabled,
  isTeammate = false,
  team,
  sunkCellSet,
  onAttack,
  t,
}: AttackPlayerBoardProps) {
  const isAttackDisabled = disabled || isTeammate;
  const showTargeting = isMyTurn && !isTeammate;

  // Optimistic "shot fired" state: instantly mark the clicked cell as pending
  // so the player sees feedback without waiting for the server round-trip,
  // and can't spam-click the same cell.
  const [pendingCell, setPendingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  // Derived: only treat the stored pending cell as "still pending" if it's
  // my turn and the server hasn't yet resolved the cell to HIT/MISS.
  // Stale state self-clears on the next click.
  const activePendingCell = (() => {
    if (!pendingCell || !isMyTurn) return null;
    const s = player.board[pendingCell.r]?.[pendingCell.c];
    if (s === CELL_STATE.HIT || s === CELL_STATE.MISS) return null;
    return pendingCell;
  })();

  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isMyTurn || isAttackDisabled || !onAttack) return;
      const cell = (e.target as HTMLElement).closest('.sb-cell.sb-attackable');
      if (!cell) return;
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');
      if (row !== null && col !== null) {
        const r = parseInt(row);
        const c = parseInt(col);
        setPendingCell({ r, c });
        onAttack(player.playerId, r, c);
      }
    },
    [isMyTurn, isAttackDisabled, onAttack, player.playerId],
  );

  const boardGrid = (
    <BoardGrid
      className={`sb-board-grid ${!isMe && showTargeting ? 'sb-my-turn' : ''}`}
      style={{
        backgroundColor: theme.boardBackground,
        borderColor: theme.cellBorder,
        ...(isTeammate ? { cursor: 'not-allowed' } : {}),
      }}
      onClick={handleGridClick}
    >
      {player.board.map((row, rIndex) =>
        row.map((cellState, cIndex) => {
          const isSunk = sunkCellSet.has(
            `${player.playerId}-${rIndex}-${cIndex}`,
          );
          const displayState =
            !isMe && isSunk
              ? CELL_STATE.HIT
              : !isMe && !isTeammate && cellState === CELL_STATE.SHIP
                ? CELL_STATE.EMPTY
                : cellState;
          const isPending =
            !isMe &&
            activePendingCell?.r === rIndex &&
            activePendingCell?.c === cIndex;
          const isAttackable =
            !isMe &&
            !isTeammate &&
            cellState !== CELL_STATE.HIT &&
            cellState !== CELL_STATE.MISS &&
            !isSunk &&
            !isPending;

          return (
            <AttackBoardCell
              key={`${isMe ? 'own' : player.playerId}-${rIndex}-${cIndex}`}
              cellState={cellState}
              displayState={displayState}
              isSunk={isSunk}
              isAttackable={isAttackable}
              isPending={isPending}
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

  const cornerAvatar = (
    <YStack
      position="absolute"
      top={-4}
      left={-4}
      zIndex={11}
      pointerEvents="none"
      borderRadius={9999}
      borderWidth={2}
      borderColor={team?.color ?? theme.cellBorder}
      backgroundColor={theme.boardBackground}
      padding={2}
    >
      <InGameAvatar
        playerId={player.playerId}
        name={resolveDisplayName(player.playerId, isMe ? 'You' : 'Unknown')}
        size="icon"
        data-testid={`sb-corner-avatar-${player.playerId}`}
      />
    </YStack>
  );

  if (isMe) {
    const isDefending = !isMyTurn && player.alive;
    const showBadge = player.alive;
    return (
      <PlayerSectionWrapper>
        {cornerAvatar}
        <BadgeWrapper
          backgroundColor={theme.boardBackground}
          borderRadius={8}
          paddingHorizontal="$1.5"
          top={-4}
        >
          {showBadge && (
            <XStack
              alignItems="center"
              gap="$1"
              paddingHorizontal="$2"
              paddingVertical="$0.5"
              borderRadius={8}
              borderWidth={1}
              backgroundColor={
                isCurrentTurn ? '$dangerBgSoft' : '$warningBgSoft'
              }
              borderColor={isCurrentTurn ? '$dangerBorder' : '$warningBorder'}
              className={isCurrentTurn ? 'sb-badge-danger-breathe' : undefined}
            >
              <Text fontSize={10}>{isCurrentTurn ? '🎯' : '🛡️'}</Text>
              <Text
                fontSize={9}
                fontWeight="700"
                color={isCurrentTurn ? '$danger' : '$warning'}
                textTransform="uppercase"
              >
                {isCurrentTurn
                  ? t(
                      'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
                    ).replace('🎯 ', '')
                  : t(
                      'games.sea_battle_v1.table.players.defendingBadge' as TranslationKey,
                    )}
              </Text>
            </XStack>
          )}
        </BadgeWrapper>
        <PlayerSection
          backgroundColor={theme.boardBackground}
          borderColor={
            team ? team.color : isDefending ? theme.hitColor : theme.cellBorder
          }
          borderWidth={team ? 2 : undefined}
          className={`sb-player-section-fit ${
            isDefending ? 'sb-section-danger-breathe' : ''
          }`}
          backdropFilter="blur(8px)"
        >
          <PlayerName
            data-testid="player-board-name"
            color={theme.textColor}
            style={{ color: team?.color ?? getPlayerColor(player.playerId) }}
          >
            {resolveDisplayName(player.playerId, 'You')} (Your Fleet)
            {team && <TeamPill team={team} />}
            {idlePlayers.includes(player.playerId) && <IdleBadge />}
          </PlayerName>
          <PlayerStats>
            <ShipsLeft ships={player.ships} isMe={true} />
          </PlayerStats>
          <BoardWithLabels>
            <div />
            <ColLabels>
              {COL_LABELS.map((label) => (
                <Label key={label} style={{ color: theme.textSecondaryColor }}>
                  {label}
                </Label>
              ))}
            </ColLabels>
            <RowLabels>
              {ROW_LABELS.map((label) => (
                <Label key={label} style={{ color: theme.textSecondaryColor }}>
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
      {cornerAvatar}
      <BadgeWrapper
        backgroundColor={theme.boardBackground}
        borderRadius={8}
        paddingHorizontal="$1.5"
        top={-4}
      >
        {isTeammate ? (
          <BadgePill
            icon="🤝"
            label={t(
              'games.sea_battle_v1.teamMode.teammateBadge' as TranslationKey,
            )}
            bg="rgba(34,197,94,0.15)"
            border="rgba(34,197,94,0.5)"
            color="#86efac"
            ariaLabel={t(
              'games.sea_battle_v1.teamMode.cannotAttackTeammate' as TranslationKey,
            )}
          />
        ) : isCurrentTurn ? (
          <BadgePill
            icon="🎯"
            label="ATTACKING"
            bg="$dangerBgSoft"
            border="$dangerBorder"
            color="$danger"
            className="sb-badge-danger-breathe"
          />
        ) : isMyTurn ? (
          <BadgePill
            icon="🎯"
            label={t(
              'games.sea_battle_v1.table.players.targetBadge' as TranslationKey,
            )}
            bg="$infoBgSoft"
            border="$infoBorder"
            color="$info"
          />
        ) : null}
      </BadgeWrapper>
      <PlayerSection
        isTargetable={isMyTurn}
        backgroundColor={theme.boardBackground}
        borderColor={
          team ? team.color : isMyTurn ? theme.accentColor : theme.cellBorder
        }
        borderWidth={team ? 2 : undefined}
        className={`sb-player-section-fit ${
          isMyTurn && !team ? 'sb-breathe' : ''
        }`}
        backdropFilter="blur(8px)"
      >
        <PlayerName
          data-testid="player-board-name"
          color={theme.textColor}
          style={{ color: team?.color ?? getPlayerColor(player.playerId) }}
        >
          {t(
            'games.sea_battle_v1.table.players.opponentBadge' as TranslationKey,
          )}
          {' · '}
          {resolveDisplayName(player.playerId, 'Unknown')}
          {team && <TeamPill team={team} />}
          {idlePlayers.includes(player.playerId) && <IdleBadge />}
        </PlayerName>
        <PlayerStats>
          <ShipsLeft ships={player.ships} isMe={false} />
        </PlayerStats>
        <BoardWithLabels>
          <div />
          <ColLabels>
            {COL_LABELS.map((label) => (
              <Label key={label} style={{ color: theme.textSecondaryColor }}>
                {label}
              </Label>
            ))}
          </ColLabels>
          <RowLabels>
            {ROW_LABELS.map((label) => (
              <Label key={label} style={{ color: theme.textSecondaryColor }}>
                {label}
              </Label>
            ))}
          </RowLabels>
          {boardGrid}
        </BoardWithLabels>
      </PlayerSection>
    </PlayerSectionWrapper>
  );
});
