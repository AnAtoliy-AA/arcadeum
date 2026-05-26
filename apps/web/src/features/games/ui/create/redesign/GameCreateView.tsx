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

import s from './GameCreateView.module.css';
import { SectionGroup } from './SectionGroup';
import { QuickPresets } from './QuickPresets';
import { GamePicker } from './GamePicker';
import { ExpansionPacks } from './ExpansionPacks';
import { ThemePicker } from './ThemePicker';
import { HouseRules } from './HouseRules';
import { RoomDetails } from './RoomDetails';
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
};

function parseInitialGameId(raw: string | null | undefined): GameId {
  if (raw && URL_TO_GAME_ID[raw]) return URL_TO_GAME_ID[raw];
  return VISIBLE_GAMES[0];
}

function initialForm(
  gameId: GameId,
  themeId: string | undefined,
  defaultRoomName: string,
): CreateRoomForm {
  const themes = themesFor(gameId);
  const resolvedTheme =
    themeId && themes.some((t) => t.id === themeId)
      ? themeId
      : (themes[0]?.id ?? '');
  return {
    gameId,
    themeId: resolvedTheme,
    expansionPackIds: ['core'],
    maxPlayers: 'auto',
    visibility: 'public',
    roomName: defaultRoomName,
    notes: '',
    rules: {
      combos: false,
      idle: false,
      teams: false,
      spectators: true,
    },
    preset: 'custom',
  };
}

function toApiVisibility(v: Visibility): 'public' | 'private' {
  return v === 'public' ? 'public' : 'private';
}

function buildGameOptions(form: CreateRoomForm): Record<string, unknown> {
  if (form.gameId === 'critical_v1') {
    return {
      cardVariant: form.themeId || undefined,
      expansionPacks: form.expansionPackIds.filter((id) => id !== 'core'),
      houseRules: {
        actionCardCombos: form.rules.combos,
        idleTimerAutoplay: form.rules.idle,
      },
      allowSpectators: form.rules.spectators,
    };
  }
  if (form.gameId === 'sea_battle_v1') {
    return {
      variant: form.themeId || undefined,
      teams: form.rules.teams,
      idleTimerAutoplay: form.rules.idle,
      allowSpectators: form.rules.spectators,
    };
  }
  if (form.gameId === 'tic_tac_toe_v1') {
    return {
      variant: form.themeId || 'classic',
      boardSize: 3,
      teamMode: form.rules.teams,
      allowSpectators: form.rules.spectators,
    };
  }
  return {
    idleTimerAutoplay: form.rules.idle,
    allowSpectators: form.rules.spectators,
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
  const urlVariant = searchParams?.get('variant') ?? undefined;

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
        params.set('variant', next.themeId);
      } else {
        params.delete('variant');
      }
      router.replace(`${routes.games}/create?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams, routes.games],
  );

  // Sync the URL with the resolved default theme on mount so deep links
  // like /games/create?gameId=critical_v1 (no variant) land on
  // /games/create?gameId=critical_v1&variant=<default>. Keeps the
  // browser address bar honest about what the form is rendering and lets
  // existing e2e coverage assert `/variant=/` against the new layout.
  useEffect(() => {
    if (form.themeId && !searchParams?.get('variant')) {
      updateUrl({ gameId: form.gameId, themeId: form.themeId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patchForm(
    patch: Partial<
      Pick<
        CreateRoomForm,
        'roomName' | 'maxPlayers' | 'visibility' | 'notes' | 'preset'
      >
    >,
  ) {
    setForm((prev) => ({ ...prev, ...patch }));
    if (patch.roomName !== undefined) setIsNameEdited(true);
  }

  function setGameId(newGameId: GameId) {
    const themes = themesFor(newGameId);
    const themeId = themes[0]?.id ?? '';
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
    setForm({ ...form, themeId });
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

  function setRules(rules: CreateRoomForm['rules']) {
    setForm((prev) => ({ ...prev, rules, preset: 'custom' }));
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
  const { gameComingSoon, variantComingSoon } = useMemo(
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
  let n = 1;
  const numGame = String(n++).padStart(2, '0');
  const numExpansion = game.hasExpansion ? String(n++).padStart(2, '0') : null;
  const numTheme = game.hasThemes ? String(n++).padStart(2, '0') : null;
  const numRules = String(n++).padStart(2, '0');
  const numDetails = String(n++).padStart(2, '0');

  return (
    <PageLayout>
      <main className={s.page}>
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

                {numTheme ? (
                  <SectionGroup num={numTheme} title={L.sectionTheme}>
                    <ThemePicker
                      gameId={form.gameId}
                      value={form.themeId}
                      onChange={setThemeId}
                    />
                  </SectionGroup>
                ) : null}

                <SectionGroup
                  num={numRules}
                  title={L.sectionRules}
                  hint={L.optional}
                >
                  <HouseRules
                    gameId={form.gameId}
                    value={form.rules}
                    labels={L.rules}
                    onChange={setRules}
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
      </main>
    </PageLayout>
  );
}

export default GameCreateView;
