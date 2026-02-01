import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Button } from '@/shared/ui';

interface StatsHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function StatsHeader({
  loading,
  refreshing,
  onRefresh,
}: StatsHeaderProps) {
  const { t } = useTranslation();

  return (
    <Header>
      <Title>{t('navigation.statsTab')}</Title>
      <Button
        variant="icon"
        size="sm"
        onClick={onRefresh}
        disabled={loading || refreshing}
      >
        <StyledRefreshIcon
          $isRefreshing={refreshing}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </StyledRefreshIcon>
      </Button>
    </Header>
  );
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledRefreshIcon = styled.svg<{ $isRefreshing: boolean }>`
  width: 20px;
  height: 20px;
  animation: ${({ $isRefreshing }) => ($isRefreshing ? spin : 'none')} 1s linear
    infinite;
`;
