import React from 'react';
import {
  TableInfo,
  TableStat,
  StatIcon,
  StatValue,
  SonarRadar,
  Bubble,
  FishSilhouette,
} from './styles';

import { GAME_VARIANT } from '../lib/constants';

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
      {cardVariant === GAME_VARIANT.UNDERWATER && (
        <>
          <SonarRadar />
          <Bubble $delay={0} $left={10} />
          <Bubble $delay={2} $left={30} />
          <Bubble $delay={1} $left={60} />
          <Bubble $delay={3} $left={85} />
          <FishSilhouette $delay={0} $top={20} />
          <FishSilhouette $delay={5} $top={70} />
        </>
      )}
      <TableStat $variant={cardVariant}>
        <StatIcon>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
          </svg>
        </StatIcon>
        <StatValue $variant={cardVariant}>{deckCount}</StatValue>
      </TableStat>
      <TableStat $variant={cardVariant}>
        <StatIcon>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </StatIcon>
        <StatValue $variant={cardVariant}>{discardPileCount}</StatValue>
      </TableStat>
      <TableStat $variant={cardVariant}>
        <StatIcon>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 22h14" />
            <path d="M5 2h14" />
            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
          </svg>
        </StatIcon>
        <StatValue $isWarning={true} $variant={cardVariant}>
          {pendingDraws}
        </StatValue>
      </TableStat>
    </TableInfo>
  );
};
