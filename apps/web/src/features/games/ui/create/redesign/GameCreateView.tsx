'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { useRoutes } from '@/shared/config/useRoutes';
import { gamesApi, type CatalogResponse } from '@/features/games/api';
import {
  buildComingSoonMaps,
  isCreateBlocked,
} from '@/features/games/ui/create/createPageState';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';

import s from './GameCreateView.module.scss';
import { SectionGroup } from './SectionGroup';
import { QuickPresets } from './QuickPresets';
import { GamePicker } from './GamePicker';
import { ThemePicker } from './ThemePicker';
import { ExpansionPacks } from './ExpansionPacks';
import { RoomDetails } from './RoomDetails';
import { HouseRules } from './HouseRules';
import { PreviewRail } from './PreviewRail';
import { GAMES, VISIBLE_GAMES, themesFor, type GameId } from './data/themes';
import { applyPreset } from './data/presets';
import {
  ROOM_NAME_MAX,
  type CreateRoomForm,
  type PresetId,
  type Visibility,
} from './data/form';
import { buildLabels } from './data/labels';

const URL_TO_GAME_ID: Record<string, GameId> = {
  critical_v1: 'critical_v1',
  sea_battle_v1: 'sea_battle_v1',
  glimworm_v1: 'glimworm_v1',
  tic_tac_toe_v1: 'tic_tac_toe_v1',
  cascade_v1: 'cascade_v1',
  chess_v1: 'chess_v1',
  checkers_v1: 'checkers_v1',
  cat_dash_v1: 'cat_dash_v1',
  backgammon_v1: 'backgammon_v1',
  hearts_v1: 'hearts_v1',
};

function parseInitialGameId(raw: string | null | undefined): GameId {
  if (raw && URL_TO_GAME_ID[raw]) return URL_TO_GAME_ID[raw];
  return VISIBLE_GAMES[0];
}

function defaultThemeFor(gameId: GameId): string {
  const themes = themesFor(gameId);
  const preferred = themes.find(
    (t) => t.id === 'adventure' || t.id === 'classic',
  );
  return preferred?.id ?? themes[0]?.id ?? 'adventure';
}

function initialForm(
  gameId: GameId,
  themeId: string | undefined,
  defaultRoomName: string,
): CreateRoomForm {
  const themes = themesFor(gameId);
  const defaultTheme = defaultThemeFor(gameId);
  const resolvedTheme =
    themeId && themes.some((t) => t.id === themeId) ? themeId : defaultTheme;
  return {
    gameId,
    themeId: resolvedTheme,
    expansionPackIds: ['core'],
    maxPlayers: 'auto',
    visibility: 'public',
    roomName: defaultRoomName,
    notes: '',
    password: '',
    rules: {
      combos: false,
      idle: false,
      teams: false,
      spectators: true,
    },
    preset: 'custom',
    ranked: false,
  };
}

function toApiVisibility(v: Visibility): 'public' | 'private' {
  return v === 'public' ? 'public' : 'private';
}

function buildGameOptions(form: CreateRoomForm): Record<string, unknown> {
  let options: Record<string, unknown>;
  if (form.gameId === 'critical_v1') {
    options = {
      expansionPacks: form.expansionPackIds.filter((id) => id !== 'core'),
    };
  } else if (form.gameId === 'chess_v1') {
    options = {
      variant: 'standard',
    };
  } else if (form.gameId === 'sea_battle_v1') {
    options = {
      variant: 'classic',
      gridSize: 10,
      shipCount: 10,
    };
  } else if (form.gameId === 'checkers_v1') {
    options = {
      variant: 'american',
    };
  } else if (form.gameId === 'cat_dash_v1') {
    options = {
      variant: 'standard',
    };
  } else if (form.gameId === 'backgammon_v1') {
    options = {
      variant: 'standard',
    };
  } else if (form.gameId === 'hearts_v1') {
    options = {
      passingEnabled: true,
      targetScore: 100,
    };
  } else {
    options = {};
  }
  return {
    ...options,
    theme: form.themeId || 'adventure',
    ranked: form.ranked,
  };
}

export function GameCreateView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const { messages } = useLanguage();
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);

  const urlGameId = parseInitialGameId(searchParams?.get('gameId'));
  const urlVariant =
    searchParams?.get('theme') ?? searchParams?.get('variant') ?? undefined;

  const defaultRoomName = useMemo(() => {
    const playerName = snapshot.displayName || snapshot.username || 'Anonymous';
    const template = messages.home?.defaultRoomName ?? "{{name}}'s game";
    return (
      formatMessage(template, { name: playerName }) ?? `${playerName}'s game`
    );
  }, [snapshot.displayName, snapshot.username, messages.home?.defaultRoomName]);

  const [form, setForm] = useState<CreateRoomForm>(() =>
    initialForm(urlGameId, urlVariant, defaultRoomName),
  );
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [prevDefaultName, setPrevDefaultName] = useState(defaultRoomName);

  // Render-phase sync — replaces the cascading useEffect pattern.
  if (!isNameEdited && defaultRoomName && defaultRoomName !== prevDefaultName) {
    setPrevDefaultName(defaultRoomName);
    if (form.roomName !== defaultRoomName) {
      setForm({ ...form, roomName: defaultRoomName });
    }
  }

  const updateUrl = useCallback(
    (next: { gameId: GameId; themeId: string }) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set('gameId', next.gameId);
      if (next.themeId) {
        params.set('theme', next.themeId);
      } else {
        params.delete('theme');
      }
      params.delete('variant');
      router.replace(`${routes.games}/create?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams, routes.games],
  );

  useEffect(() => {
    if (
      form.themeId &&
      (!searchParams?.get('theme') || searchParams?.get('variant'))
    ) {
      updateUrl({ gameId: form.gameId, themeId: form.themeId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patchForm(
    patch: Partial<
      Pick<
        CreateRoomForm,
        | 'roomName'
        | 'maxPlayers'
        | 'visibility'
        | 'notes'
        | 'password'
        | 'preset'
        | 'ranked'
      >
    >,
  ) {
    setForm((prev) => ({ ...prev, ...patch }));
    if (patch.roomName !== undefined) setIsNameEdited(true);
  }

  function setGameId(newGameId: GameId) {
    const themeId = defaultThemeFor(newGameId);
    const game = GAMES[newGameId];
    let maxPlayers = form.maxPlayers;
    if (
      typeof maxPlayers === 'number' &&
      (maxPlayers < game.players.min || maxPlayers > game.players.max)
    ) {
      maxPlayers = 'auto';
    }
    setForm({
      ...form,
      gameId: newGameId,
      themeId,
      maxPlayers,
      expansionPackIds:
        newGameId === 'critical_v1' ? form.expansionPackIds : ['core'],
    });
    updateUrl({ gameId: newGameId, themeId });
  }

  function setThemeId(themeId: string) {
    setForm((prev) => ({ ...prev, themeId, preset: 'custom' }));
    updateUrl({ gameId: form.gameId, themeId });
  }

  function setExpansionPackIds(ids: string[]) {
    const withCore = ids.includes('core') ? ids : ['core', ...ids];
    setForm((prev) => ({
      ...prev,
      expansionPackIds: withCore,
      preset: 'custom',
    }));
  }

  function pickPreset(preset: Exclude<PresetId, 'custom'>) {
    setForm((prev) => applyPreset(prev, preset));
  }

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
  const { gameComingSoon, variantComingSoon, ruleComingSoon } = useMemo(
    () => buildComingSoonMaps(catalog),
    [catalog],
  );

  const blocked = isCreateBlocked(
    gameComingSoon,
    variantComingSoon,
    form.gameId,
    form.themeId,
  );

  const isValid =
    form.roomName.trim().length > 0 &&
    form.roomName.trim().length <= ROOM_NAME_MAX;

  const {
    mutate: submit,
    isLoading: loading,
    error: mutationError,
  } = useMutation({
    mutationFn: async () => {
      return gamesApi.createRoom(
        {
          gameId: form.gameId,
          name: form.roomName.trim(),
          visibility: toApiVisibility(form.visibility),
          maxPlayers: form.maxPlayers === 'auto' ? undefined : form.maxPlayers,
          notes: form.notes.trim() || undefined,
          password: form.password.trim() || undefined,
          gameOptions: buildGameOptions(form),
        },
        { token: snapshot.accessToken || undefined },
      );
    },
    onSuccess: (data) => {
      triggerRefresh(['games', 'rooms']);
      if (!data?.room?.id) return;
      let roomUrl = routes.gameRoom(data.room.id);
      if (data.room.inviteCode) {
        roomUrl += `?inviteCode=${encodeURIComponent(data.room.inviteCode)}`;
      }
      router.push(roomUrl);
    },
  });

  const errorMessage = mutationError?.message ?? null;

  const handleSubmit = useCallback(() => {
    if (!isValid || loading || blocked) return;
    submit({});
  }, [isValid, loading, blocked, submit]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSubmit]);

  const L = useMemo(() => buildLabels(t), [t]);

  const game = GAMES[form.gameId];
  const themes = themesFor(form.gameId);
  const hasThemes = themes.length > 0;
  let n = 1;
  const numGame = String(n++).padStart(2, '0');
  const numTheme = hasThemes ? String(n++).padStart(2, '0') : null;
  const numExpansion = game.hasExpansion ? String(n++).padStart(2, '0') : null;
  const numRules = String(n++).padStart(2, '0');
  const numDetails = String(n++).padStart(2, '0');

  return (
    <PageLayout>
      <div className={s.page}>
        <Container size="lg">
          <div className={s.container}>
            <header className={`${s.head} ${s.fade}`}>
              <div>
                <span className={s.eyebrow}>{L.eyebrow}</span>
                <h1>
                  {/* Accessible name + heading text for assistive tech and
                      e2e tests that target the page by its functional
                      title. The editorial copy below is the visible
                      headline. */}
                  <span className={s.srOnly}>{L.heading}</span>
                  <span aria-hidden="true">
                    {L.titleMain} <em>{L.titleAccent}</em>
                  </span>
                </h1>
                <p className={s.intro}>{L.intro}</p>
              </div>
              <QuickPresets
                value={form.preset}
                options={L.presets}
                onChange={pickPreset}
              />
            </header>

            <div className={s.grid}>
              <div className={s.colLeft}>
                <SectionGroup num={numGame} title={L.sectionGame}>
                  <GamePicker
                    value={form.gameId}
                    themeId={form.themeId}
                    comingSoon={gameComingSoon}
                    labels={L.gamePicker}
                    onChange={setGameId}
                  />
                </SectionGroup>

                {numTheme ? (
                  <SectionGroup num={numTheme} title={L.sectionTheme}>
                    <ThemePicker
                      gameId={form.gameId}
                      value={form.themeId}
                      onChange={setThemeId}
                    />
                  </SectionGroup>
                ) : null}

                {numExpansion ? (
                  <SectionGroup
                    num={numExpansion}
                    title={L.sectionExpansions}
                    hint={
                      form.expansionPackIds.length <= 1 ? L.coreOnly : undefined
                    }
                  >
                    <ExpansionPacks
                      value={form.expansionPackIds}
                      labels={L.expansion}
                      onChange={setExpansionPackIds}
                    />
                  </SectionGroup>
                ) : null}

                <SectionGroup num={numRules} title={L.sectionRules}>
                  <HouseRules
                    gameId={form.gameId}
                    value={form.rules}
                    labels={L.rules}
                    ruleComingSoon={ruleComingSoon}
                    onChange={(rules) =>
                      setForm((prev) => ({ ...prev, rules }))
                    }
                  />
                </SectionGroup>

                <SectionGroup num={numDetails} title={L.sectionDetails}>
                  <RoomDetails
                    gameId={form.gameId}
                    form={form}
                    labels={L.details}
                    onChange={patchForm}
                  />
                </SectionGroup>
              </div>

              <PreviewRail
                form={form}
                isValid={isValid}
                loading={loading}
                blocked={blocked}
                error={errorMessage}
                labels={L.rail(defaultRoomName)}
                cta={L.cta}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}

export default GameCreateView;
