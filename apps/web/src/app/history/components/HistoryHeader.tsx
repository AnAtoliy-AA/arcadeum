"use client";

import { useTranslation } from "@/shared/lib/useTranslation";
import { Header, Title, RefreshButton, RefreshIcon } from "../styles";

interface HistoryHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function HistoryHeader({ loading, refreshing, onRefresh }: HistoryHeaderProps) {
  const { t } = useTranslation();

  return (
    <Header>
      <Title>{t("navigation.historyTab")}</Title>
      <RefreshButton
        onClick={onRefresh}
        disabled={loading || refreshing}
        aria-label={t("history.actions.refresh")}
      >
        <RefreshIcon $spinning={refreshing}>↻</RefreshIcon>
        {t("history.actions.refresh")}
      </RefreshButton>
    </Header>
  );
}
