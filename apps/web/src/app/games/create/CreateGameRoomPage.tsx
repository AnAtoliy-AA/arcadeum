"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";
import { ERROR_COLOR } from "@/shared/config/payment-config";

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const GameSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const GameTile = styled.button<{ $active?: boolean; disabled?: boolean }>`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid
    ${({ $active, theme }) =>
      $active ? theme.buttons.primary.gradientStart : theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active ? theme.surfaces.card.background : theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  text-align: left;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
  }
`;

const GameTileName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const GameTileSummary = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const VisibilityToggle = styled.button<{ $isPublic: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ $isPublic }) =>
    $isPublic
      ? "rgba(34, 197, 94, 0.1)"
      : "rgba(191, 90, 242, 0.1)"};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  border-radius: 16px;
  border: none;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${ERROR_COLOR};
  color: ${ERROR_COLOR};
`;

const gamesCatalog = [
  {
    id: "exploding_cats_v1",
    name: "Exploding Cats",
    summary: "A strategic card game",
    isPlayable: true,
  },
];

export function CreateGameRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();

  const initialGameId = useMemo(() => {
    const gameId = searchParams?.get("gameId");
    return gameId && gamesCatalog.some((g) => g.id === gameId) ? gameId : gamesCatalog[0]?.id || "";
  }, [searchParams]);

  const [gameId, setGameId] = useState(initialGameId);
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!snapshot.accessToken) {
        setError("Please sign in to create a room");
        return;
      }

      if (!name.trim()) {
        setError("Room name is required");
        return;
      }

      const maxPlayersNum = maxPlayers.trim() ? Number(maxPlayers) : undefined;
      if (maxPlayersNum !== undefined && (isNaN(maxPlayersNum) || maxPlayersNum < 2)) {
        setError("Max players must be at least 2");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = resolveApiUrl("/games/rooms");
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
          body: JSON.stringify({
            gameId,
            name: name.trim(),
            visibility,
            maxPlayers: maxPlayersNum,
            notes: notes.trim() || undefined,
          }),
        });

        if (!response.ok) {
          throw new globalThis.Error("Failed to create room");
        }

        const data = await response.json();
        router.push(`/games/rooms/${data.room.id}`);
      } catch (err) {
        setError(err instanceof globalThis.Error ? err.message : "Failed to create room");
      } finally {
        setLoading(false);
      }
    },
    [gameId, name, visibility, maxPlayers, notes, snapshot.accessToken, router]
  );

  return (
    <Page>
      <Container>
        <Title>{t("games.create.title") || "Create Game Room"}</Title>

        <Form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>{t("games.create.sectionGame") || "Select Game"}</SectionTitle>
            <GameSelector>
              {gamesCatalog.map((game) => (
                <GameTile
                  key={game.id}
                  $active={gameId === game.id}
                  disabled={!game.isPlayable}
                  onClick={() => game.isPlayable && setGameId(game.id)}
                  type="button"
                >
                  <GameTileName>{game.name}</GameTileName>
                  <GameTileSummary>{game.summary}</GameTileSummary>
                </GameTile>
              ))}
            </GameSelector>
          </Section>

          <Section>
            <SectionTitle>{t("games.create.sectionDetails") || "Room Details"}</SectionTitle>
            <FieldGroup>
              <Label htmlFor="room-name">{t("games.create.fieldName") || "Room Name"}</Label>
              <Input
                id="room-name"
                type="text"
                placeholder={t("games.create.namePlaceholder") || "Enter room name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-required="true"
              />
            </FieldGroup>

            <Row>
              <FieldGroup>
                <Label htmlFor="max-players">{t("games.create.fieldMaxPlayers") || "Max Players (optional)"}</Label>
                <Input
                  id="max-players"
                  type="number"
                  min="2"
                  placeholder={t("games.create.autoPlaceholder") || "Auto"}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  aria-label={t("games.create.maxPlayersAria") || "Maximum number of players"}
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="visibility">{t("games.create.fieldVisibility") || "Visibility"}</Label>
                <VisibilityToggle
                  id="visibility"
                  type="button"
                  $isPublic={visibility === "public"}
                  onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
                  aria-pressed={visibility === "public"}
                  aria-label={visibility === "public" ? "Public room" : "Private room"}
                >
                  {visibility === "public" ? "🌐 Public" : "🔒 Private"}
                </VisibilityToggle>
              </FieldGroup>
            </Row>

            <FieldGroup>
              <Label htmlFor="notes">{t("games.create.fieldNotes") || "Notes (optional)"}</Label>
              <TextArea
                id="notes"
                placeholder={t("games.create.notesPlaceholder") || "Add notes..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                aria-label={t("games.create.notesAria") || "Additional notes for the room"}
              />
            </FieldGroup>
          </Section>

          {error && <Error>{error}</Error>}

          <SubmitButton type="submit" disabled={loading}>
            {loading
              ? t("games.create.submitCreating") || "Creating..."
              : t("games.common.createRoom") || "Create Room"}
          </SubmitButton>
        </Form>
      </Container>
    </Page>
  );
}

