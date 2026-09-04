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
import { trackSocialRoomCreated } from '@/shared/analytics/funnel';
import { useGameInviteStore } from '@/features/games/store/gameInviteStore';
import {
  buildComingSoonMaps,
  isCreateBlocked,
} from '@/features/games/ui/create/createPageState';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';

import s from './GameCreateView.module.scss';
import { SectionGroup } from './SectionGroup';
import { SelectedGameCard } from './SelectedGameCard';
import { RoomDetails } from './RoomDetails';
import { PreviewRail } from './PreviewRail';
import { VISIBLE_GAMES, themesFor, type GameId } from './data/themes';
import {
  ROOM_NAME_MAX,
  type CreateRoomForm,
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
  spades_v1: 'spades_v1',
  go_v1: 'go_v1',
  pachisi_v1: 'pachisi_v1',
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
    roomName: '',
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
      mode: 'american',
    };
  } else if (form.gameId === 'cat_dash_v1') {
    options = {
      variant: 'standard',
    };
  } else if (form.gameId === 'backgammon_v1') {
    options = {
      mode: 'standard',
    };
  } else if (form.gameId === 'hearts_v1') {
    options = {
      passingEnabled: true,
      targetScore: 100,
    };
  } else if (form.gameId === 'spades_v1') {
    options = {
      nilEnabled: true,
      targetScore: 500,
    };
  } else if (form.gameId === 'go_v1') {
    options = {
      boardSize: 9,
    };
  } else if (form.gameId === 'pachisi_v1') {
    options = {
      mode: 'standard',
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

  const [hostRoomNumber, setHostRoomNumber] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getMyRoomCount({ token: snapshot.accessToken || undefined })
      .then((res) => {
        if (!cancelled && res?.nextRoomNumber) {
          setHostRoomNumber(res.nextRoomNumber);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [snapshot.accessToken]);

  const defaultRoomName = useMemo(() => {
    const playerName = snapshot.displayName || snapshot.username || 'Anonymous';
    const template =
      messages.home?.defaultRoomName ?? "{{name}}'s game #{{number}}";
    const formatted = formatMessage(template, {
      name: playerName,
      number: hostRoomNumber,
    });
    if (formatted && formatted.includes('#')) {
      return formatted;
    }
    return `${formatted || `${playerName}'s game`} #${hostRoomNumber}`;
  }, [
    snapshot.displayName,
    snapshot.username,
    hostRoomNumber,
    messages.home?.defaultRoomName,
  ]);

  const [form, setForm] = useState<CreateRoomForm>(() =>
    initialForm(urlGameId, urlVariant),
  );
  const [customRoomName, setCustomRoomName] = useState<string | null>(null);

  const activeRoomName =
    customRoomName !== null ? customRoomName : defaultRoomName;

  const currentForm = useMemo(
    () => ({ ...form, roomName: activeRoomName }),
    [form, activeRoomName],
  );

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
    const currentTheme = searchParams?.get('theme');
    const currentVariant = searchParams?.get('variant');
    if (
      form.themeId &&
      (!currentTheme || currentVariant) &&
      currentTheme !== form.themeId
    ) {
      updateUrl({ gameId: form.gameId, themeId: form.themeId });
    }
  }, [form.gameId, form.themeId, searchParams, updateUrl]);

  const handleThemeChange = useCallback(
    (nextThemeId: string) => {
      setForm((prev) => ({ ...prev, themeId: nextThemeId }));
      updateUrl({ gameId: form.gameId, themeId: nextThemeId });
    },
    [form.gameId, updateUrl],
  );

  const handleCycleTheme = useCallback(() => {
    const themes = themesFor(form.gameId);
    if (themes.length <= 1) return;
    const idx = themes.findIndex((t) => t.id === form.themeId);
    const next = themes[(idx + 1) % themes.length];
    if (next?.id) {
      handleThemeChange(next.id);
    }
  }, [form.gameId, form.themeId, handleThemeChange]);

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
    if (patch.roomName !== undefined) {
      setCustomRoomName(patch.roomName);
    }
    setForm((prev) => ({ ...prev, ...patch }));
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
    activeRoomName.trim().length > 0 &&
    activeRoomName.trim().length <= ROOM_NAME_MAX;

  const {
    mutate: submit,
    isLoading: loading,
    error: mutationError,
  } = useMutation({
    mutationFn: async () => {
      return gamesApi.createRoom(
        {
          gameId: form.gameId,
          name: activeRoomName.trim(),
          visibility: toApiVisibility(form.visibility),
          maxPlayers: form.maxPlayers === 'auto' ? undefined : form.maxPlayers,
          notes: form.notes.trim() || undefined,
          password: form.password.trim() || undefined,
          gameOptions: buildGameOptions(currentForm),
        },
        { token: snapshot.accessToken || undefined },
      );
    },
    onSuccess: async (data) => {
      triggerRefresh(['games', 'rooms']);
      if (!data?.room?.id) return;
      trackSocialRoomCreated(form.gameId);

      const inviteUserId =
        searchParams?.get('inviteUser') ??
        useGameInviteStore.getState().consumeInviteUser();

      if (inviteUserId && snapshot.accessToken) {
        try {
          await gamesApi.invitePlayers(data.room.id, [inviteUserId], {
            token: snapshot.accessToken,
          });
        } catch {
          // Non-critical — room is still created
        }
      }

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

  return (
    <PageLayout>
      <div className={s.page}>
        <Container size="lg">
          <div className={s.container}>
            <header className={`${s.head} ${s.fade}`}>
              <div>
                <span className={s.eyebrow}>{L.eyebrow}</span>
                <h1>
                  <span className={s.srOnly}>{L.heading}</span>
                  <span aria-hidden="true">
                    {L.titleMain} <em>{L.titleAccent}</em>
                  </span>
                </h1>
                <p className={s.intro}>{L.intro}</p>
              </div>
            </header>

            <div className={s.grid}>
              <div className={s.colLeft}>
                <SelectedGameCard
                  gameId={form.gameId}
                  themeId={form.themeId}
                  roomNumber={hostRoomNumber}
                  labels={{ changeGame: L.changeGame }}
                  onCycleTheme={handleCycleTheme}
                />

                <SectionGroup num="01" title={L.sectionDetails}>
                  <RoomDetails
                    gameId={form.gameId}
                    form={currentForm}
                    labels={L.details}
                    onChange={patchForm}
                  />
                </SectionGroup>
              </div>

              <PreviewRail
                form={currentForm}
                isValid={isValid}
                loading={loading}
                blocked={blocked}
                error={errorMessage}
                labels={L.rail(defaultRoomName)}
                cta={L.cta}
                onSubmit={handleSubmit}
                onThemeChange={handleThemeChange}
              />
            </div>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}

export default GameCreateView;
