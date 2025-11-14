"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const EntryCard = styled(Link)`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  text-decoration: none;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
  }
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const EntryGameName = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const EntryStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.muted};
`;

const EntryMeta = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.surfaces.card.border};
  border-top-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Empty = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;

interface HistorySummary {
  roomId: string;
  roomName: string;
  gameId: string;
  status: "lobby" | "in_progress" | "completed" | "waiting" | "active";
  lastActivityAt: string;
  host: {
    id: string;
    username?: string;
    email?: string;
  };
  participants: Array<{
    id: string;
    username?: string;
    email?: string;
  }>;
}

export function HistoryPage() {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [entries, setEntries] = useState<HistorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!snapshot.accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = resolveApiUrl("/games/history");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setEntries(data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, [snapshot.accessToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <Page>
      <Container>
        <Title>{t("navigation.historyTab") || "Game History"}</Title>

        {loading ? (
          <Loading>
            <Spinner aria-label="Loading" />
            <div>Loading history...</div>
          </Loading>
        ) : entries.length === 0 ? (
          <Empty>
            {snapshot.accessToken
              ? t("history.list.emptyNoEntries") || "No game history yet"
              : t("history.list.emptySignedOut") || "Sign in to view your game history"}
          </Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {entries.map((entry) => (
              <EntryCard key={entry.roomId} href={`/games/rooms/${entry.roomId}`}>
                <EntryHeader>
                  <EntryGameName>{entry.roomName}</EntryGameName>
                  <EntryStatus>
                    {t(`history.status.${entry.status}`) || entry.status}
                  </EntryStatus>
                </EntryHeader>
                <EntryMeta>
                  {new Date(entry.lastActivityAt).toLocaleString()}
                </EntryMeta>
              </EntryCard>
            ))}
          </div>
        )}
      </Container>
    </Page>
  );
}

