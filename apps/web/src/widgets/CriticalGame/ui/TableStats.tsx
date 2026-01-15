import React from 'react';
import { TableInfo, TableStat, StatIcon, StatValue } from './styles';

interface TableStatsProps {
  deckCount: number;
  discardPileCount: number;
  pendingDraws: number;
  cardVariant?: string;
}

export const TableStats: React.FC<TableStatsProps> = ({
  deckCount,
  discardPileCount,
  pendingDraws,
  cardVariant,
}) => {
  return (
    <TableInfo $variant={cardVariant}>
      <TableStat $variant={cardVariant}>
        <StatIcon>🎴</StatIcon>
        <StatValue>{deckCount}</StatValue>
      </TableStat>
      <TableStat $variant={cardVariant}>
        <StatIcon>🗑️</StatIcon>
        <StatValue>{discardPileCount}</StatValue>
      </TableStat>
      <TableStat $variant={cardVariant}>
        <StatIcon>⏳</StatIcon>
        <StatValue $isWarning={true}>{pendingDraws}</StatValue>
      </TableStat>
    </TableInfo>
  );
};
