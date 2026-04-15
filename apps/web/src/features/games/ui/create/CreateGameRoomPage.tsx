'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { gamesApi } from '@/features/games/api';
import {
  Button,
  CreateRoomButton,
  PageLayout,
  Container,
  PageTitle,
  Section,
  Input,
  TextArea,
  FormGroup,
  Card,
} from '@arcadeum/ui';
import { gamesCatalog } from '@/features/games/ui/create/constants';
const CriticalCreationConfig = dynamic(
  () =>
    import('@/widgets/CriticalGame/ui/CreationConfig').then(
      (mod) => mod.CriticalCreationConfig,
    ),
  { ssr: false },
);

const SeaBattleCreationConfig = dynamic(
  () =>
    import('@/widgets/SeaBattleGame/ui/CreationConfig').then(
      (mod) => mod.SeaBattleCreationConfig,
    ),
  { ssr: false },
);
import { GameCreationConfigProps } from '@/features/games/types';

import { routes } from '@/shared/config/routes';

import {
  FormContainer,
  GameSelector,
  GameTileItem,
  GameTileContainer,
  GameTileName,
  GameTileSummary,
  Row,
} from '@/features/games/ui/create/styles';
import { YStack, XStack } from 'tamagui';

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
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);

  // 1. Source of Truth: URL
  const gameId = searchParams?.get('gameId') || visibleGames[0].id;
  const urlVariant = searchParams?.get('variant');

  // 2. Local state for non-URL options (expansions, house rules, etc.)
  const [localOptions, setLocalOptions] = useState<Record<string, unknown>>({});
  const [pendingVariant, setPendingVariant] = useState<string | null>(null);

  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  const defaultRoomName = useMemo(() => {
    const playerName = snapshot.displayName || snapshot.username || 'Anonymous';
    const template = homeCopy.defaultRoomName ?? "{{name}}'s game";
    return (
      formatMessage(template, { name: playerName }) ?? `${playerName}'s game`
    );
  }, [snapshot.displayName, snapshot.username, homeCopy.defaultRoomName]);

  const [name, setName] = useState(defaultRoomName);
  // Initialize prevDefaultRoomName for the effect
  const [prevDefaultRoomName, setPrevDefaultRoomName] =
    useState(defaultRoomName);
  const [isNameEdited, setIsNameEdited] = useState(false);

  // Sync name with defaultRoomName if it hasn't been edited
  if (
    !isNameEdited &&
    defaultRoomName &&
    defaultRoomName !== prevDefaultRoomName
  ) {
    setPrevDefaultRoomName(defaultRoomName);
    // Avoid resetting to a generic name if we have something better (except if truly anonymous)
    if (defaultRoomName !== "Anonymous's game" || !name) {
      setName(defaultRoomName);
    }
  }

  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [notes, setNotes] = useState('');

  // 3. Derived game options (merging URL variant with local options)
  // Use pendingVariant if available to bridge the gap during URL updates
  const gameOptions = useMemo(() => {
    const variantValue = pendingVariant || urlVariant || undefined;
    const options = { ...localOptions };

    // Inject the correct variant key based on the game
    if (gameId === 'critical_v1') {
      return { ...options, cardVariant: variantValue };
    }
    if (gameId === 'sea_battle_v1') {
      return { ...options, variant: variantValue };
    }

    return options;
  }, [localOptions, urlVariant, pendingVariant, gameId]);

  // Adjust pending variant during rendering if the URL has caught up.
  // This avoids the cascading render warning from useEffect.
  if (pendingVariant !== null && urlVariant === pendingVariant) {
    setPendingVariant(null);
  }

  // 4. State Update Handlers
  const updateUrl = useCallback(
    (updates: { gameId?: string; variant?: string | null }) => {
      const params = new URLSearchParams(searchParams?.toString());

      if (updates.gameId !== undefined) {
        params.set('gameId', updates.gameId);
        // Clear variant when switching games to avoid invalid theme links
        if (!updates.variant) params.delete('variant');
      }
      if (updates.variant !== undefined) {
        if (updates.variant) {
          params.set('variant', updates.variant);
        } else {
          params.delete('variant');
        }
      }

      router.replace(`${routes.games}/create?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const handleGameChange = useCallback(
    (newGameId: string) => {
      setLocalOptions({}); // Clear local options when switching games
      setPendingVariant(null);
      updateUrl({ gameId: newGameId, variant: null });
    },
    [updateUrl],
  );

  const handleOptionsChange = useCallback(
    (newOptions: Record<string, unknown>) => {
      const { cardVariant, variant, ...rest } = newOptions;

      // Determine which variant value to use based on the game
      let newVariant: string | undefined;
      if (gameId === 'critical_v1') {
        newVariant = cardVariant as string | undefined;
      } else if (gameId === 'sea_battle_v1') {
        newVariant = variant as string | undefined;
      } else {
        newVariant = (cardVariant || variant) as string | undefined;
      }

      const isChanged =
        newVariant !== undefined &&
        newVariant !== urlVariant &&
        newVariant !== pendingVariant;

      if (isChanged) {
        setPendingVariant(newVariant!);
        updateUrl({ variant: newVariant! });
      } else if (newVariant === undefined && urlVariant) {
        setPendingVariant(null);
        updateUrl({ variant: null });
      }

      setLocalOptions(rest);
    },
    [updateUrl, urlVariant, pendingVariant, gameId],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      setIsNameEdited(true);
    },
    [],
  );

  const handleNameFocus = useCallback(() => {
    setIsNameEdited(true);
  }, []);

  const {
    mutate: createRoom,
    isLoading: loading,
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
      triggerRefresh(['games', 'rooms']); // Refresh lists
      let roomUrl = routes.gameRoom(data.room.id);
      if (data.room.inviteCode) {
        roomUrl += `?inviteCode=${encodeURIComponent(data.room.inviteCode)}`;
      }
      router.push(roomUrl);
    },
  });

  const error = mutationError?.message || null;

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!name.trim() || loading) {
        return;
      }

      const maxPlayersNum = maxPlayers.trim() ? Number(maxPlayers) : undefined;
      const gameLimit = visibleGames.find((g) => g.id === gameId)?.maxPlayers;

      if (
        maxPlayersNum !== undefined &&
        (isNaN(maxPlayersNum) ||
          maxPlayersNum < 2 ||
          (gameLimit && maxPlayersNum > gameLimit))
      ) {
        return;
      }

      createRoom({});
    },
    [name, maxPlayers, gameId, createRoom, loading],
  );

  const GameConfigComponent = GAME_CONFIGS[gameId];

  return (
    <PageLayout>
      <Container size="md">
        <PageTitle size="lg">
          {t('games.create.title') || 'Create Game Room'}
        </PageTitle>
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <Section title={t('games.create.sectionGame') || 'Select Game'}>
              <GameSelector>
                {visibleGames.map((game) => (
                  <GameTileContainer
                    key={game.id}
                    disabled={!game.isPlayable}
                    onPress={() => game.isPlayable && handleGameChange(game.id)}
                    data-testid={`game-tile-${game.id}`}
                  >
                    <GameTileItem
                      active={gameId === game.id}
                      disabled={!game.isPlayable}
                    >
                      <GameTileName>
                        {t(`games.${game.id}.name` as TranslationKey) ||
                          game.name}
                      </GameTileName>
                      <GameTileSummary>
                        {t(`games.${game.id}.description` as TranslationKey) ||
                          game.summary}
                      </GameTileSummary>
                    </GameTileItem>
                  </GameTileContainer>
                ))}
              </GameSelector>
            </Section>

            {GameConfigComponent && (
              <GameConfigComponent
                options={gameOptions}
                onChange={handleOptionsChange}
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
                  onChange={handleNameChange}
                  onFocus={handleNameFocus}
                  required
                  aria-required="true"
                  fullWidth
                  size="lg"
                />
              </FormGroup>

              <Row>
                <FormGroup
                  flexGrow={1}
                  flexBasis={0}
                  $xs={{ flexGrow: 0, flexBasis: 'auto' }}
                  label={
                    t('games.create.fieldMaxPlayers') ||
                    'Max Players (optional)'
                  }
                  htmlFor="max-players"
                >
                  <XStack gap="$2" alignItems="flex-start">
                    <Input
                      key="max-players-input"
                      id="max-players"
                      type="number"
                      min="2"
                      max={
                        visibleGames.find((g) => g.id === gameId)?.maxPlayers ||
                        undefined
                      }
                      placeholder={t('games.create.autoPlaceholder') || 'Auto'}
                      value={maxPlayers}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMaxPlayers(e.target.value)
                      }
                      aria-label={
                        t('games.create.maxPlayersAria') ||
                        'Maximum number of players'
                      }
                      flex={1}
                      fullWidth
                      size="lg"
                    />
                    {maxPlayers ? (
                      <YStack
                        flexShrink={0}
                        width={150}
                        justifyContent="center"
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          onPress={() => setMaxPlayers('')}
                          size="lg"
                          aria-label="Set to Auto"
                          data-testid="auto-max-players-button"
                          width="100%"
                        >
                          {t('games.create.autoButton') || 'Auto'}
                        </Button>
                      </YStack>
                    ) : null}
                  </XStack>
                </FormGroup>

                <FormGroup
                  flexGrow={1}
                  flexBasis={0}
                  $xs={{ flexGrow: 0, flexBasis: 'auto' }}
                  label={t('games.create.fieldVisibility') || 'Visibility'}
                  htmlFor="visibility"
                >
                  <Button
                    id="visibility"
                    type="button"
                    variant="secondary"
                    isActive={visibility === 'public'}
                    onPress={() =>
                      setVisibility(
                        visibility === 'public' ? 'private' : 'public',
                      )
                    }
                    aria-pressed={visibility === 'public'}
                    aria-label={
                      visibility === 'public' ? 'Public room' : 'Private room'
                    }
                    data-testid="visibility-toggle-button"
                    fullWidth
                    size="lg"
                  >
                    {visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                  </Button>
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
                  onChangeText={setNotes}
                  aria-label={
                    t('games.create.notesAria') ||
                    'Additional notes for the room'
                  }
                  fullWidth
                />
              </FormGroup>
            </Section>

            {error && (
              <Card variant="error" padding="sm">
                {error}
              </Card>
            )}

            <CreateRoomButton
              type="submit"
              disabled={loading}
              fullWidth
              data-testid="create-room-button"
            >
              {loading
                ? t('games.create.submitCreating') || 'Creating...'
                : t('games.common.createRoom') || 'Create Room'}
            </CreateRoomButton>
          </FormContainer>
        </form>
      </Container>
    </PageLayout>
  );
}
