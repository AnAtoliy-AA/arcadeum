'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gamesApi } from '@/features/games/api';
import {
  PageLayout,
  Container,
  PageTitle,
  Section,
  Button,
  Input,
  TextArea,
  FormGroup,
} from '@/shared/ui';
import { gamesCatalog } from './constants';
import { CriticalCreationConfig } from '@/widgets/CriticalGame/ui/CreationConfig';
import { SeaBattleCreationConfig } from '@/widgets/SeaBattleGame/ui/CreationConfig';
import { GameCreationConfigProps } from '@/features/games/types';

import {
  Form,
  GameSelector,
  GameTile,
  GameTileName,
  GameTileSummary,
  ErrorCard,
  Row,
  VisibilityToggle,
} from './styles';

// Filter out hidden games for display
const visibleGames = gamesCatalog.filter((game) => !game.isHidden);

const GAME_CONFIGS: Record<
  string,
  React.ComponentType<GameCreationConfigProps<Record<string, unknown>>>
> = {
  critical_v1: CriticalCreationConfig as unknown as React.ComponentType<
    GameCreationConfigProps<Record<string, unknown>>
  >,
  sea_battle_v1: SeaBattleCreationConfig as unknown as React.ComponentType<
    GameCreationConfigProps<Record<string, unknown>>
  >,
};

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
  const [gameOptions, setGameOptions] = useState<Record<string, unknown>>({});

  // Reset options when game changes
  const handleGameChange = (newGameId: string) => {
    setGameId(newGameId);
    setGameOptions({});
  };

  const {
    mutate: createRoom,
    isPending: loading,
    error: mutationError,
  } = useMutation({
    mutationFn: async () => {
      const maxPlayersNum = maxPlayers.trim() ? Number(maxPlayers) : undefined;

      return gamesApi.createRoom(
        {
          gameId,
          name: name.trim(),
          visibility,
          maxPlayers: maxPlayersNum,
          notes: notes.trim() || undefined,
          gameOptions,
        },
        { token: snapshot.accessToken || undefined },
      );
    },
    onSuccess: (data) => {
      // For private rooms, include invite code so creator auto-joins
      const roomUrl = data.room.inviteCode
        ? `/games/rooms/${data.room.id}?inviteCode=${encodeURIComponent(data.room.inviteCode)}`
        : `/games/rooms/${data.room.id}`;
      router.push(roomUrl);
    },
  });

  const error =
    mutationError instanceof Error
      ? mutationError.message
      : mutationError
        ? 'Failed to create room'
        : null;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!snapshot.accessToken) {
        return;
      }

      if (!name.trim()) {
        return;
      }

      const maxPlayersNum = maxPlayers.trim() ? Number(maxPlayers) : undefined;
      if (
        maxPlayersNum !== undefined &&
        (isNaN(maxPlayersNum) || maxPlayersNum < 2)
      ) {
        return;
      }

      createRoom();
    },
    [snapshot.accessToken, name, maxPlayers, createRoom],
  );

  const GameConfigComponent = GAME_CONFIGS[gameId];

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
                  onClick={() => game.isPlayable && handleGameChange(game.id)}
                >
                  <GameTileName>{game.name}</GameTileName>
                  <GameTileSummary>{game.summary}</GameTileSummary>
                </GameTile>
              ))}
            </GameSelector>
          </Section>

          {GameConfigComponent && (
            <GameConfigComponent
              options={gameOptions}
              onChange={setGameOptions}
            />
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

          {!snapshot.accessToken && (
            <ErrorCard
              variant="outlined"
              padding="sm"
              style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div>
                {t('games.create.loginRequired') ||
                  'You need to be logged in to create a room.'}
              </div>
              <Button
                type="button"
                onClick={() => router.push('/auth')}
                size="sm"
              >
                {t('games.create.loginButton') || 'Login'}
              </Button>
            </ErrorCard>
          )}

          <Button
            type="submit"
            disabled={loading || !snapshot.accessToken}
            size="lg"
            fullWidth
          >
            {loading
              ? t('games.create.submitCreating') || 'Creating...'
              : t('games.common.createRoom') || 'Create Room'}
          </Button>
        </Form>
      </Container>
    </PageLayout>
  );
}
