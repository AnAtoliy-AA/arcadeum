'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  PageLayout,
  Container,
  PageTitle,
  Section,
  Button,
  Input,
  TextArea,
  FormGroup,
  Card,
} from '@/shared/ui';

type ExpansionId = 'attack' | 'future' | 'theft' | 'chaos' | 'deity';

const EXPANSION_PACKS: {
  id: ExpansionId;
  name: string;
  cardCount: number;
  available: boolean;
}[] = [
  { id: 'attack', name: 'Attack Pack', cardCount: 5, available: true },
  { id: 'future', name: 'Future Pack', cardCount: 8, available: false },
  { id: 'theft', name: 'Theft Pack', cardCount: 4, available: false },
  { id: 'chaos', name: 'Chaos Pack', cardCount: 5, available: false },
  { id: 'deity', name: 'Deity Pack', cardCount: 4, available: false },
];

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const GameSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const GameTile = styled(Card)<{ $active?: boolean; disabled?: boolean }>`
  padding: 1rem;
  border: 2px solid
    ${({ $active, theme }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const VisibilityToggle = styled(Button)<{ $isPublic: boolean }>`
  background: ${({ $isPublic }) =>
    $isPublic ? 'rgba(34, 197, 94, 0.1)' : 'rgba(191, 90, 242, 0.1)'};
`;

const ErrorCard = styled(Card)`
  border-color: #dc2626;
  color: #ef4444;
`;

const ExpansionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const ExpansionCheckbox = styled.label<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover:not([data-disabled='true']) {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  input {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;

const ExpansionLabel = styled.span`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ExpansionBadge = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
  background: ${({ theme }) => theme.surfaces.panel.background};
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
`;

const gamesCatalog = [
  {
    id: 'exploding_kittens_v1',
    name: 'Exploding Cats',
    summary: 'A strategic card game where you avoid exploding cats',
    isPlayable: true,
  },
  {
    id: 'texas_holdem_v1',
    name: "Texas Hold'em",
    summary: 'Classic poker game with community cards',
    isPlayable: false, // Temporarily unavailable
    isHidden: true, // Temporarily hidden from UI
  },
];

// Filter out hidden games for display
const visibleGames = gamesCatalog.filter((game) => !game.isHidden);

export function CreateGameRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();

  const initialGameId = useMemo(() => {
    const gameId = searchParams?.get('gameId');
    return gameId && visibleGames.some((g) => g.id === gameId)
      ? gameId
      : visibleGames[0]?.id || '';
  }, [searchParams]);

  const [gameId, setGameId] = useState(initialGameId);
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [notes, setNotes] = useState('');
  const [expansions, setExpansions] = useState<ExpansionId[]>([]);
  const [allowActionCardCombos, setAllowActionCardCombos] = useState(false);
  const [idleTimerEnabled, setIdleTimerEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleExpansion = useCallback((id: ExpansionId) => {
    setExpansions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!snapshot.accessToken) {
        setError('Please sign in to create a room');
        return;
      }

      if (!name.trim()) {
        setError('Room name is required');
        return;
      }

      const maxPlayersNum = maxPlayers.trim() ? Number(maxPlayers) : undefined;
      if (
        maxPlayersNum !== undefined &&
        (isNaN(maxPlayersNum) || maxPlayersNum < 2)
      ) {
        setError('Max players must be at least 2');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = resolveApiUrl('/games/rooms');
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
          body: JSON.stringify({
            gameId,
            name: name.trim(),
            visibility,
            maxPlayers: maxPlayersNum,
            notes: notes.trim() || undefined,
            gameOptions:
              gameId === 'exploding_kittens_v1'
                ? {
                    ...(expansions.length > 0 ? { expansions } : {}),
                    allowActionCardCombos,
                    idleTimerEnabled,
                  }
                : undefined,
          }),
        });

        if (!response.ok) {
          throw new globalThis.Error('Failed to create room');
        }

        const data = await response.json();
        router.push(`/games/rooms/${data.room.id}`);
      } catch (err) {
        setError(
          err instanceof globalThis.Error
            ? err.message
            : 'Failed to create room',
        );
      } finally {
        setLoading(false);
      }
    },
    [
      gameId,
      name,
      visibility,
      maxPlayers,
      notes,
      expansions,
      allowActionCardCombos,
      idleTimerEnabled,
      snapshot.accessToken,
      router,
    ],
  );

  return (
    <PageLayout>
      <Container size="md">
        <PageTitle size="lg">
          {t('games.create.title') || 'Create Game Room'}
        </PageTitle>

        <Form onSubmit={handleSubmit}>
          <Section title={t('games.create.sectionGame') || 'Select Game'}>
            <GameSelector>
              {visibleGames.map((game) => (
                <GameTile
                  key={game.id}
                  as="button"
                  type="button"
                  $active={gameId === game.id}
                  disabled={!game.isPlayable}
                  onClick={() => game.isPlayable && setGameId(game.id)}
                >
                  <GameTileName>{game.name}</GameTileName>
                  <GameTileSummary>{game.summary}</GameTileSummary>
                </GameTile>
              ))}
            </GameSelector>
          </Section>

          {gameId === 'exploding_kittens_v1' && (
            <Section
              title={t('games.create.sectionExpansions') || 'Expansion Packs'}
            >
              <ExpansionGrid>
                {EXPANSION_PACKS.map((pack) => (
                  <ExpansionCheckbox
                    key={pack.id}
                    $disabled={!pack.available}
                    data-disabled={!pack.available}
                  >
                    <input
                      type="checkbox"
                      checked={expansions.includes(pack.id)}
                      onChange={() =>
                        pack.available && toggleExpansion(pack.id)
                      }
                      disabled={!pack.available}
                    />
                    <ExpansionLabel>{pack.name}</ExpansionLabel>
                    <ExpansionBadge>
                      +{pack.cardCount}{' '}
                      {pack.available
                        ? ''
                        : t('games.create.comingSoon') || 'Soon'}
                    </ExpansionBadge>
                  </ExpansionCheckbox>
                ))}
              </ExpansionGrid>
            </Section>
          )}

          {gameId === 'exploding_kittens_v1' && (
            <Section title={t('games.create.sectionHouseRules')}>
              <ExpansionGrid>
                <ExpansionCheckbox>
                  <input
                    type="checkbox"
                    checked={allowActionCardCombos}
                    onChange={() =>
                      setAllowActionCardCombos(!allowActionCardCombos)
                    }
                  />
                  <ExpansionLabel>
                    {t('games.create.houseRuleActionCardCombos')}
                  </ExpansionLabel>
                  <ExpansionBadge>
                    {t('games.create.houseRuleActionCardCombosHint')}
                  </ExpansionBadge>
                </ExpansionCheckbox>

                <ExpansionCheckbox>
                  <input
                    type="checkbox"
                    checked={idleTimerEnabled}
                    onChange={() => setIdleTimerEnabled(!idleTimerEnabled)}
                  />
                  <ExpansionLabel>
                    {t('games.create.houseRuleIdleTimer') ||
                      'Idle Timer Autoplay'}
                  </ExpansionLabel>
                  <ExpansionBadge>
                    {t('games.create.houseRuleIdleTimerHint', {
                      seconds: String(IDLE_TIMER_DURATION_SEC),
                    }) || 'Automated play after 15s'}
                  </ExpansionBadge>
                </ExpansionCheckbox>
              </ExpansionGrid>
            </Section>
          )}

          <Section title={t('games.create.sectionDetails') || 'Room Details'}>
            <FormGroup
              label={t('games.create.fieldName') || 'Room Name'}
              htmlFor="room-name"
              required
            >
              <Input
                id="room-name"
                type="text"
                placeholder={
                  t('games.create.namePlaceholder') || 'Enter room name'
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-required="true"
                fullWidth
              />
            </FormGroup>

            <Row>
              <FormGroup
                label={
                  t('games.create.fieldMaxPlayers') || 'Max Players (optional)'
                }
                htmlFor="max-players"
              >
                <Input
                  id="max-players"
                  type="number"
                  min="2"
                  placeholder={t('games.create.autoPlaceholder') || 'Auto'}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  aria-label={
                    t('games.create.maxPlayersAria') ||
                    'Maximum number of players'
                  }
                  fullWidth
                />
              </FormGroup>

              <FormGroup
                label={t('games.create.fieldVisibility') || 'Visibility'}
                htmlFor="visibility"
              >
                <VisibilityToggle
                  id="visibility"
                  type="button"
                  variant="secondary"
                  $isPublic={visibility === 'public'}
                  onClick={() =>
                    setVisibility(
                      visibility === 'public' ? 'private' : 'public',
                    )
                  }
                  aria-pressed={visibility === 'public'}
                  aria-label={
                    visibility === 'public' ? 'Public room' : 'Private room'
                  }
                  fullWidth
                >
                  {visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                </VisibilityToggle>
              </FormGroup>
            </Row>

            <FormGroup
              label={t('games.create.fieldNotes') || 'Notes (optional)'}
              htmlFor="notes"
            >
              <TextArea
                id="notes"
                placeholder={
                  t('games.create.notesPlaceholder') || 'Add notes...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                aria-label={
                  t('games.create.notesAria') || 'Additional notes for the room'
                }
                fullWidth
              />
            </FormGroup>
          </Section>

          {error && (
            <ErrorCard variant="outlined" padding="sm">
              {error}
            </ErrorCard>
          )}

          <Button type="submit" disabled={loading} size="lg" fullWidth>
            {loading
              ? t('games.create.submitCreating') || 'Creating...'
              : t('games.common.createRoom') || 'Create Room'}
          </Button>
        </Form>
      </Container>
    </PageLayout>
  );
}
