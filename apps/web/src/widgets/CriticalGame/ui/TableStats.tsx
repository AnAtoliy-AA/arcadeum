import React from 'react';
import { TableInfo, TableStat } from './styles';

interface TableStatsProps {
  deckCount: number;
  discardPileCount: number;
  pendingDraws: number;
}

export const TableStats: React.FC<TableStatsProps> = ({
  deckCount,
  discardPileCount,
  pendingDraws,
}) => {
  return (
    <TableInfo>
      <TableStat>
        <div style={{ fontSize: '1.1rem' }}>🎴</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{deckCount}</div>
      </TableStat>
      <TableStat>
        <div style={{ fontSize: '1.1rem' }}>🗑️</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
          {discardPileCount}
        </div>
      </TableStat>
      <TableStat>
        <div style={{ fontSize: '1.1rem' }}>⏳</div>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#DC2626',
          }}
        >
          {pendingDraws}
        </div>
      </TableStat>
    </TableInfo>
  );
};
