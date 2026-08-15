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
import { CreateRoomButton } from '@arcadeum/ui/components/Button/SpecializedButtons';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { PageTitle } from '@arcadeum/ui/components/PageTitle/PageTitle';
import { Card } from '@arcadeum/ui/components/Card/Card';
import { gamesCatalog } from '@/features/games/ui/create/constants';
import { RoomDetailsSection } from './RoomDetailsSection';
const CriticalCreationConfig = dynamic(
  () => import('@/widgets/CriticalGame/ui/CreationConfig'),
  { ssr: false },
);

const SeaBattleCreationConfig = dynamic(
  () => import('@/widgets/SeaBattleGame/ui/CreationConfig'),
  { ssr: false },
);

const TicTacToeCreationConfig = dynamic(
  () => import('@/widgets/TicTacToeGame/ui/CreationConfig'),
  { ssr: false },
);

const CascadeCreationConfig = dynamic(
  () => import('@/widgets/CascadeGame/ui/CreationConfig'),
  { ssr: false },
);
import { GameCreationConfigProps } from '@/features/games/types';

import { useRoutes } from '@/shared/config/useRoutes';

import {
  FormContainer,
  StickyMobileCta,
} from '@/features/games/ui/create/styles';
import { GameSelectorSection } from './GameSelectorSection';

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
  tic_tac_toe_v1: TicTacToeCreationConfig as unknown as React.ComponentType<
    GameCreationConfigProps<Record<string, unknown>>
  >,
  cascade_v1: CascadeCreationConfig as unknown as React.ComponentType<
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
  const [password, setPassword] = useState('');

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
          password: password.trim() || undefined,
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

            <RoomDetailsSection
              name={name}
              onNameChange={handleNameChange}
              onNameFocus={handleNameFocus}
              maxPlayers={maxPlayers}
              onMaxPlayersChange={(value) => setMaxPlayers(value)}
              visibility={visibility}
              onVisibilityToggle={() =>
                setVisibility(visibility === 'public' ? 'private' : 'public')
              }
              password={password}
              onPasswordChange={(value) => setPassword(value)}
              notes={notes}
              onNotesChange={(value) => setNotes(value)}
              gameId={gameId}
              t={t}
            />

            {error && (
              <Card variant="error" padding="sm">
                <span className="box-border">{error}</span>
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
