'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { gamesApi, type CatalogResponse } from '@/features/games/api';
import { buildComingSoonMaps, isCreateBlocked } from './createPageState';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { CreateRoomButton } from '@arcadeum/ui/components/Button/SpecializedButtons';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { PageTitle } from '@arcadeum/ui/components/PageTitle/PageTitle';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Input } from '@arcadeum/ui/components/Input/Input';
import { TextArea } from '@arcadeum/ui/components/TextArea/TextArea';
import { FormGroup } from '@arcadeum/ui/components/FormGroup/FormGroup';
import { Card } from '@arcadeum/ui/components/Card/Card';
import { gamesCatalog } from '@/features/games/ui/create/constants';
const CriticalCreationConfig = dynamic(
  () => import('@/widgets/CriticalGame/ui/CreationConfig'),
  { ssr: false },
);

const SeaBattleCreationConfig = dynamic(
  () => import('@/widgets/SeaBattleGame/ui/CreationConfig'),
  { ssr: false },
);
import { GameCreationConfigProps } from '@/features/games/types';

import { useRoutes } from '@/shared/config/useRoutes';

import {
  FormContainer,
  Row,
  StickyMobileCta,
} from '@/features/games/ui/create/styles';
import { GameSelectorSection } from './GameSelectorSection';
import { YStack, XStack, Text } from 'tamagui';

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

export default function CreateGameRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((d) => {
        if (!cancelled) setCatalog(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const { gameComingSoon, variantComingSoon } = useMemo(
    () => buildComingSoonMaps(catalog),
    [catalog],
  );

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

  const createBlocked = isCreateBlocked(
    gameComingSoon,
    variantComingSoon,
    gameId,
    pendingVariant || urlVariant,
  );

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
    [router, searchParams, routes.games],
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
      if (!data?.room?.id) {
        return;
      }
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

      if (!name.trim() || loading || createBlocked) {
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
    [name, maxPlayers, gameId, createRoom, loading, createBlocked],
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
            <GameSelectorSection
              games={visibleGames}
              selectedId={gameId}
              gameComingSoon={gameComingSoon}
              onSelect={handleGameChange}
            />

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
                          onClick={() => setMaxPlayers('')}
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
                    onClick={() =>
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
                <Text>{error}</Text>
              </Card>
            )}

            <StickyMobileCta>
              <CreateRoomButton
                type="submit"
                disabled={loading || createBlocked}
                fullWidth
                data-testid="create-room-button"
              >
                {createBlocked
                  ? t('games.create.comingSoon') || 'Coming Soon'
                  : loading
                    ? t('games.create.submitCreating') || 'Creating...'
                    : t('games.common.createRoom') || 'Create Room'}
              </CreateRoomButton>
            </StickyMobileCta>
          </FormContainer>
        </form>
      </Container>
    </PageLayout>
  );
}
