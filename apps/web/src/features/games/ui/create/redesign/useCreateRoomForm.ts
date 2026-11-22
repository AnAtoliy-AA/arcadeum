'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useLanguage, formatMessage } from '@/shared/i18n';
import { useRoutes } from '@/shared/config/useRoutes';
import { gamesApi, type CatalogResponse } from '@/features/games/api';
import { trackSocialRoomCreated } from '@/shared/analytics/funnel';
import {
  buildComingSoonMaps,
  isCreateBlocked,
} from '@/features/games/ui/create/createPageState';
import { themesFor, type GameId } from './data/themes';
import type { CreateRoomForm, PresetId } from './data/form';
import {
  applyGamePreset,
  buildGameOptions,
  initialForm,
  parseInitialGameId,
  switchGame,
  toApiVisibility,
  validateRoomName,
} from './data/createFlow';

type FormPatch = Partial<
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
>;

/**
 * All state and side effects of the create-room page: URL-seeded form, room
 * name default, catalog availability, validation and the submit mutation.
 * The view only renders what this hook returns.
 */
export function useCreateRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
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
      .catch(() => {
        // Non-critical: the default name just falls back to #1.
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot.accessToken]);

  const defaultRoomName = useMemo(() => {
    const playerName = snapshot.accessToken
      ? snapshot.displayName || snapshot.username || 'Anonymous'
      : 'Anonymous';
    const template =
      messages.home?.defaultRoomName ?? "{{name}}'s game #{{number}}";
    const formatted = formatMessage(template, {
      name: playerName,
      number: hostRoomNumber,
    });
    if (formatted && formatted.includes('#')) return formatted;
    return `${formatted || `${playerName}'s game`} #${hostRoomNumber}`;
  }, [
    snapshot.accessToken,
    snapshot.displayName,
    snapshot.username,
    hostRoomNumber,
    messages.home?.defaultRoomName,
  ]);

  const [form, setForm] = useState<CreateRoomForm>(() =>
    initialForm(urlGameId, urlVariant, snapshot.equippedGameSkinId),
  );
  const [customRoomName, setCustomRoomName] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);

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
      if (next.themeId) params.set('theme', next.themeId);
      else params.delete('theme');
      params.delete('variant');
      router.replace(`${routes.games}/create?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams, routes.games],
  );

  // Keep the URL shareable: always reflect the chosen theme.
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

  const setTheme = useCallback(
    (themeId: string) => {
      setForm((prev) => ({ ...prev, themeId }));
      updateUrl({ gameId: form.gameId, themeId });
    },
    [form.gameId, updateUrl],
  );

  const cycleTheme = useCallback(() => {
    const themes = themesFor(form.gameId);
    if (themes.length <= 1) return;
    const idx = themes.findIndex((t) => t.id === form.themeId);
    const next = themes[(idx + 1) % themes.length];
    if (next?.id) setTheme(next.id);
  }, [form.gameId, form.themeId, setTheme]);

  const changeGame = useCallback(
    (gameId: GameId) => {
      if (gameId === form.gameId) return;
      const next = switchGame(form, gameId);
      setForm(next);
      updateUrl({ gameId, themeId: next.themeId });
    },
    [form, updateUrl],
  );

  const patchForm = useCallback((patch: FormPatch) => {
    if (patch.roomName !== undefined) setCustomRoomName(patch.roomName);
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPresetChoice = useCallback(
    (preset: Exclude<PresetId, 'custom'>) => {
      setForm((prev) => applyGamePreset(prev, preset));
    },
    [],
  );

  const setRules = useCallback((rules: CreateRoomForm['rules']) => {
    setForm((prev) => ({ ...prev, rules, preset: 'custom' }));
  }, []);

  const setPacks = useCallback((expansionPackIds: string[]) => {
    setForm((prev) => ({ ...prev, expansionPackIds }));
  }, []);

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [catalogFailed, setCatalogFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog({ token: snapshot.accessToken || undefined })
      .then((d) => {
        if (!cancelled) setCatalog(d);
      })
      .catch(() => {
        if (!cancelled) setCatalogFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot.accessToken]);
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
  const nameError = validateRoomName(activeRoomName);
  const isValid = nameError === null;

  const {
    mutate: submit,
    isLoading: loading,
    error: mutationError,
  } = useMutation({
    mutationFn: async () =>
      gamesApi.createRoom(
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
      ),
    onSuccess: async (data) => {
      triggerRefresh(['games', 'rooms']);
      if (!data?.room?.id) return;
      trackSocialRoomCreated(form.gameId);

      const inviteUserId = searchParams?.get('inviteUser');
      if (inviteUserId && snapshot.accessToken) {
        try {
          await gamesApi.invitePlayers(data.room.id, [inviteUserId], {
            token: snapshot.accessToken,
          });
        } catch {
          // Non-critical: the room is still created.
        }
      }

      let roomUrl = routes.gameRoom(data.room.id);
      if (data.room.inviteCode) {
        roomUrl += `?inviteCode=${encodeURIComponent(data.room.inviteCode)}`;
      }
      router.push(roomUrl);
    },
  });

  const handleSubmit = useCallback(() => {
    setNameTouched(true);
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

  return {
    form: currentForm,
    defaultRoomName,
    hostRoomNumber,
    patchForm,
    changeGame,
    setTheme,
    cycleTheme,
    applyPresetChoice,
    setRules,
    setPacks,
    gameComingSoon,
    ruleComingSoon,
    catalogFailed,
    blocked,
    nameError,
    nameTouched,
    markNameTouched: () => setNameTouched(true),
    isValid,
    loading,
    error: mutationError?.message ?? null,
    submit: handleSubmit,
  };
}
